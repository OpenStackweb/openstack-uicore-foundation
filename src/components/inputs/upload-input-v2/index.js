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
                        <div>
                            <label>Uploaded</label>
                            {value.map((v,i) => {
                                return (
                                    <div key={`uploaded-${i}`}>
                                        <a href={v.private_url || v.public_url} target="_blank">{v.filename}</a>
                                        {onRemove &&
                                            <span> - <a onClick={ev => onRemove(v)}>Remove</a></span>
                                        }
                                    </div>
                                )
                            })}
                        </div>
                    }
                </div>
            </div>
        );
    }
}
