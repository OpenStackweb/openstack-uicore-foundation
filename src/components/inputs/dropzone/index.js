import React from 'react'
import extend from 'extend'
import 'dropzone/dist/dropzone.css';
import {Icon} from './icon'
import PropTypes from 'prop-types';
import {getAccessToken, initLogOut} from '../../security/methods';
import {AUTH_ERROR_REFRESH_TOKEN_NETWORK_ERROR} from '../../security/constants';
import {getMD5} from "../../../utils/crypto";

let Dropzone = null;
/**
 * class DropzoneJS
 */
export class DropzoneJS extends React.Component {

    constructor(props) {
        super(props);
        this.dropzoneRef = React.createRef();
        this.state = {files: []};
        this.onUploadComplete = this.onUploadComplete.bind(this);
        this.onError = this.onError.bind(this);
        this.activeXHRs = new Map(); // Track active XHR requests per file
        this.chunkQueue = [];
        this.chunksInFlight = 0;
        // Checked by every in-flight pollUploadStatus loop so unmount stops all of them.
        this._unmounted = false;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Stops the status polling loop started by pollUploadStatus for this file, if any.
     * Cancelling an upload has to reach the loop too: a file the user removed while the
     * server was still processing it must stop asking for its status, otherwise the result
     * lands later and gets committed as if the upload had been kept.
     */
    stopPolling(file) {
        if (!file) return;
        file._pollingActive = false;
    }

    onError(e, status){
        if(this.props.onError)
            this.props.onError(e, status, this.props.id);
    }

    // this.dropzone may already be dropzone.destroy()'s return value (an Array,
    // not the Dropzone instance) if a poll tick resolves after unmount.
    reportPollingError(file, message) {
        if (typeof this.dropzone?.emit === 'function') {
            this.dropzone.emit('error', file, message);
        } else {
            this.onError(message);
        }
    }

    onUploadComplete(response){
        if(this.props.onUploadComplete)
            this.props.onUploadComplete(response, this.props.id, this.props.data);
    }

    processChunkQueue() {
        const maxConcurrent = this.props.maxConcurrentChunks || 6;
        while (this.chunkQueue.length > 0 && this.chunksInFlight < maxConcurrent) {
            const { files, dataBlocks } = this.chunkQueue.shift();
            this.chunksInFlight++;
            this._originalUploadData(files, dataBlocks);
        }
    }

    setupChunkThrottle() {
        if (!this.dropzone || !this.dropzone._uploadData) return;
        // Wrap _uploadData to queue chunked uploads with concurrency limit
        this._originalUploadData = this.dropzone._uploadData.bind(this.dropzone);
        this.dropzone._uploadData = (files, dataBlocks) => {
            // Tag the file so 'sending' below only releases a slot for requests that took one.
            const isThrottledChunk = dataBlocks.length === 1 && dataBlocks[0].chunkIndex !== undefined;
            files.forEach(file => { file._isThrottledChunk = isThrottledChunk; });
            if (isThrottledChunk) {
                this.chunkQueue.push({ files, dataBlocks });
                this.processChunkQueue();
            } else {
                // Non-chunked uploads bypass the queue
                this._originalUploadData(files, dataBlocks);
            }
        };
    }

    onChunkComplete() {
        this.chunksInFlight = Math.max(0, this.chunksInFlight - 1);
        this.processChunkQueue();
    }

    async pollUploadStatus(fileId, baseUrl, file) {
        // Guard against multiple polling loops for the same file
        if (file._pollingActive) {
            return;
        }
        file._pollingActive = true;

        // fileId is interpolated straight into the URL path, so it must be encoded even
        // when the server sanitizes it - defends against any unsafe character reaching here.
        const statusUrl = `${baseUrl}/status/${encodeURIComponent(fileId)}`;
        const maxAttempts = 300; // 10 minutes at 2s intervals
        let attempts = 0;

        // A self-scheduling loop (not setInterval) keeps only one request in flight at a time.
        while (true) {
            await this.sleep(2000);

            // The file may have been removed, or the component unmounted, since the last check.
            if (file._canceled || this._unmounted) {
                this.stopPolling(file);
                return;
            }
            attempts++;
            if (attempts > maxAttempts) {
                this.stopPolling(file);
                this.reportPollingError(file, 'Upload timed out');
                return;
            }
            try {
                const accessToken = await getAccessToken();
                const response = await fetch(statusUrl, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                if (!response.ok) {
                    this.stopPolling(file);
                    // Don't report an error for a file the user already removed, or after unmount.
                    if (!file._canceled && !this._unmounted) {
                        this.reportPollingError(file, response.status === 403 ? 'Auth error' : 'Network error');
                    }
                    return;
                }
                const data = await response.json();
                // This request was already awaiting its response when the user cancelled
                // (or the component unmounted), and committing it now would restore a file
                // they removed.
                if (file._canceled || this._unmounted) {
                    this.stopPolling(file);
                    return;
                }
                if (data.status === 'complete') {
                    this.stopPolling(file);
                    // Call the stored done callback to trigger Dropzone's success event
                    if (file?._chunksUploadedDone) {
                        file._chunksUploadedDone();
                    }
                    this.onUploadComplete(data);
                    return;
                } else if (data.status === 'error') {
                    this.stopPolling(file);
                    this.reportPollingError(file, data.message || 'Upload failed');
                    return;
                }
                // any other status (e.g. 'uploading') means keep polling
            } catch (error) {
                this.stopPolling(file);
                // fetch fail is always connection error
                this.reportPollingError(file, 'Network error');
                return;
            }
        }
    }

    /**
     * Configuration of Dropzone.js. Defaults are
     * overriden by the 'djsConfig' property
     * For a full list of possible configurations,
     * please consult
     * http://www.dropzonejs.com/#configuration
     */
    getDjsConfig () {
        let options = null;
        const defaults = {
            url: this.props.config.postUrl ? this.props.config.postUrl : null,
        };

        if(defaults.url === null) throw new Error("missing postUrl");

        if (this.props.djsConfig) {
            options = extend(true, {}, defaults, this.props.djsConfig)
        } else {
            options = defaults
        }

        options.accept = async (file, done) => {
            // see https://github.com/dropzone/dropzone/blob/f50d1828ab5df79a76be00d1306cc320e39a27f4/src/options.js#L405
            try {
                file.accessToken = await getAccessToken();
                // IMPORTANT: compute once BEFORE upload starts
                file.md5 = await getMD5(file);
                file.fileSize = file.size;
            } catch (e) {
                console.log(e);
                this.onError(e);
                // only logout on genuine auth errors, not transient network failures
                if (!e.message || !e.message.startsWith(AUTH_ERROR_REFRESH_TOKEN_NETWORK_ERROR)) {
                    initLogOut();
                }
                done(e.message || 'Auth error');
                return;
            }
            if (options.maxFiles && options.maxFiles < (this.state.files.length + this.props.uploadCount)) {
                done('Max files reached.');
                return;
            }

            done();
        };

        // Override chunksUploaded to defer success event for async processing (HTTP 202)
        options.chunksUploaded = (file, done) => {
            if (file._asyncProcessing) {
                // Store the done callback for later execution after polling completes
                file._chunksUploadedDone = done;
                return;
            }
            // For synchronous uploads (HTTP 200), call done immediately
            done();
        };

        return options
    }

    /**
     * React 'componentDidMount' method
     * Sets up dropzone.js with the component.
     */
    componentDidMount () {
        if(!this.dropzoneRef.current) return;
        const options = this.getDjsConfig();

        Dropzone = Dropzone || require('dropzone');
        Dropzone.autoDiscover = false;

        if (!this.props.config.postUrl && !this.props.eventHandlers.drop) {
            console.info('Neither postUrl nor a "drop" eventHandler specified, the React-Dropzone component might misbehave.')
        }

        const dropzoneNode = this.dropzoneRef.current;
        if (!dropzoneNode) throw new Error("Dropzone node not found");

        this.dropzone = new Dropzone(dropzoneNode, options);
        this.setupChunkThrottle();
        this.setupEvents()
    }

    /**
     * React 'componentWillUnmount'
     * Removes dropzone.js (and all its globals) if the component is being unmounted
     */
    componentWillUnmount () {
        this._unmounted = true;

        // Clear chunk queue and cancel all pending XHR requests
        this.chunkQueue = [];
        this.chunksInFlight = 0;
        this.activeXHRs.forEach((xhrs, file) => {
            xhrs.forEach(xhr => {
                if (xhr.readyState !== XMLHttpRequest.DONE) {
                    xhr.abort();
                }
            });
        });
        this.activeXHRs.clear();

        if (this.dropzone) {
            const files = this.dropzone.getActiveFiles();

            if (files.length > 0) {
                // Cancel active uploads before destroying
                files.forEach(file => {
                    this.dropzone.cancelUpload(file);
                });

                this.dropzone = this.destroy(this.dropzone);
            } else {
                this.dropzone = this.destroy(this.dropzone)
            }
        }
    }

    /**
     * React 'componentDidUpdate'
     * If the Dropzone hasn't been created, create it
     */
    componentDidUpdate (prevProps) {
        const {config, djsConfig} = this.props;
        this.queueDestroy = false;

        if (!this.dropzone) {
            const dropzoneNode = this.dropzoneRef.current;
            if (!dropzoneNode) throw new Error("Dropzone node not found");
            this.dropzone = new Dropzone(dropzoneNode, this.getDjsConfig());
            this.setupChunkThrottle();
            this.setupEvents();
            return;
        }

        // Re-merging options deep-clones the whole dropzone.options object (including the
        // accept/chunksUploaded closures) and re-runs on every parent re-render. During a
        // chunked upload the parent re-renders on every progress tick, so skip the merge
        // when djsConfig/postUrl haven't actually changed.
        if (prevProps.djsConfig === djsConfig && prevProps.config?.postUrl === config?.postUrl) {
            return;
        }

        const djsConfigObj = djsConfig ? djsConfig : {};
        const postUrlConfigObj = config && config.postUrl ? { url: config.postUrl } : {};
        this.dropzone.options = extend(true, {}, this.dropzone.options, djsConfigObj, postUrlConfigObj);
    }

    /**
     * React 'render'
     */
    render () {
        const icons = [];
        const { files } = this.state;
        const { config } = this.props;
        const className = (this.props.className) ? 'filepicker dropzone ' + this.props.className : 'filepicker dropzone';

        if (config.showFiletypeIcon && config.iconFiletypes && (!files || files.length < 1)) {
            for (var i = 0; i < this.props.config.iconFiletypes.length; i = i + 1) {
                icons.push(<Icon filetype={config.iconFiletypes[i]} key={'icon-component' + i} />)
            }
        }

        if (!this.props.config.postUrl && this.props.action) {
            return (
                <form ref={this.dropzoneRef} action={this.props.action} className={className}>
                    {icons}
                    {this.props.children}
                </form>
            );
        } else {
            return (
                <div ref={this.dropzoneRef} id={this.props.id} className={className}> {icons} {this.props.children} </div>
            );
        }
    }

    /**
     * Takes event handlers in this.props.eventHandlers
     * and binds them to dropzone.js events
     */
    setupEvents () {
        const eventHandlers = this.props.eventHandlers;

        if (!this.dropzone || !eventHandlers) return;

        for (var eventHandler in eventHandlers) {
            if (eventHandlers.hasOwnProperty(eventHandler) && eventHandlers[eventHandler]) {
                // Check if there's an array of event handlers
                if (Object.prototype.toString.call(eventHandlers[eventHandler]) === '[object Array]') {
                    for (var i = 0; i < eventHandlers[eventHandler].length; i = i + 1) {
                        // Check if it's an init handler
                        if (eventHandler === 'init') {
                            eventHandlers[eventHandler][i](this.dropzone)
                        } else {
                            this.dropzone.on(eventHandler, eventHandlers[eventHandler][i])
                        }
                    }
                } else {
                    if (eventHandler === 'init') {
                        eventHandlers[eventHandler](this.dropzone)
                    } else {
                        this.dropzone.on(eventHandler, eventHandlers[eventHandler])
                    }
                }
            }
        }

        /*
         * see https://docs.dropzone.dev/configuration/events
         * see https://github.com/dropzone/dropzone/blob/main/src/options.js#L574
         */
        this.dropzone.on('addedfile', async (file) => {
            if (!file) return;

            const files = this.state.files || [];

            files.push(file);
            this.setState({ files })
        });

        this.dropzone.on('removedfile', (file) => {
            if (!file) return;

            // Mark the file dead FIRST: both commit points (xhr.onload below and the status
            // poll) check this flag, so a result that lands after the user cancelled is
            // dropped instead of being pushed to the parent.
            file._canceled = true;
            this.stopPolling(file);
            // A removed file must not fire Dropzone's deferred success event either.
            file._chunksUploadedDone = null;

            // Cancel all active XHR requests for this file
            const xhrs = this.activeXHRs.get(file);
            if (xhrs) {
                xhrs.forEach(xhr => {
                    if (xhr.readyState !== XMLHttpRequest.DONE) {
                        xhr.abort();
                    }
                });
                this.activeXHRs.delete(file);
            }

            const files = this.state.files || [];
            files.forEach((fileInFiles, i) => {
                if (fileInFiles.name === file.name && fileInFiles.size === file.size) {
                    files.splice(i, 1)
                }
            });

            this.setState({ files })
        });

        this.dropzone.on('uploadprogress', (file, progress, bytesSent) => {
            // Use completed bytes as floor to prevent progress oscillation. With
            // parallelChunkUploads, dropzone's own bytesSent sums total/bytesSent across every
            // chunk it has created, including ones still queued behind maxConcurrentChunks
            // (setupChunkThrottle above) whose total/bytesSent are still undefined - that makes
            // bytesSent NaN, and Math.max(NaN, x) is NaN, so it must be coerced first.
            const safeBytesSent = Number.isFinite(bytesSent) ? bytesSent : 0;
            const effectiveBytes = Math.max(safeBytesSent, file._completedBytes || 0);
            progress = Math.min(effectiveBytes / file.size * 100, 100);
            if(file.previewElement) {
                let elem = file.previewElement.querySelectorAll("[data-dz-uploadprogress]");

                if(elem.length > 0)
                    elem = elem[0];

                if (elem)
                    elem.style.width = progress + "%";
            }
        });

        this.dropzone.on('sending', (file, xhr, formData) => {
            if(file?.accessToken)
                xhr.setRequestHeader('Authorization', `Bearer ${file.accessToken}`);

            // synchronous append (this WILL be included)
            if (file?.md5)
                formData.append('md5', file.md5);

            formData.append('size', String(file?.size || 0));
            console.log(`DropzoneJS::sending md5 ${file?.md5} size ${file?.size}`);

            // Track active XHR for cancellation support
            if (!this.activeXHRs.has(file)) {
                this.activeXHRs.set(file, []);
            }
            this.activeXHRs.get(file).push(xhr);

            let _this = this;
            // This will track all request so we can get the correct request that returns final response:
            // We will change the load callback but we need to ensure that we will call original
            // load callback from dropzone
            let dropzoneOnLoad = xhr.onload;
            xhr.onload = function (e) {
                // Remove this XHR from active tracking
                const xhrs = _this.activeXHRs.get(file);
                if (xhrs) {
                    const index = xhrs.indexOf(xhr);
                    if (index > -1) xhrs.splice(index, 1);
                }

                // Release a slot only if this request actually took one from the queue.
                if (file._isThrottledChunk) {
                    _this.onChunkComplete();
                }

                // Track completed bytes for accurate progress (prevents oscillation)
                const chunkSize = _this.dropzone?.options?.chunkSize || 2000000;
                file._completedBytes = Math.min(
                    (file._completedBytes || 0) + chunkSize, file.size
                );

                // Parse response once
                let uploadResponse;
                try { uploadResponse = JSON.parse(xhr.responseText); } catch(ex) { uploadResponse = {}; }

                // Set async flag BEFORE dropzoneOnLoad so chunksUploaded sees it
                if (xhr?.status == 202 && uploadResponse.file_id) {
                    file._asyncProcessing = true;
                }

                dropzoneOnLoad(e);

                // The user may have cancelled while this response was in flight: abort() on an
                // already-DONE xhr is a no-op, so without this check the result would still be
                // committed for a file that is no longer in the list. 'canceled' is the value of
                // Dropzone.CANCELED, compared as a literal so the guard does not depend on the
                // Dropzone module being loaded.
                if (file._canceled || file.status === 'canceled') return;

                if(xhr?.status == 200) {
                    if (typeof uploadResponse.name === 'string') {
                        _this.onUploadComplete(uploadResponse);
                    }
                }
                else if(xhr?.status == 202 && uploadResponse.file_id) {
                    const baseUrl = _this.props.config.postUrl;
                    _this.pollUploadStatus(uploadResponse.file_id, baseUrl, file);
                }
                else if(xhr?.status != 200 && xhr?.status != 202){
                    _this.onError(uploadResponse, xhr?.status);
                }

            }

            let dropzoneOnError = xhr.onerror;
            xhr.onerror = function(e) {
                if (file._isThrottledChunk) {
                    _this.onChunkComplete();
                }
                if (dropzoneOnError) dropzoneOnError(e);
            }

            // Without this wrapper a timed-out chunk never releases its concurrency slot.
            let dropzoneOnTimeout = xhr.ontimeout;
            xhr.ontimeout = function(e) {
                if (file._isThrottledChunk) {
                    _this.onChunkComplete();
                }
                if (dropzoneOnTimeout) dropzoneOnTimeout(e);
            }
        })

        // xhr.status is 0 for a transport failure, vs a real non-2xx server response.
        this.dropzone.on('error', (file, message, xhr) => {
            console.log(`DropzoneJS::error`, message);
            this.onError(message, xhr?.status);
        });
    }

    /**
     * Removes ALL listeners and Destroys dropzone. see https://github.com/enyo/dropzone/issues/1175
     */
    destroy (dropzone) {
        dropzone.off();
        return dropzone.destroy()
    }
}

DropzoneJS.defaultProps = {
    djsConfig: {},
    config: {},
    eventHandlers: {},
    data: {},
};

DropzoneJS.propTypes = {
    id: PropTypes.string.isRequired
};

export default DropzoneJS;
