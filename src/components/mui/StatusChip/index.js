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
import { Chip } from "@mui/material";
import PropTypes from "prop-types";
import { FILE_UPLOAD_STATUS_COLOR } from "../../../utils/constants";

const StatusChip = ({ status }) => {
  const color = FILE_UPLOAD_STATUS_COLOR[status] || "default";
  return (
    <Chip
      color={color}
      label={status}
      variant="outlined"
      sx={{ borderColor: color, color }} // we need this for colors with dot
    />
  );
};

StatusChip.propTypes = {
  status: PropTypes.string.isRequired
};

export default StatusChip;
