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
import T from "i18n-react/dist/i18n-react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

const Toolbar = ({ editEnabled, hasSelection, onEdit, onApply, onCancel }) => (
  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
    {editEnabled ? (
      <>
        <Button variant="contained" onClick={onApply}>
          {T.translate("bulk_edit_table.apply_changes")}
        </Button>
        <Button variant="outlined" onClick={onCancel}>
          {T.translate("general.cancel")}
        </Button>
      </>
    ) : (
      <Button variant="contained" onClick={onEdit} disabled={!hasSelection}>
        {T.translate("bulk_edit_table.edit_selected")}
      </Button>
    )}
  </Box>
);

Toolbar.propTypes = {
  editEnabled: PropTypes.bool,
  hasSelection: PropTypes.bool,
  onEdit: PropTypes.func,
  onApply: PropTypes.func,
  onCancel: PropTypes.func
};

export default Toolbar;
