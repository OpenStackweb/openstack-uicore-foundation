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
import T from "i18n-react/dist/i18n-react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { visuallyHidden } from "@mui/utils";
import showConfirmDialog from "../showConfirmDialog";
import styles from "./mui-table.module.less";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PropTypes from "prop-types";
import TableCellContent from "./table-cell-content";
import CustomTablePagination from "./CustomTablePagination";

const ARCHIVED_CELL_SX = {
  backgroundColor: "background.light",
  color: "text.disabled"
};

const ACTION_CELL_SX = {
  p: 0,
  textAlign: "center",
  verticalAlign: "middle",
  width: 40,
  minWidth: 40,
  maxWidth: 40
};

const MuiTable = ({
  columns = [],
  data = [],
  children,
  totalRows,
  perPage,
  currentPage,
  onPageChange,
  onPerPageChange,
  onSort,
  options = { sortCol: "", sortDir: 1, disableProp: null }, // disableProp is the prop that will disable the row
  getName = (item) => item.name,
  onEdit,
  onArchive,
  onDelete,
  onSelect,
  canDelete = () => true,
  deleteDialogTitle = null,
  deleteDialogBody = null,
  deleteDialogConfirmText = null,
  confirmButtonColor = null
}) => {
  const totalColumnsCount =
    columns.length + (onEdit ? 1 : 0) + (onDelete ? 1 : 0) + (onArchive ? 1 : 0) + (onSelect ? 1 : 0);

  const {sortCol, sortDir} = options;

  const getDisabledSx = (row) =>
    options.disableProp && row[options.disableProp] ? ARCHIVED_CELL_SX : {};

  const getHeaderSx = (col) => ({
    ...(col.width && {
      width: col.width,
      minWidth: col.width,
      maxWidth: col.width
    }),
    ...(col.headSx || {}),
  })

  const getCellSx = (row, col) => ({
    ...(col.width && {
      width: col.width,
      minWidth: col.width,
      maxWidth: col.width
    }),
    ...(col.cellSx || {}),
    ...getDisabledSx(row)
  });

  const getActionCellSx = (row) => ({
    ...ACTION_CELL_SX,
    ...getDisabledSx(row)
  });

  const handleDelete = async (item) => {
    const isConfirmed = await showConfirmDialog({
      title: deleteDialogTitle || T.translate("general.are_you_sure"),
      text:
        typeof deleteDialogBody === "function"
          ? deleteDialogBody(getName(item))
          : deleteDialogBody ||
          `${T.translate("general.row_remove_warning")} ${getName(item)}`,
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: confirmButtonColor || "error",
      confirmButtonText:
        deleteDialogConfirmText || T.translate("general.yes_delete")
    });

    if (isConfirmed) {
      onDelete(item.id);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper elevation={0} sx={{ width: "100%", mb: 2 }}>
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 0, boxShadow: "none" }}
        >
          <Table sx={{ tableLayout: "fixed" }}>
            {/* TABLE HEADER */}
            <TableHead sx={{ backgroundColor: "#EAEDF4" }}>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.columnKey}
                    sx={getHeaderSx(col)}
                    align={col.align ?? "left"}
                  >
                    {col.sortable ? (
                      <TableSortLabel
                        active={sortCol === col.columnKey}
                        direction={
                          sortCol === col.columnKey && sortDir === -1
                            ? "desc"
                            : "asc"
                        }
                        onClick={() => onSort(col.columnKey, sortDir * -1)}
                      >
                        {col.header}
                        {sortCol === col.columnKey ? (
                          <Box component="span" sx={visuallyHidden}>
                            {sortDir === -1
                              ? T.translate("mui_table.sorted_desc")
                              : T.translate("mui_table.sorted_asc")}
                          </Box>
                        ) : null}
                      </TableSortLabel>
                    ) : (
                      col.header
                    )}
                  </TableCell>
                ))}
                {onEdit && <TableCell sx={ACTION_CELL_SX} />}
                {onArchive && <TableCell sx={{ ...ACTION_CELL_SX, width: 80, minWidth: 80, maxWidth: 80 }} />}
                {onDelete && <TableCell sx={ACTION_CELL_SX} />}
                {onSelect && <TableCell sx={ACTION_CELL_SX} />}
              </TableRow>
            </TableHead>

            {/* TABLE BODY */}
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  {/* Main content columns */}
                  {columns.map((col) => (
                    <TableCell
                      key={col.columnKey}
                      align={col.align ?? "left"}
                      className={`${col.dottedBorder && styles.dottedBorderLeft} ${col.className}`}
                      sx={getCellSx(row, col)}
                    >
                      <TableCellContent row={row} col={col} />
                    </TableCell>
                  ))}
                  {/* Edit column */}
                  {onEdit && (
                    <TableCell
                      align="center"
                      className={styles.dottedBorderLeft}
                      sx={getActionCellSx(row)}
                    >
                      <IconButton
                        size="medium"
                        onClick={() => onEdit(row)}
                        sx={{ padding: 0 }}
                        data-testid="action-edit"
                        disabled={options.disableProp && row[options.disableProp]}
                      >
                        <EditIcon fontSize="large" />
                      </IconButton>
                    </TableCell>
                  )}
                  {onArchive && (
                    <TableCell
                      align="center"
                      sx={{ ...getActionCellSx(row), width: 80, minWidth: 80, maxWidth: 80 }}
                      className={styles.dottedBorderLeft}
                    >
                      <Button
                        variant="text"
                        color="inherit"
                        size="large"
                        onClick={() => onArchive(row)}
                        data-testid="action-archive"
                        sx={{
                          fontSize: "1.3rem",
                          fontWeight: "normal",
                          lineHeight: "2.2rem",
                          minWidth: 0,
                          padding: 0,
                          color: "rgba(0,0,0,0.56)"
                        }}
                        // bypass disabled if disableProp is "is_archived"
                        disabled={options.disableProp && options.disableProp !== "is_archived" && row[options.disableProp]}
                      >
                        {row.is_archived
                          ? T.translate("general.unarchive")
                          : T.translate("general.archive")}
                      </Button>
                    </TableCell>
                  )}
                  {/* Delete column */}
                  {onDelete && (
                    <TableCell
                      align="center"
                      className={styles.dottedBorderLeft}
                      sx={getActionCellSx(row)}
                    >
                      {canDelete(row) && (
                        <IconButton
                          size="medium"
                          onClick={() => handleDelete(row)}
                          data-testid="action-delete"
                          sx={{ padding: 0 }}
                          disabled={options.disableProp && row[options.disableProp]}
                        >
                          <DeleteIcon fontSize="large" />
                        </IconButton>
                      )}
                    </TableCell>
                  )}
                  {onSelect && (
                    <TableCell
                      align="center"
                      sx={getActionCellSx(row)}
                      className={styles.dottedBorderLeft}
                    >
                      <IconButton
                        size="medium"
                        onClick={() => onSelect(row)}
                        data-testid="action-select"
                        sx={{ padding: 0 }}
                        disabled={options.disableProp && row[options.disableProp]}
                      >
                        <ArrowForwardIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {/* Here we inject extra rows passed as children */}
              {children}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={totalColumnsCount} align="center">
                    {T.translate("mui_table.no_items")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* PAGINATION */}
        {perPage && currentPage && onPageChange && (
          <CustomTablePagination
            totalRows={totalRows}
            perPage={perPage}
            currentPage={currentPage}
            onPageChange={onPageChange}
            onPerPageChange={onPerPageChange}
          />
        )}
      </Paper>
    </Box>
  );
};

MuiTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  children: PropTypes.node,
  totalRows: PropTypes.number,
  perPage: PropTypes.number,
  currentPage: PropTypes.number,
  onPageChange: PropTypes.func,
  onPerPageChange: PropTypes.func,
  onSort: PropTypes.func,
  options: PropTypes.object,
  getName: PropTypes.func,
  onEdit: PropTypes.func,
  onArchive: PropTypes.func,
  onDelete: PropTypes.func,
  onSelect: PropTypes.func,
  canDelete: PropTypes.func,
  deleteDialogTitle: PropTypes.string,
  deleteDialogBody: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  deleteDialogConfirmText: PropTypes.string,
  confirmButtonColor: PropTypes.string
};

export default MuiTable;
