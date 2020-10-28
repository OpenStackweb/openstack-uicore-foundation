import React from 'react'
import ReactDOM from 'react-dom'
import extend from 'extend'
import 'dropzone/dist/dropzone.css';
import './index.less';
import { Icon } from './icon'
import PropTypes from 'prop-types';

let Dropzone = null
/**
 * class DropzoneJS
 */
export class DropzoneJS extends React.Component {

    constructor(props) {
        super(props)
        this.state = {files: []}
        this.onUploadComplete = this.onUploadComplete.bind(this);
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
        let options = null
        const defaults = {
            url: this.props.config.postUrl ? this.props.config.postUrl : null
        }

        if (this.props.djsConfig) {
            options = extend(true, {}, defaults, this.props.djsConfig)
        } else {
            options = defaults
        }

        return options
    }

    /**
     * React 'componentDidMount' method
     * Sets up dropzone.js with the component.
     */
    componentDidMount () {
        const options = this.getDjsConfig()

        Dropzone = Dropzone || require('dropzone')
        Dropzone.autoDiscover = false

        if (!this.props.config.postUrl && !this.props.eventHandlers.drop) {
            console.info('Neither postUrl nor a "drop" eventHandler specified, the React-Dropzone component might misbehave.')
        }

        var dropzoneNode = this.props.config.dropzoneSelector || ReactDOM.findDOMNode(this)
        this.dropzone = new Dropzone(dropzoneNode, options);

        this.setupEvents()
    }

    /**
     * React 'componentWillUnmount'
     * Removes dropzone.js (and all its globals) if the component is being unmounted
     */
    componentWillUnmount () {
        if (this.dropzone) {
            const files = this.dropzone.getActiveFiles()

            if (files.length > 0) {
                // Well, seems like we still have stuff uploading.
                // This is dirty, but let's keep trying to get rid
                // of the dropzone until we're done here.
                this.queueDestroy = true

                const destroyInterval = window.setInterval(() => {
                    if (this.queueDestroy === false) {
                        return window.clearInterval(destroyInterval)
                    }

                    if (this.dropzone.getActiveFiles().length === 0) {
                        this.dropzone = this.destroy(this.dropzone)
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
        this.queueDestroy = false

        if (!this.dropzone) {
            const dropzoneNode = this.props.config.dropzoneSelector || ReactDOM.findDOMNode(this)
            this.dropzone = new Dropzone(dropzoneNode, this.getDjsConfig())
        }
    }

    /**
     * React 'componentWillUpdate'
     * Update Dropzone options each time the component updates.
     */
    componentWillUpdate () {
        let djsConfigObj
        let postUrlConfigObj

        djsConfigObj = this.props.djsConfig ? this.props.djsConfig : {}

        try {
            postUrlConfigObj = this.props.config.postUrl ? { url: this.props.config.postUrl } : {}
        } catch (err) {
            postUrlConfigObj = {}
        }

        this.dropzone.options = extend(true, {}, this.dropzone.options, djsConfigObj, postUrlConfigObj)
    }

    /**
     * React 'render'
     */
    render () {
        const icons = []
        const { files } = this.state
        const { config } = this.props
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
        const eventHandlers = this.props.eventHandlers

        if (!this.dropzone || !eventHandlers) return

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

        this.dropzone.on('addedfile', (file) => {
            if (!file) return

            const files = this.state.files || []

            files.push(file)
            this.setState({ files })
        })

        this.dropzone.on('removedfile', (file) => {
            if (!file) return

            const files = this.state.files || []
            files.forEach((fileInFiles, i) => {
                if (fileInFiles.name === file.name && fileInFiles.size === file.size) {
                    files.splice(i, 1)
                }
            })

            this.setState({ files })
        })

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
        })

        this.dropzone.on('sending' , (file, xhr, formData) => {
            if(this.props.hasOwnProperty('access_token')) {
                // oauth2 token
                formData.append("access_token", this.props.access_token);
            }
            let _this = this;
            // This will track all request so we can get the correct request that returns final response:
            // We will change the load callback but we need to ensure that we will call original
            // load callback from dropzone
            let dropzoneOnLoad = xhr.onload;
            xhr.onload = function (e) {
                dropzoneOnLoad(e);
                // Check for final chunk and get the response
                let uploadResponse = JSON.parse(xhr.responseText);
                if (typeof uploadResponse.name === 'string') {
                    _this.onUploadComplete(uploadResponse);
                }
            }
        })
    }

    /**
     * Removes ALL listeners and Destroys dropzone. see https://github.com/enyo/dropzone/issues/1175
     */
    destroy (dropzone) {
        dropzone.off()
        return dropzone.destroy()
    }
}

DropzoneJS.defaultProps = {
    djsConfig: {},
    config: {},
    eventHandlers: {},
    data: {},
}

DropzoneJS.propTypes = {
    id: PropTypes.string.isRequired
};

export default DropzoneJS;