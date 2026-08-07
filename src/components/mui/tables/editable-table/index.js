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
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { IconButton, TextField } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import styles from "../components/styles.module.less";

import TableCellContent from "../components/table-cell-content";
import TableShell from "../components/table-shell";
import createDeleteHandler from "../components/create-delete-handler";
import SortableHeaderContent from "../components/sortable-header-content";
import {
  getResponsiveTableSx,
  getColumnWidthSx,
  getArchivedRowSx,
  getActionCellSx,
  ACTION_CELL_SX
} from "../components/table-styles";

const validateValue = (value, validation) => {
  if (!validation) return { isValid: true };

  // validate with yup schema
  if (
    validation.schema &&
    typeof validation.schema.validateSync === "function"
  ) {
    try {
      validation.schema.validateSync(value);
      return { isValid: true, message: null };
    } catch (err) {
      return { isValid: false, message: err.message };
    }
  }

  return { isValid: true };
};

// Updated component to handle editable cells with hover edit icon
const EditableCell = ({ value, isEditing, onBlur, validation }) => {
  const [inputValue, setInputValue] = React.useState(value);
  const [isHovering, setIsHovering] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    setInputValue(value);
    setError(null);
  }, [value]);

  const handleValidationAndSave = (newValue) => {
    const { isValid, message } = validateValue(newValue, validation);

    if (isValid) {
      setError(null);
      onBlur(newValue, true);
    } else {
      setError(message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleValidationAndSave(inputValue);
    }
  };

  if (isEditing) {
    return (
      <TextField
        autoFocus
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          if (error) setError(null);
        }}
        onBlur={() => {
          handleValidationAndSave(inputValue);
        }}
        onKeyDown={handleKeyDown}
        size="small"
        fullWidth
        variant="standard"
        error={!!error}
        helperText={error}
      />
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        position: "relative",
        width: "100%",
        height: "100%"
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <span style={{ flex: 1, fontWeight: "normal" }}>{value}</span>
      {isHovering && (
        <EditIcon
          fontSize="small"
          sx={{
            opacity: 0.5,
            position: "absolute",
            right: 0,
            "&:hover": {
              opacity: 1
            }
          }}
        />
      )}
    </Box>
  );
};

const MuiTableEditable = ({
  columns = [],
  data = [],
  totalRows,
  perPage,
  currentPage,
  onPageChange,
  onPerPageChange,
  onSort,
  options = { sortCol: "", sortDir: 1, disableProp: null },
  getName = (item) => item.name,
  onEdit,
  onArchive,
  onDelete,
  onCellChange, // New prop for handling cell value changes
  deleteDialogBody,
  tableSx = {}
}) => {
  // State to track which cell is currently being edited
  const [editingCell, setEditingCell] = React.useState(null);

  const { sortCol, sortDir } = options;

  const getCellSx = (row, baseSx = {}) => ({
    ...baseSx,
    ...getArchivedRowSx(row, options.disableProp)
  });

  const handleDelete = createDeleteHandler({
    onDelete,
    getName,
    deleteDialogBody,
    confirmButtonColor: "warning"
  });

  const isEditable = (col, row) =>
    typeof col.editable === "function" ? col.editable(row) : !!col.editable;

  // Handler for starting edit mode on a cell
  const handleCellClick = (row, columnKey) => {
    // Check if the column is editable
    const column = columns.find((col) => col.columnKey === columnKey);
    if (column && isEditable(column, row)) {
      setEditingCell({ rowId: row.id, columnKey });
    }
  };

  // Handler for saving changes when editing is complete
  const handleCellBlur = (rowId, columnKey, newValue, isValid) => {
    if (onCellChange && isValid) {
      onCellChange(rowId, columnKey, newValue);
    }
    setEditingCell(null);
  };

  return (
    <TableShell
      totalRows={totalRows ?? data.length}
      perPage={perPage}
      currentPage={currentPage}
      onPageChange={onPageChange}
      onPerPageChange={onPerPageChange}
    >
      <Table sx={{ ...getResponsiveTableSx(columns.length), ...tableSx }}>
        {/* TABLE HEADER */}
        <TableHead sx={{ backgroundColor: "#EAEAEA" }}>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.columnKey}
                sx={{
                  ...getColumnWidthSx(col),
                  fontWeight: "normal",
                  ...(col.headSx || {})
                }}
                align={col.align ?? "left"}
              >
                <SortableHeaderContent
                  col={col}
                  sortCol={sortCol}
                  sortDir={sortDir}
                  onSort={onSort}
                  sx={{ fontWeight: "normal" }}
                />
              </TableCell>
            ))}
            {onEdit && (
              <TableCell sx={{ ...ACTION_CELL_SX, fontWeight: "normal" }} />
            )}
            {onArchive && (
              <TableCell
                sx={{
                  ...ACTION_CELL_SX,
                  width: 80,
                  minWidth: 80,
                  maxWidth: 80,
                  fontWeight: "normal"
                }}
              />
            )}
            {onDelete && (
              <TableCell sx={{ ...ACTION_CELL_SX, fontWeight: "normal" }} />
            )}
          </TableRow>
        </TableHead>
        {/* TABLE BODY */}
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              {columns.map((col) => (
                <TableCell
                  key={`${row.id}-${col.columnKey}`}
                  onClick={() => handleCellClick(row, col.columnKey)}
                  sx={{
                    ...getColumnWidthSx(col),
                    ...getCellSx(row, {
                      cursor: isEditable(col, row) ? "pointer" : "default",
                      padding: isEditable(col, row) ? "8px 16px" : undefined,
                      ...(col.cellSx || {})
                    })
                  }}
                >
                  {isEditable(col, row) ? (
                    <EditableCell
                      value={row[col.columnKey]}
                      isEditing={
                        editingCell &&
                        editingCell.rowId === row.id &&
                        editingCell.columnKey === col.columnKey
                      }
                      onBlur={(newValue, isValid) =>
                        handleCellBlur(
                          row.id,
                          col.columnKey,
                          newValue,
                          isValid
                        )
                      }
                      validation={col.validation}
                    />
                  ) : (
                    <TableCellContent row={row} col={col} />
                  )}
                </TableCell>
              ))}
              {onEdit && (
                <TableCell
                  sx={{
                    ...getActionCellSx(row, options.disableProp),
                    fontWeight: "normal"
                  }}
                  className={styles.dottedBorderLeft}
                >
                  <IconButton
                    onClick={() => onEdit(row)}
                    size="small"
                    aria-label={T.translate("general.edit")}
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              )}
              {onArchive && (
                <TableCell
                  align="center"
                  sx={{
                    ...getActionCellSx(row, options.disableProp, 80),
                    fontWeight: "normal"
                  }}
                  className={styles.dottedBorderLeft}
                >
                  <Button
                    variant="text"
                    color="inherit"
                    size="small"
                    onClick={() => onArchive(row)}
                    sx={{
                      fontSize: "1.3rem",
                      fontWeight: "normal",
                      lineHeight: "2.2rem",
                      padding: "4px 5px",
                      color: "rgba(0,0,0,0.56)"
                    }}
                  >
                    {row.is_archived
                      ? T.translate("general.unarchive")
                      : T.translate("general.archive")}
                  </Button>
                </TableCell>
              )}
              {onDelete && (
                <TableCell
                  sx={{
                    ...getActionCellSx(row, options.disableProp),
                    fontWeight: "normal"
                  }}
                  className={styles.dottedBorderLeft}
                >
                  <IconButton
                    onClick={() => handleDelete(row)}
                    size="small"
                    aria-label={T.translate("general.delete")}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableShell>
  );
};

MuiTableEditable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      columnKey: PropTypes.string.isRequired,
      header: PropTypes.node,
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      align: PropTypes.string,
      sortable: PropTypes.bool,
      editable: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
      validation: PropTypes.shape({ schema: PropTypes.object }),
      render: PropTypes.func
    })
  ),
  data: PropTypes.arrayOf(PropTypes.object),
  totalRows: PropTypes.number,
  // Pagination only renders when all three are provided — see line 366.
  perPage: PropTypes.number,
  currentPage: PropTypes.number,
  onPageChange: PropTypes.func,
  onPerPageChange: PropTypes.func,
  onSort: PropTypes.func,
  options: PropTypes.shape({
    sortCol: PropTypes.string,
    sortDir: PropTypes.oneOf([1, -1]),
    disableProp: PropTypes.string
  }),
  getName: PropTypes.func,
  onEdit: PropTypes.func,
  onArchive: PropTypes.func,
  onDelete: PropTypes.func,
  onCellChange: PropTypes.func,
  deleteDialogBody: PropTypes.func
};

export default MuiTableEditable;
