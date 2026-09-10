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

import React, { useEffect } from "react";
import PropTypes from "prop-types";
import T from "i18n-react/dist/i18n-react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import Toolbar from "./components/Toolbar";
import Heading from "./components/Heading";
import Row from "./components/Row";
import useRowSelection from "./hooks/useRowSelection";
import styles from "./BulkEditTable.module.less";
import CustomTablePagination from "../tables/components/CustomTablePagination";
import parsePaginationPosition from "../tables/components/pagination-position";
import showConfirmDialog from "../showConfirmDialog";
import {
  RESPONSIVE_TABLE_SX,
  getActionsMenuBreakpoint
} from "../tables/components/table-styles";

const BulkEditTable = ({
  options,
  columns,
  data,
  onSort,
  onUpdate,
  totalRows,
  perPage,
  currentPage,
  onPageChange,
  onPerPageChange,
  paginationPosition,
  pageSliderVisible,
  idKey,
  onEdit,
  onDelete,
  getName,
  deleteDialogTitle,
  deleteDialogBody,
  deleteDialogConfirmText,
  confirmButtonColor
}) => {
  const {
    selectedRows,
    isSelected,
    toggleRow,
    isAllSelected,
    toggleAll,
    editField,
    editEnabled,
    enterEditMode,
    cancel,
    reset
  } = useRowSelection(idKey);

  const collapseActions = (onEdit ? 1 : 0) + (onDelete ? 1 : 0) >= 2;
  const actionsBreakpoint = getActionsMenuBreakpoint(columns.length);

  const dataIds = data.map((row) => row[idKey]).join(",");

  // reset selection/edit state whenever the set of rows shown changes
  // (pagination, filtering, sorting, search, etc.)
  useEffect(() => {
    reset();
  }, [dataIds]);

  const getSortDir = (columnKey) =>
    columnKey === options.sortCol ? options.sortDir : null;

  const handleUpdateEvents = (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
    Promise.resolve(onUpdate(selectedRows))
      .then(() => reset())
      .catch((error) => {
        console.error("Error updating events:", error);
      });
  };

  // Wraps the onDelete prop with the same confirm-before-delete UX other mui
  // tables already have (see mui-table.js's handleDelete), so consumers don't
  // need to wire up their own dialog. Matches mui-table.js's contract:
  // onDelete is called with the row's id, not the full row.
  const handleDelete = async (item) => {
    const isConfirmed = await showConfirmDialog({
      title: deleteDialogTitle || T.translate("general.are_you_sure"),
      text:
        typeof deleteDialogBody === "function"
          ? deleteDialogBody(getName(item))
          : deleteDialogBody ||
            `${T.translate("general.row_remove_warning")} ${getName(item)}`,
      iconType: "warning",
      confirmButtonColor: confirmButtonColor || "error",
      confirmButtonText:
        deleteDialogConfirmText || T.translate("general.yes_delete")
    });

    if (isConfirmed) {
      onDelete(item[idKey]);
    }
  };

  const showPagination = !!(perPage && currentPage && onPageChange);
  const { showTop, showBottom } = parsePaginationPosition(paginationPosition);
  const renderPagination = (showRange) => (
    <CustomTablePagination
      totalRows={totalRows}
      perPage={perPage}
      currentPage={currentPage}
      onPageChange={onPageChange}
      onPerPageChange={onPerPageChange}
      showRange={showRange}
      pageSliderVisible={pageSliderVisible}
    />
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
          mb: 2
        }}
      >
        <Toolbar
          editEnabled={editEnabled}
          selectedCount={selectedRows.length}
          onEdit={enterEditMode}
          onApply={handleUpdateEvents}
          onCancel={cancel}
        />
        {showPagination && showTop && (
          <Box sx={{ display: { xs: "none", sm: "block" } }}>{renderPagination(false)}</Box>
        )}
      </Box>
      <Paper elevation={0} sx={{ width: "100%", mb: 2 }}>
        <TableContainer
          component={Paper}
          className={styles.tableWrapper}
          sx={{ borderRadius: 0, boxShadow: "none" }}
        >
          <Table sx={RESPONSIVE_TABLE_SX}>
            <TableHead sx={{ backgroundColor: "#EAEDF4" }}>
              <TableRow>
                <TableCell
                  align="center"
                  className={styles.checkColumn}
                  sx={{ backgroundColor: "#EAEDF4" }}
                >
                  <Checkbox
                    checked={isAllSelected(data)}
                    onChange={() => {
                      if (!editEnabled) toggleAll(data);
                    }}
                    disabled={editEnabled}
                    slotProps={{ input: { "aria-label": "select all" } }}
                  />
                </TableCell>
                {columns.map((col, i) => {
                  const sortable = !!col.sortable;

                  return (
                    <Heading
                      editEnabled={editEnabled}
                      onSort={onSort}
                      sortDir={getSortDir(col.columnKey)}
                      sortable={sortable}
                      columnIndex={i}
                      columnKey={col.columnKey}
                      col={col}
                      key={`heading_${col.columnKey}`}
                    >
                      {col.header ?? col.label ?? col.value}
                    </Heading>
                  );
                })}
                {(onEdit || onDelete) && (
                  <TableCell
                    align="center"
                    className={styles.actionColumn}
                    sx={{ backgroundColor: "#EAEDF4" }}
                  >
                    {options.actionsHeader || " "}
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {columns.length > 0 &&
                data.map((row) => (
                  <Row
                    key={`row_${row[idKey]}`}
                    row={row}
                    idKey={idKey}
                    editEnabled={editEnabled}
                    isSelected={isSelected(row[idKey])}
                    editRow={selectedRows.find((r) => r[idKey] === row[idKey]) || row}
                    onToggle={() => toggleRow(row)}
                    onFieldChange={(key, value) =>
                      editField(row[idKey], key, value)
                    }
                    columns={columns}
                    onEdit={onEdit}
                    onDelete={onDelete ? handleDelete : null}
                    collapseActions={collapseActions}
                    actionsBreakpoint={actionsBreakpoint}
                  />
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        {showPagination && showBottom && renderPagination(true)}
      </Paper>
    </Box>
  );
};

BulkEditTable.propTypes = {
  options: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  onSort: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  idKey: PropTypes.string,
  totalRows: PropTypes.number,
  perPage: PropTypes.number,
  currentPage: PropTypes.number,
  onPageChange: PropTypes.func,
  onPerPageChange: PropTypes.func,
  paginationPosition: PropTypes.string,
  pageSliderVisible: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  getName: PropTypes.func,
  deleteDialogTitle: PropTypes.string,
  deleteDialogBody: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  deleteDialogConfirmText: PropTypes.string,
  confirmButtonColor: PropTypes.string
};

BulkEditTable.defaultProps = {
  idKey: "id",
  onEdit: null,
  onDelete: null,
  getName: (item) => item.name,
  deleteDialogTitle: null,
  deleteDialogBody: null,
  deleteDialogConfirmText: null,
  confirmButtonColor: null
};

export default BulkEditTable;
