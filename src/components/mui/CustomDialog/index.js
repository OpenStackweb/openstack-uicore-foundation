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

import React from "react";
import PropTypes from "prop-types";
import { Dialog, DialogTitle, Divider, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const CustomDialog = ({ title, open, onClose, maxWidth, fullWidth, children }) => (
  <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth={fullWidth}>
    <DialogTitle>{title}</DialogTitle>
    <IconButton
      aria-label="close"
      onClick={onClose}
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
    {children}
  </Dialog>
);

CustomDialog.propTypes = {
  title: PropTypes.node.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  maxWidth: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl", false]),
  fullWidth: PropTypes.bool,
  children: PropTypes.node.isRequired
};

CustomDialog.defaultProps = {
  maxWidth: "sm",
  fullWidth: true
};

export default CustomDialog;
