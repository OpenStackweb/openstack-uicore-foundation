/**
 * Copyright 2023 OpenStack Foundation
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
import React,{ useState, useEffect } from "react";
import styles from './index.module.scss';
import pdf_icon from "../inputs/upload-input/pdf.png";
import mov_icon from "../inputs/upload-input/mov.png";
import mp4_icon from "../inputs/upload-input/mp4.png";
import csv_icon from "../inputs/upload-input/csv.png";
import file_icon from "../inputs/upload-input/file.png";
/**
 *
 * @param placeholderSrc
 * @param src
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const ProgressiveImg = ({ placeholderSrc, src, ...props }) => {
    const [imgSrc, setImgSrc] = useState(placeholderSrc || src);
    const [customClass, setCustomClass] = useState(styles.loading);

    useEffect(() => {
        const img = new Image();
        const ext =  src.split('.').pop();
        img.src = src;
        img.onload = () => {
            setImgSrc(src)
            setCustomClass(styles.loaded)
        };
        img.onerror = () => {
            img.onerror = null;
            if(ext.includes('pdf'))
                setImgSrc(pdf_icon)
            else if(ext.includes('mov'))
                setImgSrc(mov_icon);
            else if(ext.includes('mp4'))
                setImgSrc(mp4_icon);
            else if(ext.includes('csv'))
                setImgSrc(csv_icon);
            else
                setImgSrc(file_icon);
            setCustomClass(styles.loaded)
        };
    }, [src]);

    return (
        <img
            {...{ src: imgSrc, ...props }}
            alt={props.alt || ""}
            className={`${styles.image} ${customClass}`}
        />
    );
};
export default ProgressiveImg;
