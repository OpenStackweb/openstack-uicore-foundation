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

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Alert,
  LinearProgress,
} from '@mui/material';
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CloseIcon from "@mui/icons-material/Close";
import { DropzoneV3 } from './dropzone-v3';
import './index.less';

const UploadInputV3 = ({
  value = [],
  onRemove,
  canAdd = true,
  canDelete = true,
  mediaType,
  postUrl,
  maxFiles = 1,
  timeOut,
  onUploadComplete,
  djsConfig,
  id,
  parallelChunkUploads = false,
  onError = () => {},
  getAllowedExtensions = null,
  getMaxSize = null,
  error,
  label,
  helpText
}) => {
  const dropzoneInstanceRef = useRef(null);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [errorFiles, setErrorFiles] = useState([]);

  const getDefaultAllowedExtensions = useCallback(() => {
    return mediaType && mediaType.type
      ? mediaType?.type?.allowed_extensions.map((ext) => `.${ext.toLowerCase()}`).join(",")
      : '';
  }, [mediaType]);

  const getDefaultMaxSize = useCallback(() => {
    return mediaType ? mediaType?.max_size / (1024 * 1024) : 100;
  }, [mediaType]);

  const allowedExt = useMemo(() =>
    getAllowedExtensions ? getAllowedExtensions() : getDefaultAllowedExtensions(),
    [getAllowedExtensions, getDefaultAllowedExtensions]
  );

  const maxSize = useMemo(() =>
    getMaxSize ? getMaxSize() : getDefaultMaxSize(),
    [getMaxSize, getDefaultMaxSize]
  );

  const canUpload = useMemo(() =>
    !maxFiles || value.length < maxFiles,
    [maxFiles, value.length]
  );

  const showDropzone = useMemo(() =>
    canUpload && uploadingFiles.length === 0 && errorFiles.length === 0,
    [canUpload, uploadingFiles.length, errorFiles.length]
  );

  const eventHandlers = useMemo(() => {
    return onRemove ? { removedfile: onRemove } : {};
  }, [onRemove]);

  const djsConfigSet = useMemo(() => ({
    paramName: "file",
    maxFilesize: maxSize,
    timeout: timeOut || (1000 * 60 * 10),
    chunking: true,
    retryChunks: true,
    parallelChunkUploads: parallelChunkUploads,
    addRemoveLinks: true,
    maxFiles: maxFiles,
    acceptedFiles: allowedExt,
    dictDefaultMessage: '',
    ...djsConfig
  }), [maxSize, timeOut, parallelChunkUploads, maxFiles, allowedExt, djsConfig]);

  const componentConfig = useMemo(() => ({
    showFiletypeIcon: false,
    postUrl: postUrl
  }), [postUrl]);

  const data = useMemo(() => ({
    media_type: mediaType,
    media_upload: value,
  }), [mediaType, value]);

  const formatFileSize = useCallback((bytes) => {
    if (!bytes) return '0 KB';
    if (bytes >= 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  }, []);

  const formatExtensionsDisplay = useCallback(() => {
    if (!allowedExt) return '';
    const exts = allowedExt.split(',')
      .map(e => e.trim().replace('.', '').toUpperCase())
      .filter(Boolean);
    if (exts.length === 0) return '';
    if (exts.length === 1) return exts[0];
    return `${exts.slice(0, -1).join(', ')} or ${exts[exts.length - 1]}`;
  }, [allowedExt]);

  const handleRemove = useCallback((file) => (ev) => {
    ev.preventDefault();
    onRemove(file);
  }, [onRemove]);

  const handleDropzoneReady = useCallback((dz) => {
    dropzoneInstanceRef.current = dz;
  }, []);

  const handleAddedFile = useCallback((file) => {
    setUploadingFiles(prev => [...prev, { name: file.name, size: file.size, progress: 0, complete: false }]);
  }, []);

  const handleUploadProgress = useCallback((file, progress) => {
    setUploadingFiles(prev => prev.map(f =>
      f.name === file.name && f.size === file.size ? { ...f, progress } : f
    ));
  }, []);

  const handleFileRemoved = useCallback((file) => {
    setUploadingFiles(prev => prev.filter(f => !(f.name === file.name && f.size === file.size)));
  }, []);

  // Mark as complete instead of removing — keep it visible until value is updated by the parent
  const handleFileCompleted = useCallback((file) => {
    setUploadingFiles(prev => prev.map(f =>
      f.name === file.name && f.size === file.size ? { ...f, progress: 100, complete: true } : f
    ));
  }, []);

  // Once the parent updates value, remove the matching completed file from uploadingFiles
  useEffect(() => {
    if (uploadingFiles.length === 0 || value.length === 0) return;
    setUploadingFiles(prev => prev.filter(f => {
      if (!f.complete) return true;
      return !value.some(v => v.filename === f.name);
    }));
  }, [value]);

  const handleFileError = useCallback((file, message) => {
    setUploadingFiles(prev => prev.filter(f => !(f.name === file.name && f.size === file.size)));
    setErrorFiles(prev => [...prev, { name: file.name, size: file.size, message }]);
  }, []);

  const handleDismissError = useCallback((file) => {
    if (dropzoneInstanceRef.current) {
      const dzFile = dropzoneInstanceRef.current.files?.find(
        f => f.name === file.name && f.size === file.size
      );
      if (dzFile) dropzoneInstanceRef.current.removeFile(dzFile);
    }
    setErrorFiles(prev => prev.filter(f => !(f.name === file.name && f.size === file.size)));
  }, []);

  const handleDeleteUploading = useCallback((file) => {
    if (dropzoneInstanceRef.current) {
      const dzFile = dropzoneInstanceRef.current.files?.find(
        f => f.name === file.name && f.size === file.size
      );
      if (dzFile) dropzoneInstanceRef.current.removeFile(dzFile);
    }
    setUploadingFiles(prev => prev.filter(f => !(f.name === file.name && f.size === file.size)));
  }, []);

  const wrappedOnUploadComplete = useCallback((response, dzId, dzData) => {
    if (onUploadComplete) onUploadComplete(response, dzId, dzData);
  }, [onUploadComplete]);

  const extDisplay = formatExtensionsDisplay();

  const renderDropzone = () => {
    if (!postUrl) {
      return (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          No Post URL
        </Alert>
      );
    }
    if (!canAdd) {
      return (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          Upload has been disabled by administrators.
        </Alert>
      );
    }

    return (
      <DropzoneV3
        id={id}
        djsConfig={djsConfigSet}
        config={componentConfig}
        eventHandlers={eventHandlers}
        data={data}
        uploadCount={value.length}
        onUploadComplete={wrappedOnUploadComplete}
        onError={onError}
        onDropzoneReady={handleDropzoneReady}
        onAddedFile={handleAddedFile}
        onUploadProgress={handleUploadProgress}
        onFileRemoved={handleFileRemoved}
        onFileCompleted={handleFileCompleted}
        onFileError={handleFileError}
      >
        <Box className="dz-custom-content">
          <UploadFileIcon className="dz-custom-icon" />
          <Typography variant="body2" className="dz-custom-message">
            <span className="dz-click-text">Click to upload</span> or drag and drop
          </Typography>
          {(extDisplay || maxSize) && (
            <Typography variant="caption" className="dz-custom-hint">
              {extDisplay ? `${extDisplay} files` : ''}
              {maxSize ? ` (max. ${maxSize}MB)` : ''}
            </Typography>
          )}
        </Box>
      </DropzoneV3>
    );
  };

  const fileRowSx = {
    display: 'flex',
    alignItems: 'center',
    py: 1.5,
    mb: 1,
  };

  return (
    <Box className="upload-input-v3">
      {label && (
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {label}
        </Typography>
      )}

      {helpText && (
        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
          {helpText}
        </Typography>
      )}

      {canUpload && (
        <Box sx={{ mb: 2, display: showDropzone ? 'block' : 'none' }}>
          {renderDropzone()}
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {uploadingFiles.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {uploadingFiles.map((file, index) => (
            <Box
              key={`uploading-${index}`}
              sx={fileRowSx}
            >
              <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', mr: 2, minWidth: 32 }}>
                <UploadFileIcon fontSize="medium" />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(file.size)} · {file.complete ? 'Complete' : 'Loading'}
                </Typography>
                {!file.complete && (
                  <LinearProgress
                    variant="determinate"
                    value={file.progress}
                    sx={{ mt: 0.5, borderRadius: 1 }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteUploading(file)}
                  sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                >
                  <DeleteIcon />
                </IconButton>
                {file.complete && (
                  <CheckCircleIcon sx={{ color: 'success.main', fontSize: 28 }} />
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {errorFiles.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {errorFiles.map((file, index) => (
            <Box
              key={`error-${index}`}
              sx={fileRowSx}
            >
              <Box sx={{ color: 'error.main', display: 'flex', alignItems: 'center', mr: 2, minWidth: 32 }}>
                <ErrorOutlineIcon fontSize="medium" />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {file.name}
                </Typography>
                <Typography variant="caption" color="error">
                  {file.message}
                </Typography>
              </Box>

              <IconButton
                size="small"
                onClick={() => handleDismissError(file)}
                sx={{ color: 'error.main' }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      {value.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {value.map((file, index) => {
            const filename = file.filename;
            const fileSize = formatFileSize(file.size);

            return (
              <Box
                key={`uploaded-${index}`}
                sx={fileRowSx}
              >
                <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', mr: 2, minWidth: 32 }}>
                  <UploadFileIcon fontSize="medium" />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {filename}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {fileSize} · Complete
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {onRemove && canDelete && (
                    <IconButton
                      size="small"
                      onClick={handleRemove(file)}
                      sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                  <CheckCircleIcon sx={{ color: 'success.main', fontSize: 28 }} />
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

    </Box>
  );
};

export default UploadInputV3;
