import React from 'react'
import extend from 'extend'
import 'dropzone/dist/dropzone.css';
import {Icon} from './icon'
import PropTypes from 'prop-types';
import {getAccessToken, initLogOut} from '../../security/methods';
import {AUTH_ERROR_REFRESH_TOKEN_NETWORK_ERROR} from '../../security/constants';
import {getMD5} from "../../../utils/crypto";
import {
    getOrCreateUploadLedger,
    acknowledgeChunk,
    isChunkAcknowledged,
    markCorrectionAttempted,
    clearLedger,
    UPLOAD_LEDGER_TTL_MS,
} from "./upload-ledger";

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
        // Status-poll interval ids, one per file in flight. Kept as a set (and mirrored on
        // the file itself) rather than a single slot so a second file starting to poll
        // cannot orphan the first one's interval.
        this._pollIntervals = new Set();
    }

    /**
     * Stops the status polling started by pollUploadStatus for this file, if any.
     * Cancelling an upload has to reach the interval too: a file the user removed while the
     * server was still processing it must stop asking for its status, otherwise the result
     * lands later and gets committed as if the upload had been kept.
     */
    stopPolling(file) {
        if (!file) return;
        if (file._pollIntervalId) {
            clearInterval(file._pollIntervalId);
            this._pollIntervals.delete(file._pollIntervalId);
            file._pollIntervalId = null;
        }
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
            // Only throttle chunked uploads (single dataBlock with chunkIndex)
            if (dataBlocks.length === 1 && dataBlocks[0].chunkIndex !== undefined) {
                const [file] = files;
                const chunkIndex = dataBlocks[0].chunkIndex;
                // A resumed chunk the server already acked is resolved here, before it
                // ever takes a concurrency slot - never queued, never sent over the wire.
                if (isChunkAcknowledged(file._resumeLedger, chunkIndex)) {
                    this.skipAcknowledgedChunk(file, chunkIndex);
                    return;
                }
                this.chunkQueue.push({ files, dataBlocks });
                this.processChunkQueue();
            } else {
                // Non-chunked uploads bypass the queue
                this._originalUploadData(files, dataBlocks);
            }
        };
    }

    // Synthesizes a successful chunk without a network round-trip, using Dropzone's own
    // finishedChunkUpload to drive its native chunk state machine (next chunk / chunksUploaded)
    // exactly as a real success would.
    skipAcknowledgedChunk(file, chunkIndex) {
        const chunk = file.upload?.chunks?.[chunkIndex];
        if (!chunk) return;
        file._resumeSkippedThisAttempt = true;
        const chunkSize = this.dropzone?.options?.chunkSize || 2000000;
        file._completedBytes = Math.min((file._completedBytes || 0) + chunkSize, file.size);
        file.upload.finishedChunkUpload(chunk);
    }

    onChunkComplete() {
        this.chunksInFlight = Math.max(0, this.chunksInFlight - 1);
        this.processChunkQueue();
    }

    clearResumeLedger(file) {
        clearLedger(this.props.id, file.md5, file.size);
        file._resumeLedger = null;
    }

    pollUploadStatus(fileId, baseUrl, file) {
        // Guard against multiple polling intervals for the same file
        if (file._pollingActive) {
            return;
        }
        file._pollingActive = true;

        // fileId is interpolated straight into the URL path, so it must be encoded even
        // when the server sanitizes it - defends against any unsafe character reaching here.
        const statusUrl = `${baseUrl}/status/${encodeURIComponent(fileId)}`;
        const maxAttempts = 300; // 10 minutes at 2s intervals
        let attempts = 0;

        const intervalId = setInterval(async () => {
            // The file may have been removed since the last tick.
            if (file._canceled) {
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
                    this.reportPollingError(file, 'Network error');
                    return;
                }
                const data = await response.json();
                // Clearing the interval is not enough on its own: this tick was already
                // awaiting its response when the user cancelled, and committing it now
                // would restore a file they removed.
                if (file._canceled) {
                    this.stopPolling(file);
                    return;
                }
                if (data.status === 'complete') {
                    this.stopPolling(file);
                    if (file._resumeLedger) this.clearResumeLedger(file);
                    // Call the stored done callback to trigger Dropzone's success event
                    if (file?._chunksUploadedDone) {
                        file._chunksUploadedDone();
                    }
                    this.onUploadComplete(data);
                } else if (data.status === 'error') {
                    this.stopPolling(file);
                    this.reportPollingError(file, data.message || 'Upload failed');
                }
            } catch (error) {
                this.stopPolling(file);
                // fetch fail is always connection error
                this.reportPollingError(file, 'Network error');
            }
        }, 2000);

        file._pollIntervalId = intervalId;
        this._pollIntervals.add(intervalId);
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

            // A retried File (removeFile + addFile) keeps whatever these were set to on its
            // previous failed pass - addFile/removeFile never clear custom properties.
            file._asyncProcessing = false;
            file._chunksUploadedDone = null;
            file._resumeSkippedThisAttempt = false;

            if (options.chunking) {
                const chunkSize = options.chunkSize || 2000000;
                const totalChunks = Math.ceil(file.size / chunkSize) || 1;
                const ledger = getOrCreateUploadLedger(
                    this.props.id, file.md5, file.size, chunkSize, totalChunks,
                    this.props.resumeLedgerTtlMs || UPLOAD_LEDGER_TTL_MS
                );
                // Overwrites Dropzone's own randomly-generated dzuuid (already set by
                // addFile() before accept() ever runs) with our persisted, stable one -
                // the only thing that lets a retry reuse the server's in-progress upload.
                file.upload.uuid = ledger.uploadId;
                file._resumeLedger = ledger;

                if (ledger.ackedChunks.length > 0) {
                    const acknowledgedBytes = Math.min(ledger.ackedChunks.length * chunkSize, file.size);
                    file._completedBytes = acknowledgedBytes;
                    // Reuses the existing uploadprogress bridge so a resumed row shows its
                    // real starting percentage immediately, with no new event/plumbing.
                    if (typeof this.dropzone.emit === 'function') {
                        this.dropzone.emit(
                            'uploadprogress', file, (acknowledgedBytes / file.size) * 100, acknowledgedBytes
                        );
                    }
                }
            }

            done();
        };

        // Override chunksUploaded to defer success event for async processing (HTTP 202)
        options.chunksUploaded = (file, done) => {
            // Every local chunk succeeded (real or resume-skipped) but the file never got
            // a real 202 - proof a skipped chunk wasn't actually held by the server. The
            // ledger's belief was wrong, not just incomplete: self-correct, bounded to one
            // retry under the same id, then one clean full upload under a fresh id - never
            // loop, and never surface this to the user, since a clean pass can't skip
            // anything and so can't re-trigger this branch.
            if (file._resumeLedger && file._resumeSkippedThisAttempt && !file._asyncProcessing) {
                file._resumeSkippedThisAttempt = false;
                file._completedBytes = 0;
                if (!file._resumeLedger.correctionAttempted) {
                    file._resumeLedger = markCorrectionAttempted(file._resumeLedger);
                } else {
                    const chunkSize = file._resumeLedger.chunkSize;
                    const totalChunks = file._resumeLedger.totalChunks;
                    this.clearResumeLedger(file);
                    file._resumeLedger = getOrCreateUploadLedger(
                        this.props.id, file.md5, file.size, chunkSize, totalChunks,
                        this.props.resumeLedgerTtlMs || UPLOAD_LEDGER_TTL_MS
                    );
                    file.upload.uuid = file._resumeLedger.uploadId;
                }
                this.dropzone.uploadFiles([file]);
                return;
            }
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
        this._pollIntervals.forEach(intervalId => clearInterval(intervalId));
        this._pollIntervals.clear();

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
                // Resolved BEFORE dropzoneOnLoad: on a successful chunked response, Dropzone's
                // native finishedChunkUpload (called from within dropzoneOnLoad) nulls
                // chunk.xhr, so _getChunk can no longer find it afterwards.
                const chunk = (file?.upload?.chunked && _this.dropzone?._getChunk)
                    ? _this.dropzone._getChunk(file, xhr)
                    : null;

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

                // Acknowledge only on a real 200/202 - never on a connection failure (status 0,
                // xhr.onerror/ontimeout below), so an unacknowledged chunk always gets re-sent
                // on the next resume, which is safe because the server dedups a held chunk.
                if (chunk && (xhr?.status === 200 || xhr?.status === 202) && file._resumeLedger) {
                    acknowledgeChunk(file._resumeLedger, chunk.index);
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
                        if (file._resumeLedger) _this.clearResumeLedger(file);
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

            // Without this wrapper a timed-out chunk never releases its concurrency slot.
            let dropzoneOnTimeout = xhr.ontimeout;
            xhr.ontimeout = function(e) {
                _this.onChunkComplete();
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
