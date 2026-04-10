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
import T from "i18n-react";
import { Divider, IconButton, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const AlertModal = ({ title, message, open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
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
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={onClose} variant="contained" fullWidth>
          {T.translate("general.ok")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AlertModal.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default AlertModal;
