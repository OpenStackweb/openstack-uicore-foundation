/**
 * Copyright 2017 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import React from 'react';
import Dropzone from 'react-dropzone';
import T from 'i18n-react/dist/i18n-react';
import './upload.less';

import file_icon from './file.png';
import pdf_icon from './pdf.png';
import mov_icon from './mov.png';
import mp4_icon from './mp4.png';
import csv_icon from './csv.png';

export default class UploadInput extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            show_remove: false,
            logo_preview: {
                preview: null,
                name: '',
            },
        }

        this.fileHasPreview = this.fileHasPreview.bind(this);
    }

    onDrop(acceptedFiles, fileRejections, evt) {        
        if(acceptedFiles.length > 0) {
            let file = acceptedFiles[0];
            this.props.handleUpload(file, this.props);
            this.setState({
                    ...this.state,
                    logo_preview:
                    {
                        preview: this.fileHasPreview(file.name) ? file.preview: null,
                        name: file.name
                    }
                })
        }
        if(fileRejections.length > 0 && this.props.hasOwnProperty("handleError"))
            this.props.handleError(fileRejections, this.props)
    }

    onRemove(ev){
        this.props.handleRemove(ev, this.props);
    }

    showVeil() {
        this.setState({...this.state, show_remove:true});
    }

    hideVeil() {
        this.setState({...this.state, show_remove:false});
    }

    fileHasPreview(fileName){
        if(!fileName) return false;
        let pattern = /(.*)\.(gif|bmp|svg|jpe?g|png)/g
        return pattern.test(fileName);
    }

    render() {
        let {value, file, handleRemove, handleUpload, handleError, fileName, error, ...rest} = this.props;
        let {logo_preview, show_remove} = this.state;
        let has_error = ( this.props.hasOwnProperty('error') && error !== '' );
        // default value ( resource )
        let icon = file_icon;

        if (value) {
            if(!fileName) fileName = value.slice(value.lastIndexOf("/") + 1);
        }

        if (file && file.hasOwnProperty("name") && file.name) {
            fileName = file.name;
        }

         // files without preview
        icon =  (fileName && fileName.endsWith('pdf') ? pdf_icon: icon);
        icon =  (fileName && fileName.endsWith('mov') ? mov_icon: icon);
        icon =  (fileName && fileName.endsWith('mp4') ? mp4_icon: icon);
        icon =  (fileName && fileName.endsWith('csv') ? csv_icon: icon);

        // if file has preview ( already on data model)
        if(this.fileHasPreview(fileName) && value){
            icon = value
        }

        if (logo_preview.preview && logo_preview.name) {
            icon = logo_preview.preview;
            fileName = logo_preview.name;
        }

        return (
            <div className="file-upload">
                <Dropzone
                    onDrop={this.onDrop.bind(this)}
                    {...rest}
                >
                <div>{T.translate("general.drop_files")}</div>
                </Dropzone>
                <div className="selected-files-box col-md-6">
                    <p>Selected Files</p>
                    <div className="selected-files">
                        {value &&
                        <div className="file-box" onMouseEnter={this.showVeil.bind(this)} onMouseLeave={this.hideVeil.bind(this)}>
                            <img src={icon} />
                            <a href={value} target="_blank">{fileName}</a>
                            {show_remove &&
                            <div className="remove" onClick={this.onRemove.bind(this)}>
                                <i className="fa fa-times"></i>
                            </div>
                            }
                        </div>
                        }
                        {has_error &&
                        <p className="error-label">{error}</p>
                        }
                    </div>
                </div>
            </div>
        )
    }
}
