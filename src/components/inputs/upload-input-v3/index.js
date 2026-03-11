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

import React, { useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  Alert
} from '@mui/material';
import {
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import DropzoneJS from '../upload-input-v2/dropzone';
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

  const getDefaultAllowedExtensions = useCallback(() => {
    return mediaType && mediaType.type
      ? mediaType?.type?.allowed_extensions.map((ext) => `.${ext.toLowerCase()}`).join(",")
      : '';
  }, [mediaType]);

  const getDefaultMaxSize = useCallback(() => {
    return mediaType ? mediaType?.max_size / 1024 : 100;
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
    if (!bytes) return '100kb';
    return `${Math.round(bytes / 1024)}kb`;
  }, []);

  const handleRemove = useCallback((file) => (ev) => {
    ev.preventDefault();
    onRemove(file);
  }, [onRemove]);

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
    if (!canUpload) {
      return (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Max number of files uploaded for this type - Remove uploaded file to add new file.
        </Alert>
      );
    }

    return (
      <DropzoneJS
        id={id}
        djsConfig={djsConfigSet}
        config={componentConfig}
        eventHandlers={eventHandlers}
        data={data}
        uploadCount={value.length}
        onUploadComplete={onUploadComplete}
        onError={onError}
      />
    );
  };

  return (
    <Box>
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

      <Box sx={{ mb: 2 }}>
        {canUpload && renderDropzone()}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {value.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {value.map((file, index) => {
            const filename = file.filename;
            const fileSize = formatFileSize(file.size);

            return (
              <Paper
                key={`uploaded-${index}`}
                elevation={0}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  mb: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <Box sx={{
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  mr: 2,
                  minWidth: 40
                }}>
                  <FileIcon fontSize="large" />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
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
                      sx={{
                        color: 'text.secondary',
                        '&:hover': { color: 'error.main' }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                  <CheckCircleIcon sx={{ color: 'success.main', fontSize: 28 }} />
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {!canUpload && (
        <Button
          fullWidth
          variant="contained"
          disabled
          sx={{ mt: 2, py: 1.5, textTransform: 'uppercase' }}
        >
          Upload File
        </Button>
      )}
    </Box>
  );
};

export default UploadInputV3;
