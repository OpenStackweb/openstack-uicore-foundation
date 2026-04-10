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
 * */

import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
  DialogActions
} from "@mui/material";
import PropTypes from "prop-types";
import UploadInputV3 from "../../inputs/upload-input-v3";
import T from "i18n-react";
import CloseIcon from "@mui/icons-material/Close";
import {
  DECIMAL_DIGITS
} from "../../../utils/constants";

const UploadDialog = ({
  name,
  value,
  open,
  fileMeta,
  maxFiles = 1,
  onClose,
  onUpload
}) => {
  const [uploadedFile, setUploadedFile] = useState(null);

  const mediaType = {
    id: name,
    ...(fileMeta.max_file_size
      ? { max_size: fileMeta.max_file_size.toFixed(DECIMAL_DIGITS) }
      : {}),
    max_uploads_qty: maxFiles,
    type: {
      allowed_extensions: fileMeta.allowed_extensions.split(",")
    }
  };

  const handleClose = () => {
    setUploadedFile(null);
    onClose();
  };

  const handleUpload = () => {
    onUpload(uploadedFile).then(() => {
      handleClose();
    });
  };

  const handleRemove = () => {
    setUploadedFile(null);
  };

  const canAddMore = () => (value?.length || 0) < maxFiles;

  const getInputValue = () =>
    value?.length > 0
      ? value.map((file) => ({
          ...file,
          filename:
            file.file_name ?? file.filename ?? file.file_path ?? file.file_url
        }))
      : [];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{T.translate("upload_input.upload_file")}</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.grey[500]
        })}
      >
        <CloseIcon />
      </IconButton>
      <Divider />
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {fileMeta.name}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          {fileMeta.description}
        </Typography>
        <Divider sx={{ marginLeft: -2, marginRight: -2, mb: 2 }} />
        <UploadInputV3
          id={`media_upload_${name}`}
          name={name}
          onUploadComplete={setUploadedFile}
          value={getInputValue()}
          mediaType={mediaType}
          onRemove={handleRemove}
          postUrl={`${window.FILE_UPLOAD_API_BASE_URL}/api/v1/files/upload`}
          djsConfig={{ withCredentials: true }}
          maxFiles={maxFiles}
          canAdd={canAddMore()}
          parallelChunkUploads
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleUpload}
          fullWidth
          disabled={!uploadedFile}
          variant="contained"
        >
          {T.translate("upload_input.upload_file")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

UploadDialog.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.array.isRequired,
  open: PropTypes.bool.isRequired,
  fileMeta: PropTypes.object.isRequired,
  maxFiles: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired
};

export default UploadDialog;
