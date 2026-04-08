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
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import T from "i18n-react";

const ConfirmDeleteDialog = ({ open, onClose, onConfirm, message }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {T.translate("alerts.confirm_delete_title")}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {message || T.translate("alerts.confirm_delete")}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {T.translate("general.cancel")}
        </Button>
        <Button onClick={onConfirm} color="error" autoFocus>
          {T.translate("general.delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ConfirmDeleteDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  message: PropTypes.string
};

ConfirmDeleteDialog.defaultProps = {
  message: ""
};

export default ConfirmDeleteDialog;
