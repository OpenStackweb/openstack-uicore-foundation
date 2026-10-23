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
import Tooltip from "@mui/material/Tooltip";
import MoreVertIcon from "@mui/icons-material/MoreVert";

// shared Delete entry so every table's menu labels and styles it the same
export const getDeleteAction = (onClick, disabled = false) => ({
  label: T.translate("general.delete"),
  onClick,
  disabled,
  destructive: true
});

const RowActionsMenu = ({ actions }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  if (!actions.length) return null;

  return (
    <>
      <Tooltip title={T.translate("general.more_actions")}>
        <span>
          <IconButton
            size="medium"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            data-testid="row-actions-menu-trigger"
            aria-label={T.translate("general.more_actions")}
            disabled={actions.every((action) => action.disabled)}
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
        {actions.map((action) => (
          <MenuItem
            key={action.label}
            disabled={action.disabled}
            onClick={() => {
              setAnchorEl(null);
              action.onClick();
            }}
            sx={action.destructive ? { color: "error.main" } : undefined}
          >
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

RowActionsMenu.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      disabled: PropTypes.bool,
      destructive: PropTypes.bool
    })
  ).isRequired
};

export default RowActionsMenu;
