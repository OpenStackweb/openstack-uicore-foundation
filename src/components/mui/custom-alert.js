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
import { Alert } from "@mui/material";

const CustomAlert = ({ severity = "info", message = "", hideIcon = false }) => (
  <Alert
    severity={severity}
    icon={!hideIcon}
    sx={{
      justifyContent: "start",
      alignItems: "center",
      mb: 2
    }}
  >
    {message}
  </Alert>
);

export default CustomAlert;
