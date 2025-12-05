import React from 'react'
import ReactDOM from 'react-dom'
import extend from 'extend'
import 'dropzone/dist/dropzone.css';
import {Icon} from './icon'
import PropTypes from 'prop-types';
import {getAccessToken, initLogOut} from '../../security/methods';
import {getMD5} from "../../../utils/crypto";

let Dropzone = null;
/**
 * class DropzoneJS
 */
export class DropzoneJS extends React.Component {

    constructor(props) {
        super(props);
        this.state = {files: []};
        this.onUploadComplete = this.onUploadComplete.bind(this);
        this.onError = this.onError.bind(this);
    }

    onError(e, status){
        if(this.props.onError)
            this.props.onError(e, status, this.props.id);
    }

    onUploadComplete(response){
        if(this.props.onUploadComplete)
            this.props.onUploadComplete(response, this.props.id, this.props.data);
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
            } catch (e) {
                console.log(e);
                this.onError(e);
                initLogOut();
            }
            if (options.maxFiles && options.maxFiles < (this.state.files.length + this.props.uploadCount)) {
                done('Max files reached.');
            }

            done();
        };

        return options
    }

    /**
     * React 'componentDidMount' method
     * Sets up dropzone.js with the component.
     */
    componentDidMount () {
        const options = this.getDjsConfig();

        Dropzone = Dropzone || require('dropzone');
        Dropzone.autoDiscover = false;

        if (!this.props.config.postUrl && !this.props.eventHandlers.drop) {
            console.info('Neither postUrl nor a "drop" eventHandler specified, the React-Dropzone component might misbehave.')
        }

        var dropzoneNode = this.props.config.dropzoneSelector || ReactDOM.findDOMNode(this);
        this.dropzone = new Dropzone(dropzoneNode, options);

        this.setupEvents()
    }

    /**
     * React 'componentWillUnmount'
     * Removes dropzone.js (and all its globals) if the component is being unmounted
     */
    componentWillUnmount () {
        if (this.dropzone) {
            const files = this.dropzone.getActiveFiles();

            if (files.length > 0) {
                // Well, seems like we still have stuff uploading.
                // This is dirty, but let's keep trying to get rid
                // of the dropzone until we're done here.
                this.queueDestroy = true;

                const destroyInterval = window.setInterval(() => {
                    if (this.queueDestroy === false) {
                        return window.clearInterval(destroyInterval)
                    }

                    if (this.dropzone.getActiveFiles().length === 0) {
                        this.dropzone = this.destroy(this.dropzone);
                        return window.clearInterval(destroyInterval)
                    }
                }, 500)
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
            const dropzoneNode = this.props.config.dropzoneSelector || ReactDOM.findDOMNode(this);
            this.dropzone = new Dropzone(dropzoneNode, this.getDjsConfig());
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
                <form action={this.props.action} className={className}>
                    {icons}
                    {this.props.children}
                </form>
            );
        } else {
            return (
                <div id={this.props.id} className={className}> {icons} {this.props.children} </div>
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

            const files = this.state.files || [];
            files.forEach((fileInFiles, i) => {
                if (fileInFiles.name === file.name && fileInFiles.size === file.size) {
                    files.splice(i, 1)
                }
            });

            this.setState({ files })
        });

        this.dropzone.on('uploadprogress', (file, progress, bytesSent) => {
            progress = bytesSent / file.size * 100;
            // https://developer.mozilla.org/es/docs/Web/API/Document/querySelector
            //let elem = document.querySelector(`#${this.props.id} .dz-upload`);
            if(file.previewElement) {
                let elem = file.previewElement.querySelectorAll("[data-dz-uploadprogress]");

                if(elem.length > 0)
                    elem = elem[0];

                if (elem)
                    elem.style.width = progress + "%";
            }
        });

        this.dropzone.on('sending', async (file, xhr, formData) => {
            if(file?.accessToken)
                xhr.setRequestHeader('Authorization', `Bearer ${file.accessToken}`);

            // send md5 + size with each request (server can use it on final chunk)
            const md5 = await getMD5(file);
            formData.append('md5', md5);
            formData.append('size', String(file.size));

            let _this = this;
            // This will track all request so we can get the correct request that returns final response:
            // We will change the load callback but we need to ensure that we will call original
            // load callback from dropzone
            let dropzoneOnLoad = xhr.onload;
            xhr.onload = function (e) {

                dropzoneOnLoad(e);
                if(xhr?.status == 200) {
                    // Check for final chunk and get the response
                    let uploadResponse = JSON.parse(xhr.responseText);
                    if (typeof uploadResponse.name === 'string') {
                        _this.onUploadComplete(uploadResponse);
                    }
                }
                else{
                    _this.onError(JSON.parse(xhr?.responseText), xhr?.status);
                }

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
