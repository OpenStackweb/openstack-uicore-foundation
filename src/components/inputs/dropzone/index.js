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
    }

    onError(e, status){
        if(this.props.onError)
            this.props.onError(e, status, this.props.id);
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
            // Only throttle chunked uploads (single dataBlock with chunkIndex)
            if (dataBlocks.length === 1 && dataBlocks[0].chunkIndex !== undefined) {
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

    pollUploadStatus(fileId, baseUrl, file) {
        // Guard against multiple polling intervals for the same file
        if (file._pollingActive) {
            return;
        }
        file._pollingActive = true;

        const statusUrl = `${baseUrl}/status/${fileId}`;
        const maxAttempts = 300; // 10 minutes at 2s intervals
        let attempts = 0;

        this._pollInterval = setInterval(async () => {
            attempts++;
            if (attempts > maxAttempts) {
                clearInterval(this._pollInterval);
                this._pollInterval = null;
                file._pollingActive = false;
                this.onError({ message: 'Upload timed out' });
                return;
            }
            try {
                const accessToken = await getAccessToken();
                const response = await fetch(statusUrl, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                const data = await response.json();
                if (data.status === 'complete') {
                    clearInterval(this._pollInterval);
                    this._pollInterval = null;
                    file._pollingActive = false;
                    // Call the stored done callback to trigger Dropzone's success event
                    if (file?._chunksUploadedDone) {
                        file._chunksUploadedDone();
                    }
                    this.onUploadComplete(data);
                } else if (data.status === 'error') {
                    clearInterval(this._pollInterval);
                    this._pollInterval = null;
                    file._pollingActive = false;
                    this.onError(data);
                }
            } catch (error) {
                clearInterval(this._pollInterval);
                this._pollInterval = null;
                file._pollingActive = false;
                this.onError(error);
            }
        }, 2000);
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
        if (this._pollInterval) {
            clearInterval(this._pollInterval);
            this._pollInterval = null;
        }

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
    componentDidUpdate () {
        const {config, djsConfig} = this.props;
        const djsConfigObj = djsConfig ? djsConfig : {};
        const postUrlConfigObj = config && config.postUrl ? { url: config.postUrl } : {};
        this.queueDestroy = false;

        if (!this.dropzone) {
            const dropzoneNode = this.dropzoneRef.current;
            if (!dropzoneNode) throw new Error("Dropzone node not found");
            this.dropzone = new Dropzone(dropzoneNode, this.getDjsConfig());
            this.setupChunkThrottle();
            this.setupEvents();
        }

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
            // Use completed bytes as floor to prevent progress oscillation
            const effectiveBytes = Math.max(bytesSent, file._completedBytes || 0);
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

                // Release a slot in the chunk queue for the next chunk
                _this.onChunkComplete();

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
                _this.onChunkComplete();
                if (dropzoneOnError) dropzoneOnError(e);
            }
        })

        this.dropzone.on('error', (file, message) => {
            console.log(`DropzoneJS::error`, message);
            this.onError(message);
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
