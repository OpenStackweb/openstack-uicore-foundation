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
import Box from "@mui/material/Box";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import T from "i18n-react/dist/i18n-react";
import Cell from "./Cell";
import RowActionsMenu from "../../tables/components/row-actions-menu";
import { getColumnWidthSx } from "../../tables/components/table-styles";
import styles from "../BulkEditTable.module.less";

// the 250px min-width while editing comes from the .bulkEditCol class
// (applied via className below), so it overrides the adaptive width here
const getCellSx = (col, isEditingRow) => ({
  ...getColumnWidthSx(col),
  ...(isEditingRow && col.editableField ? { minWidth: 250 } : {}),
  ...col.customStyle
});

const Row = (props) => {
  const {
    row,
    columns,
    editEnabled,
    isSelected,
    editRow,
    onToggle,
    onFieldChange,
    onEdit,
    onDelete,
    idKey,
    collapseActions,
    actionsBreakpoint
  } = props;

  const isEditingRow = isSelected && editEnabled;

  const rowActions = [
    onEdit && {
      label: T.translate("general.edit"),
      onClick: () => onEdit(row)
    },
    onDelete && {
      label: T.translate("general.delete"),
      onClick: () => onDelete(row)
    }
  ].filter(Boolean);

  const onRowChange = (ev) => {
    const { value, id } = ev.target;
    onFieldChange(id, value);
  };

  return (
    <TableRow role="row" hover>
      <TableCell
        align="center"
        className={styles.checkColumn}
        sx={{ backgroundColor: "#fff" }}
      >
        <Checkbox
          checked={isSelected}
          onChange={() => {
            if (!editEnabled) onToggle();
          }}
          disabled={editEnabled}
          slotProps={{ input: { "aria-label": `Select row ${row[idKey]}` } }}
        />
      </TableCell>
      {columns.map((col) => (
        <TableCell
          key={`${row[idKey]}_${col.columnKey}`}
          className={isEditingRow && col.editableField ? styles.bulkEditCol : ""}
          sx={{ fontWeight: "normal", ...getCellSx(col, isEditingRow) }}
        >
          <Cell
            col={col}
            row={row}
            editRow={editRow}
            isEditingRow={isEditingRow}
            onChange={onRowChange}
          />
        </TableCell>
      ))}
      {(onEdit || onDelete) && (
        <TableCell
          align="center"
          className={`${styles.actionColumn} ${styles.dottedBorderLeft}`}
          sx={{ backgroundColor: "#fff" }}
        >
          <Box
            sx={{
              display: collapseActions
                ? { xs: "none", [actionsBreakpoint]: "flex" }
                : "flex",
              justifyContent: "center",
              gap: 1
            }}
          >
            {onEdit && (
              <IconButton
                size="medium"
                onClick={() => onEdit(row)}
                sx={{ padding: 0 }}
                aria-label={`Edit row ${row[idKey]}`}
              >
                <EditIcon fontSize="large" />
              </IconButton>
            )}
            {onDelete && (
              <IconButton
                size="medium"
                onClick={() => onDelete(row)}
                sx={{ padding: 0 }}
                aria-label={`Delete row ${row[idKey]}`}
              >
                <DeleteIcon fontSize="large" />
              </IconButton>
            )}
          </Box>
          {collapseActions && (
            <Box sx={{ display: { xs: "flex", [actionsBreakpoint]: "none" }, justifyContent: "center" }}>
              <RowActionsMenu actions={rowActions} />
            </Box>
          )}
        </TableCell>
      )}
    </TableRow>
  );
};

Row.propTypes = {
  row: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  editEnabled: PropTypes.bool,
  isSelected: PropTypes.bool,
  editRow: PropTypes.object.isRequired,
  onToggle: PropTypes.func,
  onFieldChange: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  idKey: PropTypes.string,
  collapseActions: PropTypes.bool,
  actionsBreakpoint: PropTypes.string
};

Row.defaultProps = {
  idKey: "id",
  onEdit: null,
  onDelete: null,
  collapseActions: false,
  actionsBreakpoint: "md"
};

export default Row;
