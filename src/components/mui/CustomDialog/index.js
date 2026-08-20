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
import PropTypes from "prop-types";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const CustomDialog = ({
  title,
  open,
  onClose,
  maxWidth,
  fullWidth,
  primaryAction,
  secondaryAction,
  children
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePrimaryClick = () => {
    const result = primaryAction.onClick();
    if (result && typeof result.then === "function") {
      setIsSubmitting(true);
      result.finally(() => setIsSubmitting(false));
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      disableEscapeKeyDown={isSubmitting}
    >
      <DialogTitle>{title}</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        disabled={isSubmitting}
        size="small"
        sx={(theme) => ({
          position: "absolute",
          right: 12,
          top: 12,
          color: theme.palette.grey[500]
        })}
      >
        <CloseIcon fontSize="large" />
      </IconButton>
      <Divider />
      <DialogContent>{children}</DialogContent>
      {(primaryAction || secondaryAction) && (
        <DialogActions>
          {secondaryAction && (
            <Button
              variant="outlined"
              onClick={secondaryAction.onClick}
              disabled={isSubmitting || secondaryAction.disabled}
            >
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button
              variant="contained"
              onClick={handlePrimaryClick}
              disabled={isSubmitting || primaryAction.disabled}
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : null
              }
            >
              {primaryAction.label}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

const actionPropType = PropTypes.shape({
  label: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool
});

CustomDialog.propTypes = {
  title: PropTypes.node.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  maxWidth: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl", false]),
  fullWidth: PropTypes.bool,
  primaryAction: actionPropType,
  secondaryAction: actionPropType,
  children: PropTypes.node.isRequired
};

CustomDialog.defaultProps = {
  maxWidth: "sm",
  fullWidth: true,
  primaryAction: null,
  secondaryAction: null
};

export default CustomDialog;
