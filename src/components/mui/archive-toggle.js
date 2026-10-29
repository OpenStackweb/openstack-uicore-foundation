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
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import T from "i18n-react/dist/i18n-react";

const ACTIVE = "active";
const ARCHIVED = "archived";

// segmented control: a grid shows either its active or its archived rows, never both
const ArchiveToggle = ({ showArchived, onChange }) => (
  <ToggleButtonGroup
    exclusive
    color="primary"
    value={showArchived ? ARCHIVED : ACTIVE}
    // MUI sends null when the selected segment is clicked again; keep the current view
    onChange={(_, value) => value && onChange(value === ARCHIVED)}
    sx={{ whiteSpace: "nowrap" }}
  >
    <ToggleButton value={ACTIVE}>{T.translate("general.active")}</ToggleButton>
    <ToggleButton value={ARCHIVED}>
      {T.translate("general.archived")}
    </ToggleButton>
  </ToggleButtonGroup>
);

ArchiveToggle.propTypes = {
  showArchived: PropTypes.bool,
  onChange: PropTypes.func.isRequired
};

ArchiveToggle.defaultProps = {
  showArchived: false
};

export default ArchiveToggle;
