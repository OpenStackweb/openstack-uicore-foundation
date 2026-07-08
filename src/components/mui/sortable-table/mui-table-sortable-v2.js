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
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableSortLabel from "@mui/material/TableSortLabel";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove
} from "@dnd-kit/sortable";
import { visuallyHidden } from "@mui/utils";

import styles from "./styles.module.less";

import {
  DEFAULT_PER_PAGE,
  FIFTY_PER_PAGE,
  TWENTY_PER_PAGE
} from "../../../utils/constants";
import showConfirmDialog from "../showConfirmDialog";
import SortableRow from "./sortable-row";
import TableCellContent from "../table/table-cell-content";

const getRowId = (row, index, idKey) =>
  row[idKey] !== undefined && row[idKey] !== null
    ? String(row[idKey])
    : String(index);

const MuiTableSortableV2 = ({
  columns = [],
  data = [],
  totalRows,
  perPage,
  currentPage,
  onPageChange,
  onPerPageChange,
  onSort,
  options = { sortCol: "", sortDir: 1 },
  getName = (item) => item.name,
  onEdit,
  onDelete,
  deleteDialogTitle = null,
  deleteDialogBody = null,
  onReorder,
  idKey = "id",
  updateOrderKey = "order"
}) => {
  const handleChangePage = (_, newPage) => {
    onPageChange(newPage + 1);
  };

  const handleChangeRowsPerPage = (ev) => {
    onPerPageChange(parseInt(ev.target.value, 10));
  };

  const basePerPageOptions = [
    DEFAULT_PER_PAGE,
    TWENTY_PER_PAGE,
    FIFTY_PER_PAGE
  ];

  const customPerPageOptions = basePerPageOptions.includes(perPage)
    ? basePerPageOptions
    : [...basePerPageOptions, perPage].sort((a, b) => a - b);

  const { sortCol, sortDir } = options;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = data.findIndex(
      (row, i) => getRowId(row, i, idKey) === active.id
    );
    const newIndex = data.findIndex(
      (row, i) => getRowId(row, i, idKey) === over.id
    );

    if (oldIndex === -1 || newIndex === -1) return;

    const movedItem = data[oldIndex];
    const movedItemId = movedItem?.[idKey] ?? movedItem?.id;

    const reordered = arrayMove(data, oldIndex, newIndex).map((item, idx) =>
      updateOrderKey ? { ...item, [updateOrderKey]: idx + 1 } : item
    );

    const newOrder = updateOrderKey
      ? reordered.find((item) => (item[idKey] ?? item.id) === movedItemId)?.[
      updateOrderKey
      ]
      : undefined;

    onReorder?.(reordered, movedItemId, newOrder);
  };

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
      confirmButtonColor: "#DD6B55",
      confirmButtonText: T.translate("general.yes_delete")
    });

    if (isConfirmed) {
      onDelete(item[idKey] ?? item.id);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper elevation={0} sx={{ width: "100%", mb: 2 }}>
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 0, boxShadow: "none" }}
        >
          <Table>
            {/* TABLE HEADER */}
            <TableHead sx={{ backgroundColor: "#EAEAEA" }}>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.columnKey}
                    sx={{
                      width: col.width,
                      minWidth: col.width,
                      maxWidth: col.width
                    }}
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
                {onEdit && <TableCell sx={{ width: 40 }} />}
                {onDelete && <TableCell sx={{ width: 40 }} />}
                {onReorder && <TableCell sx={{ width: 40 }} />}
              </TableRow>
            </TableHead>

            {/* TABLE BODY */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={data.map((row, i) => getRowId(row, i, idKey))}
                strategy={verticalListSortingStrategy}
              >
                <TableBody>
                  {data.map((row, rowIndex) => (
                    <SortableRow
                      key={getRowId(row, rowIndex, idKey)}
                      id={getRowId(row, rowIndex, idKey)}
                    >
                      {({ dragHandleProps }) => (
                        <>
                          {/* Main content columns */}
                          {columns.map((col) => (
                            <TableCell
                              key={col.columnKey}
                              align={col.align ?? "left"}
                              className={`${col.dottedBorder && styles.dottedBorderLeft
                                } ${col.className}`}
                            >
                              <TableCellContent row={row} col={col} />
                            </TableCell>
                          ))}
                          {/* Edit column */}
                          {onEdit && (
                            <TableCell
                              align="center"
                              sx={{ width: 40 }}
                              className={styles.dottedBorderLeft}
                            >
                              <IconButton
                                size="large"
                                onClick={() => onEdit(row)}
                                sx={{ padding: 0 }}
                              >
                                <EditIcon fontSize="large" />
                              </IconButton>
                            </TableCell>
                          )}
                          {/* Delete column */}
                          {onDelete && (
                            <TableCell
                              align="center"
                              sx={{ width: 40 }}
                              className={styles.dottedBorderLeft}
                            >
                              <IconButton
                                size="large"
                                onClick={() => handleDelete(row)}
                                sx={{ padding: 0 }}
                              >
                                <DeleteIcon fontSize="large" />
                              </IconButton>
                            </TableCell>
                          )}
                          {/* Re order column */}
                          {onReorder && (
                            <TableCell
                              align="center"
                              sx={{ width: 40 }}
                              className={styles.dottedBorderLeft}
                              {...dragHandleProps}
                            >
                              <IconButton size="large">
                                <UnfoldMoreIcon fontSize="large" />
                              </IconButton>
                            </TableCell>
                          )}
                        </>
                      )}
                    </SortableRow>
                  ))}
                  {data.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={
                          columns.length +
                          (onEdit ? 1 : 0) +
                          (onDelete ? 1 : 0) +
                          (onReorder ? 1 : 0)
                        }
                        align="center"
                      ></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </SortableContext>
            </DndContext>
          </Table>
        </TableContainer>

        {/* PAGINATION */}
        {onPerPageChange && onPageChange && (
          <TablePagination
            component="div"
            count={totalRows ?? 0}
            rowsPerPageOptions={customPerPageOptions}
            rowsPerPage={perPage}
            page={currentPage - 1}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={T.translate("mui_table.rows_per_page")}
            sx={{
              ".MuiTablePagination-toolbar": {
                alignItems: "baseline",
                marginTop: "1.6rem"
              },
              ".MuiTablePagination-spacer": {
                display: "none"
              },
              ".MuiTablePagination-displayedRows": {
                marginLeft: "auto"
              }
            }}
          />
        )}
      </Paper>
    </Box>
  );
};

export default MuiTableSortableV2;
