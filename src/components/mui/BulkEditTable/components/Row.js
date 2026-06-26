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
import Cell from "./Cell";
import styles from "../BulkEditTable.module.less";

// the 250px min-width while editing comes from the .bulkEditCol class
// (applied via className below) so it isn't duplicated here
const getCellStyle = (col) => ({
  ...(col.width
    ? { width: col.width, minWidth: col.width, maxWidth: col.width }
    : {}),
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
    actions,
    idKey
  } = props;

  const isEditingRow = isSelected && editEnabled;

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
          onChange={onToggle}
          slotProps={{ input: { "aria-label": `Select row ${row[idKey]}` } }}
        />
      </TableCell>
      <TableCell sx={{ fontWeight: "normal" }}>{row[idKey]}</TableCell>
      {columns
        .filter((col) => col.columnKey !== idKey)
        .map((col) => (
          <TableCell
            key={`${row[idKey]}_${col.columnKey}`}
            className={
              isEditingRow && col.editableField
                ? styles.bulkEditCol
                : styles.dataColumn
            }
            sx={{ fontWeight: "normal" }}
            style={getCellStyle(col)}
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
      {(actions?.edit || actions?.delete) && (
        <TableCell
          align="center"
          className={`${styles.actionColumn} ${styles.dottedBorderLeft}`}
          sx={{ backgroundColor: "#fff" }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
            {actions.edit && (
              <IconButton
                size="medium"
                onClick={() => actions.edit.onClick(row)}
                sx={{ padding: 0 }}
                aria-label={`Edit event ${row[idKey]}`}
              >
                <EditIcon fontSize="large" />
              </IconButton>
            )}
            {actions.delete && (
              <IconButton
                size="medium"
                onClick={() => actions.delete.onClick(row)}
                sx={{ padding: 0 }}
                aria-label={`Delete event ${row[idKey]}`}
              >
                <DeleteIcon fontSize="large" />
              </IconButton>
            )}
          </Box>
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
  actions: PropTypes.object,
  idKey: PropTypes.string
};

Row.defaultProps = {
  idKey: "id"
};

export default Row;
