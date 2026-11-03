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

const Toolbar = ({ editEnabled, selectedCount, onEdit, onApply, onCancel }) => (
  <Box sx={{ display: "flex", gap: 1, width: { xs: "100%", sm: "auto" } }}>
    {editEnabled ? (
      <>
        <Button
          variant="contained"
          onClick={onApply}
          sx={{ flex: { xs: 1, sm: "0 0 auto" } }}
        >
          {T.translate("bulk_edit_table.apply_changes")}
        </Button>
        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{ flex: { xs: 1, sm: "0 0 auto" } }}
        >
          {T.translate("general.cancel")}
        </Button>
      </>
    ) : (
      <Button
        variant="contained"
        onClick={onEdit}
        disabled={selectedCount === 0}
        sx={{ width: { xs: "100%", sm: "auto" } }}
      >
        {T.translate("bulk_edit_table.edit_selected")}
        {selectedCount > 0 ? ` (${selectedCount})` : ""}
      </Button>
    )}
  </Box>
);

Toolbar.propTypes = {
  editEnabled: PropTypes.bool,
  selectedCount: PropTypes.number,
  onEdit: PropTypes.func,
  onApply: PropTypes.func,
  onCancel: PropTypes.func
};

Toolbar.defaultProps = {
  selectedCount: 0
};

export default Toolbar;
