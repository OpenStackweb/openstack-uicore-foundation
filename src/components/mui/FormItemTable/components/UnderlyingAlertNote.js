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
import { Typography } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import T from "i18n-react/dist/i18n-react";

const UnderlyingAlertNote = ({ showAdditionalItems }) => {
  if (!showAdditionalItems) return null;

  return (
    <Typography
      variant="body2"
      component="p"
      sx={{ color: "error.warning", fontSize: "0.8rem" }}
    >
      <ErrorIcon
        color="error"
        sx={{
          fontSize: "1rem",
          top: "0.2rem",
          position: "relative"
        }}
      />{" "}
      {T.translate("sponsor_edit_form.additional_info")}
    </Typography>
  );
};

export default UnderlyingAlertNote;
