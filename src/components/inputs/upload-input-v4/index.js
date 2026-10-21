/**
 * Copyright 2026 OpenStack Foundation
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

import React, { useState, useRef, useMemo, useCallback, useLayoutEffect, useEffect } from 'react';
import T from "i18n-react/dist/i18n-react";
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
import ReplayIcon from "@mui/icons-material/Replay";
import ProgressiveImg from '../../progressive-img';
import file_icon from '../upload-input/file.png';
import { AUTH_ERROR_REFRESH_TOKEN_NETWORK_ERROR } from '../../security/constants';
import { buildUppy } from './uppy-client';
import './index.less';

const fileRowSx = {
  display: 'flex',
  alignItems: 'center',
  py: 1.5,
  mb: 1,
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 KB';
  if (bytes >= 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))} MB`;
  return `${Math.round(bytes / 1024)} KB`;
};

const rowFor = (file) => ({
  id: file.id,
  name: file.name,
  size: file.size,
  progress: 0,
  complete: false,
  previewUrl: file.type?.startsWith('image/') ? URL.createObjectURL(file.data) : null,
});

// djsConfig configured Dropzone. It is accepted so a V3 call site switches by changing
// its import, and warned about once per page because a caller may still rely on it.
let djsConfigWarned = false;

/**
 * Maps the transport failures a user cannot act on onto V3's translated messages.
 * Anything else is a server message (file-upload-api's {"message": ...}) or an Uppy
 * restriction message, and is shown as is.
 */
const resolveErrorMessage = (err) => {
  const message = err?.message || '';
  // First: the hash's own error may be a TypeError or carry a message matched below.
  if (err?.code === 'hash_failed') return T.translate('upload_input_v3.hash_failed');
  // fetch rejects with a TypeError when a request never reached the server, and
  // @uppy/aws-s3 reports a failed PUT connection as 'Unknown error'.
  if (err instanceof TypeError || message === 'Unknown error' || message.startsWith(AUTH_ERROR_REFRESH_TOKEN_NETWORK_ERROR)) {
    return T.translate('upload_input_v3.network_error');
  }
  if (message.startsWith('AUTH_ERROR')) return T.translate('upload_input_v3.auth_error');
  // @uppy/aws-s3's message for a non-2xx PUT response, or a file API error with no
  // message of its own
  if (!message || message === 'Non 2xx' || (err?.status && !err.fromServer)) {
    return T.translate('upload_input_v3.upload_failed');
  }
  return message;
};

/**
 * Same props as UploadInputV3. `postUrl` is the file API base
 * (`${FILE_UPLOAD_API_BASE_URL}/api/v1/files`). Dropzone's `timeOut`,
 * `parallelChunkUploads` and `maxConcurrentChunks` are accepted and ignored: Uppy
 * retries each request on its own and limits concurrency across all files.
 */
const UploadInputV4 = ({
  value = [],
  onRemove,
  canAdd = true,
  canDelete = true,
  mediaType,
  postUrl,
  maxFiles = 1,
  onUploadComplete,
  onUploadStart = null,
  djsConfig,
  id,
  name,
  onError = () => { },
  getAllowedExtensions = null,
  getMaxSize = null,
  error,
  label,
  helpText
}) => {
  const [uppy, setUppy] = useState(null);
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [errorFiles, setErrorFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState({});
  const filePreviewsRef = useRef({});
  filePreviewsRef.current = filePreviews;
  const uploadingFilesRef = useRef([]);
  uploadingFilesRef.current = uploadingFiles;
  // Uppy ids of files delivered to the parent. They leave Uppy just before the next
  // selection (see handleFilesSelected).
  const deliveredRef = useRef(new Set());
  const rejectedSeqRef = useRef(0);
  // Uppy calls back long after the render that subscribed; read the current props.
  const propsRef = useRef({});
  propsRef.current = { onUploadComplete, onUploadStart, onError, id, mediaType, value };

  useEffect(() => {
    if (djsConfig && !djsConfigWarned) {
      djsConfigWarned = true;
      console.warn('UploadInputV4 ignores djsConfig: files upload straight to storage through Uppy, not Dropzone.');
    }
  }, [djsConfig]);

  useEffect(() => {
    return () => {
      Object.values(filePreviewsRef.current).forEach(url => { if (url) URL.revokeObjectURL(url); });
      uploadingFilesRef.current.forEach(f => { if (f.previewUrl) URL.revokeObjectURL(f.previewUrl); });
    };
  }, []);

  const allowedExt = useMemo(() => {
    if (getAllowedExtensions) return getAllowedExtensions();
    return mediaType?.type?.allowed_extensions?.map(ext => `.${ext.toLowerCase()}`).join(',') ?? '';
  }, [getAllowedExtensions, mediaType]);

  const maxSize = useMemo(() => {
    if (getMaxSize) return getMaxSize();
    return mediaType ? mediaType.max_size / (1024 * 1024) : 100;
  }, [getMaxSize, mediaType]);

  const restrictions = useMemo(() => ({
    maxFileSize: maxSize ? maxSize * 1024 * 1024 : null,
    allowedFileTypes: allowedExt ? allowedExt.split(',').map(ext => ext.trim()).filter(Boolean) : null,
  }), [maxSize, allowedExt]);

  const canUpload = useMemo(() =>
    !maxFiles || value.length < maxFiles,
    [maxFiles, value.length]
  );

  const showDropzone = useMemo(() =>
    canUpload && uploadingFiles.length === 0 && errorFiles.length === 0,
    [canUpload, uploadingFiles.length, errorFiles.length]
  );

  const extDisplay = useMemo(() => {
    if (!allowedExt) return '';
    const exts = allowedExt.split(',')
      .map(e => e.trim().replace('.', '').toUpperCase())
      .filter(Boolean);
    if (exts.length === 0) return '';
    if (exts.length === 1) return exts[0];
    return `${exts.slice(0, -1).join(', ')} or ${exts[exts.length - 1]}`;
  }, [allowedExt]);

  const dropUploadingRow = useCallback((fileId) => {
    const entry = uploadingFilesRef.current.find(f => f.id === fileId);
    if (entry?.previewUrl) URL.revokeObjectURL(entry.previewUrl);
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const addRejectedRow = useCallback((file, message) => {
    rejectedSeqRef.current += 1;
    const rowId = `rejected-${rejectedSeqRef.current}`;
    setErrorFiles(prev => [...prev, { id: rowId, name: file.name, size: file.size, message }]);
  }, []);

  const handleDelivered = useCallback((file, body) => {
    deliveredRef.current.add(file.id);
    setUploadingFiles(prev => prev.map(f => (
      f.id === file.id
        ? { ...f, progress: 100, complete: true, ...(body?.name ? { serverFilename: body.name } : {}) }
        : f
    )));
    const { onUploadComplete: callback, id: inputId, mediaType: type, value: current } = propsRef.current;
    if (callback) callback(body, inputId, { media_type: type, media_upload: current });
  }, []);

  // Declared before the effect that creates Uppy so React tears it down first: on
  // unmount the handlers are gone before destroy() emits file-removed.
  useEffect(() => {
    if (!uppy) return undefined;
    const onFileAdded = (file) => {
      setUploadingFiles(prev => [...prev, rowFor(file)]);
      const { onUploadStart: callback } = propsRef.current;
      if (callback) callback(file.data);
    };
    const onUploadProgress = (file, progress) => {
      if (!file || !progress?.bytesTotal) return;
      const pct = Math.min((progress.bytesUploaded / progress.bytesTotal) * 100, 100);
      setUploadingFiles(prev => prev.map(f => (f.id === file.id && !f.complete ? { ...f, progress: pct } : f)));
    };
    const onUploadError = (file, err) => {
      // A file the user removed was cancelled, not failed.
      if (!file || !uppy.getFile(file.id)) return;
      dropUploadingRow(file.id);
      setErrorFiles(prev => [
        ...prev.filter(f => f.id !== file.id),
        { id: file.id, name: file.name, size: file.size, message: resolveErrorMessage(err) },
      ]);
      const { onError: callback, id: inputId } = propsRef.current;
      if (callback) callback(err, err?.status, inputId);
    };
    const onFileRemoved = (file) => {
      // A delivered row stays until the parent confirms it through `value`.
      const entry = uploadingFilesRef.current.find(f => f.id === file.id);
      if (entry && !entry.complete) dropUploadingRow(file.id);
    };
    uppy.on('file-added', onFileAdded);
    uppy.on('upload-progress', onUploadProgress);
    uppy.on('upload-error', onUploadError);
    uppy.on('file-removed', onFileRemoved);
    return () => {
      uppy.off('file-added', onFileAdded);
      uppy.off('upload-progress', onUploadProgress);
      uppy.off('upload-error', onUploadError);
      uppy.off('file-removed', onFileRemoved);
    };
  }, [uppy, dropUploadingRow]);

  // One Uppy instance per postUrl, created here and destroyed in the cleanup, so a
  // StrictMode double mount leaves exactly one live instance. destroy() cancels what is
  // still in flight and uppy-client purges those tickets.
  useEffect(() => {
    if (!postUrl) return undefined;
    const instance = buildUppy({ baseUrl: postUrl, onTicket: handleDelivered });
    setUppy(instance);
    return () => instance.destroy();
  }, [postUrl, handleDelivered]);

  useEffect(() => {
    if (uppy) uppy.setOptions({ restrictions });
  }, [uppy, restrictions]);

  useLayoutEffect(() => {
    const currentUploading = uploadingFilesRef.current;
    if (currentUploading.length === 0 || value.length === 0) return;
    const valueFilenames = new Set(value.map(f => f.filename));

    // Transfer blob previews to filePreviews before removing confirmed entries,
    // so the committed value row can display the preview immediately.
    const newPreviews = {};
    currentUploading.forEach(f => {
      if (f.complete && f.serverFilename && f.previewUrl && valueFilenames.has(f.serverFilename)) {
        newPreviews[f.serverFilename] = f.previewUrl;
      }
    });
    if (Object.keys(newPreviews).length > 0) {
      setFilePreviews(p => ({ ...p, ...newPreviews }));
    }

    setUploadingFiles(prev => prev.filter(f => {
      if (!f.complete) return true;
      // Only remove once the parent confirms receipt via value; untracked rows drop immediately.
      return f.serverFilename ? !valueFilenames.has(f.serverFilename) : false;
    }));
  }, [value]);

  const handleFilesSelected = useCallback((fileList) => {
    const files = Array.from(fileList || []);
    if (!uppy || files.length === 0) return;
    // Delivered files leave Uppy only now. Removing one at delivery would re-enter
    // @uppy/aws-s3's abort path mid-flight; keeping it would make Uppy reject the same
    // file as a duplicate when the user picks it again.
    deliveredRef.current.forEach(fileId => { if (uppy.getFile(fileId)) uppy.removeFile(fileId); });
    deliveredRef.current.clear();
    const room = maxFiles ? maxFiles - value.length : files.length;
    files.forEach((file, index) => {
      if (index >= room) {
        addRejectedRow(file, T.translate('upload_input_v3.max_files_reached'));
        return;
      }
      try {
        uppy.addFile({ name: file.name, type: file.type, data: file, source: 'local' });
      } catch (err) {
        // Uppy's restrictions (type, size) and its duplicate check throw before any request.
        addRejectedRow(file, err.message);
      }
    });
  }, [uppy, maxFiles, value.length, addRejectedRow]);

  const handleRemove = useCallback((file) => (ev) => {
    ev.preventDefault();
    const blobUrl = filePreviews[file.filename];
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setFilePreviews(prev => { const next = { ...prev }; delete next[file.filename]; return next; });
    }
    onRemove(file);
  }, [onRemove, filePreviews]);

  const handleDeleteUploading = useCallback((file) => {
    dropUploadingRow(file.id);
    if (uppy?.getFile(file.id)) uppy.removeFile(file.id);
  }, [uppy, dropUploadingRow]);

  const handleDismissError = useCallback((file) => {
    setErrorFiles(prev => prev.filter(f => f.id !== file.id));
    if (uppy?.getFile(file.id)) uppy.removeFile(file.id);
  }, [uppy]);

  const handleRetryError = useCallback((file) => {
    setErrorFiles(prev => prev.filter(f => f.id !== file.id));
    const uppyFile = uppy?.getFile(file.id);
    if (!uppyFile) return;  // rejected before Uppy took it: nothing to retry
    setUploadingFiles(prev => [...prev, rowFor(uppyFile)]);
    // V3 re-added the file on retry, which called onUploadStart again.
    propsRef.current.onUploadStart?.(uppyFile.data);
    uppy.retryUpload(uppyFile.id).catch(() => { });  // failures arrive as upload-error
  }, [uppy]);

  const openFilePicker = () => fileInputRef.current?.click();

  const renderDropzone = () => {
    if (!postUrl) {
      return (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {T.translate("upload_input_v3.no_post_url")}
        </Alert>
      );
    }
    if (!canAdd) {
      return (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          {T.translate("upload_input_v3.upload_disabled")}
        </Alert>
      );
    }

    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          hidden
          multiple={maxFiles !== 1}
          accept={allowedExt || undefined}
          onChange={(ev) => { handleFilesSelected(ev.target.files); ev.target.value = ''; }}
        />
        <Box
          className={`dropzone${dragOver ? ' dz-drag-hover' : ''}`}
          role="button"
          tabIndex={0}
          onClick={openFilePicker}
          onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openFilePicker(); } }}
          onDragOver={(ev) => { ev.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(ev) => { ev.preventDefault(); setDragOver(false); handleFilesSelected(ev.dataTransfer?.files); }}
        >
          <Box className="dz-custom-content">
            <UploadFileIcon className="dz-custom-icon" />
            <Typography variant="body2" className="dz-custom-message">
              <span className="dz-click-text">{T.translate("upload_input_v3.click_upload")}</span> {T.translate("upload_input_v3.drag_and_drop")}
            </Typography>
            {(extDisplay || maxSize) && (
              <Typography variant="caption" className="dz-custom-hint">
                {extDisplay ? `${extDisplay} files` : ''}
                {maxSize ? ` (max. ${maxSize}MB)` : ''}
              </Typography>
            )}
          </Box>
        </Box>
      </>
    );
  };

  return (
    <Box className="upload-input-v4" id={id} name={name}>
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
          {uploadingFiles.map((file) => (
            <Box
              key={`uploading-${file.id}`}
              sx={fileRowSx}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, width: 64, height: 64, flexShrink: 0 }}>
                {file.previewUrl ? (
                  <ProgressiveImg
                    alt={file.name}
                    src={file.previewUrl}
                    placeholderSrc={file_icon}
                  />
                ) : (
                  <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                    <UploadFileIcon fontSize="medium" />
                  </Box>
                )}
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
                  {formatFileSize(file.size)} · {file.complete ? T.translate("upload_input_v3.complete") : T.translate("upload_input_v3.loading")}
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
                  aria-label={T.translate("upload_input_v3.remove_file", { filename: file.name })}
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
          {errorFiles.map((file) => (
            <Box
              key={`error-${file.id}`}
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
                onClick={() => handleRetryError(file)}
                title={T.translate("upload_input_v3.retry")}
                sx={{ color: 'primary.main' }}
              >
                <ReplayIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleDismissError(file)}
                aria-label={T.translate("upload_input_v3.dismiss_file", { filename: file.name })}
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
            let src = file?.private_url || file?.public_url || file?.file_url;
            if (src === '#') src = file?.public_url;
            // custom replace for dropbox case ( download vs raw)
            const serverPreviewSrc = src ? src.replace("?dl=0", "?raw=1") : filename;
            const previewSrc = filePreviews[filename] || serverPreviewSrc;

            return (
              <Box
                key={`uploaded-${index}`}
                sx={fileRowSx}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, width: 64, height: 64, flexShrink: 0 }}>
                  <a href={src} target="_blank" title={T.translate("upload_input_v3.see_preview")}>
                    <ProgressiveImg
                      alt={filename}
                      src={previewSrc}
                      placeholderSrc={file_icon}
                    />
                  </a>
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    component="a"
                    href={src}
                    target="_blank"
                    rel="noreferrer"
                    title={T.translate("upload_input_v3.preview_file")}
                    download
                    variant="body2"
                    fontWeight={500}
                    sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {filename}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {file?.size ? `${fileSize} ·` : ''} {T.translate("upload_input_v3.complete")}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {onRemove && canDelete && (
                    <IconButton
                      size="small"
                      onClick={handleRemove(file)}
                      aria-label={T.translate("upload_input_v3.remove_file", { filename: file.filename })}
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

export default UploadInputV4;
