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
import { DialogContentText } from "@mui/material";
import CustomDialog from "../CustomDialog";

const AlertModal = ({ title, message, open, onClose }) => {
  return (
    <CustomDialog
      title={title}
      open={open}
      onClose={onClose}
      primaryAction={{ label: T.translate("general.ok"), onClick: onClose }}
    >
      <DialogContentText>{message}</DialogContentText>
    </CustomDialog>
  );
};

AlertModal.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default AlertModal;
