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

import React from 'react';
import { DropzoneJS } from '../dropzone';

/**
 * Thin wrapper around DropzoneJS that exposes file lifecycle callbacks
 * without modifying the shared dropzone component.
 */
export const DropzoneV3 = ({
  onAddedFile,
  onUploadProgress,
  onFileRemoved,
  onFileCompleted,
  onFileError,
  onDropzoneReady,
  eventHandlers = {},
  children,
  ...props
}) => {
  const combinedEventHandlers = {
    ...eventHandlers,
    init: (dz) => {
      if (onDropzoneReady) onDropzoneReady(dz);
      if (eventHandlers.init) eventHandlers.init(dz);
    },
    addedfile: (file) => {
      if (onAddedFile) onAddedFile(file);
      if (eventHandlers.addedfile) eventHandlers.addedfile(file);
    },
    removedfile: (file) => {
      if (onFileRemoved) onFileRemoved(file);
      if (eventHandlers.removedfile) eventHandlers.removedfile(file);
    },
    uploadprogress: (file, progress, bytesSent) => {
      if (onUploadProgress) onUploadProgress(file, bytesSent / file.size * 100);
      if (eventHandlers.uploadprogress) eventHandlers.uploadprogress(file, progress, bytesSent);
    },
    success: (file) => {
      if (onFileCompleted) onFileCompleted(file);
      if (eventHandlers.success) eventHandlers.success(file);
    },
    error: (file, message) => {
      if (onFileError) onFileError(file, message);
      if (eventHandlers.error) eventHandlers.error(file, message);
    },
  };

  return (
    <DropzoneJS {...props} eventHandlers={combinedEventHandlers}>
      {children}
    </DropzoneJS>
  );
};

export default DropzoneV3;
