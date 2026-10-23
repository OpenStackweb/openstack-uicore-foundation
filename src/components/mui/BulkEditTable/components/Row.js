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
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import Cell from "./Cell";
import RowActionsMenu, {
  getDeleteAction
} from "../../tables/components/row-actions-menu";
import {
  getColumnWidthSx,
  ACTION_CELL_SX
} from "../../tables/components/table-styles";
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
    idKey
  } = props;

  const isEditingRow = isSelected && editEnabled;

  const onRowChange = (ev) => {
    const { value, id } = ev.target;
    onFieldChange(id, value);
  };

  return (
    <TableRow role="row">
      {onDelete && (
        <TableCell align="center" sx={ACTION_CELL_SX}>
          <RowActionsMenu actions={[getDeleteAction(() => onDelete(row))]} />
        </TableCell>
      )}
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
      {onEdit && (
        <TableCell
          align="center"
          className={`${styles.actionColumn} ${styles.dottedBorderLeft}`}
          sx={{ backgroundColor: "#fff" }}
        >
        <IconButton
          size="medium"
          onClick={() => onEdit(row)}
          sx={{ padding: 0 }}
          aria-label={`Edit row ${row[idKey]}`}
        >
          <EditIcon />
        </IconButton>
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
  idKey: PropTypes.string
};

Row.defaultProps = {
  idKey: "id",
  onEdit: null,
  onDelete: null
};

export default Row;
