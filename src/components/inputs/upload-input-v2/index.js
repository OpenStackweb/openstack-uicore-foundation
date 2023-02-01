/**
 * Copyright 2018 OpenStack Foundation
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

import React from 'react'
import DropzoneJS from './dropzone'
import './index.less';
import file_icon from '../upload-input/file.png';
import pdf_icon from '../upload-input/pdf.png';
import mov_icon from '../upload-input/mov.png';
import mp4_icon from '../upload-input/mp4.png';
import csv_icon from '../upload-input/csv.png';
const FileNameMaxLen = 20;

export default class UploadInputV2 extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let {value, onRemove, error, mediaType, postUrl, maxFiles = 1, timeOut, onUploadComplete, djsConfig, id } = this.props;
        let has_error = ( this.props.hasOwnProperty('error') && error !== '' );
        const allowedExt = mediaType && mediaType.type ? mediaType.type.allowed_extensions.map((ext) => `.${ext.toLowerCase()}`).join(",") : '';
        const maxSize = mediaType ? mediaType.max_size / 1024 : 100;
        const canUpload = !maxFiles || value.length < maxFiles;

        const djsConfigSet = {
            paramName: "file", // The name that will be used to transfer the file,
            maxFilesize: maxSize, // MB,
            timeout: timeOut || (1000 * 60 * 10),
            chunking: true,
            retryChunks: true,
            parallelChunkUploads: false,
            addRemoveLinks: true,
            maxFiles: maxFiles,
            acceptedFiles: allowedExt,
            dropzoneSelector: `media_upload_${mediaType.id}`,
            ...djsConfig
        };
        const componentConfig = {
            showFiletypeIcon: false,
            postUrl: postUrl
        };
        const data = {
            media_type: mediaType,
            media_upload: value,
        };

        let eventHandlers = {};
        if (onRemove) {
            eventHandlers = {removedfile: onRemove};
        }

        return (
            <div className="row">
                <div className="col-md-6"  style={{height: 180}}>
                    {canUpload ? (
                        <DropzoneJS
                            id={id}
                            djsConfig={djsConfigSet}
                            config={componentConfig}
                            eventHandlers={eventHandlers}
                            data={data}
                            uploadCount={value.length}
                            onUploadComplete={onUploadComplete}
                        />
                    ) : (
                        <div className="filepicker disabled">
                            Max number of files uploaded for this type - Remove uploaded file to add new file.
                        </div>
                    )}

                </div>
                <div className="col-md-6">
                    {has_error &&
                    <p className="error-label">{error}</p>
                    }
                    {value.length > 0 &&
                        <ul className="upload-input-v2-preview-container">
                            {value.map((v,i) => {

                                let src = v.private_url || v.public_url;
                                // custom replace for dropbox case ( download vs raw)
                                src = src.replace("?dl=0","?raw=1")
                                let filename = v.filename;
                                let ext =  filename.split('.').pop();
                                let path = filename.replace(`.${ext}`, '');
                                if (path.length > FileNameMaxLen) {
                                    path = path.substring(0, FileNameMaxLen);
                                }

                                return (
                                    <li key={`uploaded-${i}`}>
                                        <span className="file-preview">
                                            <a href={src} target="_blank" title="See Preview">
                                                <img alt={v.filename}
                                                     src={src}
                                                     onError={({ currentTarget }) => {
                                                    currentTarget.onerror = null;

                                                    if(ext === 'pdf')
                                                        currentTarget.src = pdf_icon
                                                    else if(ext === 'mov')
                                                        currentTarget.src=mov_icon;
                                                    else if(ext === 'mp4')
                                                        currentTarget.src=mp4_icon;
                                                    else if(ext === 'csv')
                                                        currentTarget.src=csv_icon;
                                                    else
                                                        currentTarget.src=file_icon;

                                                }}/>
                                            </a>
                                        </span>
                                        <span className="file-name"><a href={src} target="_blank" title="See Preview">{`${path}.${ext}`}</a></span>
                                        {onRemove &&
                                            <span className="file-delete">
                                                <a href="#" data-tip="delete" title="Delete File" onClick={ev => onRemove(v)} >
                                                    <i className="fa fa-trash-o delete-icon"></i>
                                                </a>
                                            </span>
                                        }
                                    </li>
                                )
                            })}
                        </ul>
                    }
                </div>
            </div>
        );
    }
}
