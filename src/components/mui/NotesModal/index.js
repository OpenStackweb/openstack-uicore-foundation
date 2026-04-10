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

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import T from "i18n-react";
import { useField } from "formik";
import { Button, Dialog, DialogActions, DialogContent, Divider, DialogContentText, DialogTitle, IconButton, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const NotesModal = ({ id, label, open, title, placeholder, onClose }) => {
  const name = `i-${id}-c-global-f-notes`;
  // eslint-disable-next-line
  const [field, meta, helpers] = useField(name);
  const [notes, setNotes] = useState(field?.value || "");

  useEffect(() => {
    setNotes(field?.value || "");
  }, [id, field?.value]);

  const handleSave = () => {
    helpers.setValue(notes);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title || T.translate("general.notes")}</DialogTitle>
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
        <DialogContentText>{label}</DialogContentText>
        <TextField
          name={name}
          onChange={(ev) => setNotes(ev.target.value)}
          value={notes}
          margin="normal"
          multiline
          fullWidth
          rows={4}
          placeholder={placeholder || T.translate("placeholders.notes")}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSave} variant="contained" fullWidth>
          {T.translate("general.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

NotesModal.propTypes = {
  id: PropTypes.any,
  label: PropTypes.string,
  title: PropTypes.string,
  placeholder: PropTypes.string,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default NotesModal;
