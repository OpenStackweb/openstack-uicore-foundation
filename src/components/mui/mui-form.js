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
import { Box } from "@mui/material";

const BUTTON_INPUT_TYPES = ["submit", "button", "reset", "image", "file"];

// Enter must never implicitly submit; textareas and buttons still need it for new lines and activation
const preventEnterSubmit = (ev) => {
  const { tagName, type } = ev.target;
  if (ev.key === "Enter" && tagName === "INPUT" && !BUTTON_INPUT_TYPES.includes(type)) {
    ev.preventDefault();
  }
};

const MuiForm = ({ onKeyDown, ...rest }) => (
  <Box
    component="form"
    onKeyDown={(ev) => {
      preventEnterSubmit(ev);
      onKeyDown?.(ev);
    }}
    {...rest}
  />
);

export default MuiForm;
