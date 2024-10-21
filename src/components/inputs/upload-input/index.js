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

import React, {useEffect, useState} from 'react';
import Dropzone from 'react-dropzone';
import T from 'i18n-react/dist/i18n-react';
import './upload.less';

import file_icon from './file.png';
import pdf_icon from './pdf.png';
import mov_icon from './mov.png';
import mp4_icon from './mp4.png';
import csv_icon from './csv.png';

const fileHasPreview = (fileName) => {
    if (!fileName) return false;
    const pattern = /(.*)\.(gif|bmp|svg|jpe?g|png)/g
    return pattern.test(fileName);
}

const getPreviewIcon = (value, fileName) => {
    if (value && fileHasPreview(fileName)) {
        return value;
    }

    const ext = fileName.split('.').pop();

    switch (ext) {
        case 'pdf':
            return pdf_icon;
        case 'mov':
            return mov_icon;
        case 'mp4':
            return mp4_icon;
        case 'csv':
            return csv_icon;
        default:
            return file_icon;
    }
}

const UploadInput = ({value, error, handleRemove, handleUpload, handleError, ...rest}) => {
    const [showRemove, setShowRemove] = useState(false);
    const [logoPreview, setLogoPreview] = useState({preview: null, name: ''});

    useEffect(() => {
        const logoPreviewTmp = {preview: null, name: ''};

        if (value) {
            const fileName = value.split("/").pop();
            logoPreviewTmp.preview = getPreviewIcon(value, fileName);
            logoPreviewTmp.name = fileName;
            setLogoPreview(logoPreviewTmp);
        }
    }, [value]);

    const onDrop = (acceptedFiles, fileRejections) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            handleUpload(file);
        }

        if (fileRejections.length > 0 && handleError)
            handleError(fileRejections);
    }

    const onRemove = (ev) => {
        ev.preventDefault();
        handleRemove();
    }

    const showVeil = () => {
        setShowRemove(true)
    }

    const hideVeil = () => {
        setShowRemove(false);
    }

    const has_error = error !== '';

    return (
        <div className="file-upload">
            <Dropzone
                onDrop={onDrop}
                {...rest}
            >
                <div>{T.translate("general.drop_files")}</div>
            </Dropzone>
            <div className="selected-files-box col-md-6">
                <p>Selected Files</p>
                <div className="selected-files">
                    {value &&
                        <div className="file-box" onMouseEnter={showVeil} onMouseLeave={hideVeil}>
                            <img src={logoPreview.preview} />
                            <a href={value} target="_blank">{logoPreview?.name}</a>
                            {showRemove &&
                                <div className="remove" onClick={onRemove}>
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

export default UploadInput;
