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

import * as React from "react";
import PropTypes from "prop-types";
import T from "i18n-react/dist/i18n-react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import MoreVertIcon from "@mui/icons-material/MoreVert";

// built-in Edit/Delete keep every table's menu consistent; `actions` holds any extra items
const RowActionsMenu = ({ actions = [], onEdit, onDelete, disabled = false }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const hasBuiltIns = !!(onEdit || onDelete);
  if (!hasBuiltIns && !actions.length) return null;

  return (
    <>
      <Tooltip title={T.translate("general.more_actions")}>
        <span>
          <IconButton
            size="medium"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            data-testid="row-actions-menu-trigger"
            aria-label={T.translate("general.more_actions")}
            disabled={
              (!hasBuiltIns || disabled) && actions.every((action) => action.disabled)
            }
          >
            <MoreVertIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {onEdit && (
          <MenuItem
            disabled={disabled}
            onClick={() => {
              setAnchorEl(null);
              onEdit();
            }}
          >
            {T.translate("general.edit")}
          </MenuItem>
        )}
        {actions.map((action) => (
          <MenuItem
            key={action.label}
            disabled={action.disabled}
            onClick={() => {
              setAnchorEl(null);
              action.onClick();
            }}
          >
            {action.label}
          </MenuItem>
        ))}
        {onDelete && (onEdit || actions.length > 0) && <Divider />}
        {onDelete && (
          <MenuItem
            disabled={disabled}
            onClick={() => {
              setAnchorEl(null);
              onDelete();
            }}
            sx={{ color: "error.main" }}
          >
            {T.translate("general.delete")}
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

RowActionsMenu.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      disabled: PropTypes.bool
    })
  ),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  disabled: PropTypes.bool
};

export default RowActionsMenu;
