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
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

import styles from "../components/styles.module.less";

import TableCellContent from "../components/table-cell-content";
import TableShell from "../components/table-shell";
import createDeleteHandler from "../components/create-delete-handler";
import SortableHeaderContent from "../components/sortable-header-content";
import {
  getResponsiveTableSx,
  DEFAULT_COLUMN_MIN_WIDTH
} from "../components/table-styles";

const MuiTableSortable = ({
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
  updateOrderKey = "order",
  tableSx = {}
}) => {
  const { sortCol, sortDir } = options;

  const handleDragEnd = (result) => {
    if (!result.destination || result.source.index === result.destination.index)
      return;

    const reordered = [...data];
    const [movedItem] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, movedItem);

    // change value based on updateOrderKey
    if (updateOrderKey) {
      reordered.forEach((item, idx) => {
        item[updateOrderKey] = idx + 1;
      });
    }

    const movedItemId = movedItem.id;
    const newOrder = reordered.find(
      (item) => item[idKey || "id"] === movedItemId
    )?.[updateOrderKey];

    onReorder?.(reordered, movedItemId, newOrder);
  };

  const handleDelete = createDeleteHandler({
    onDelete,
    getName,
    deleteDialogTitle,
    deleteDialogBody,
    confirmButtonColor: "#DD6B55"
  });

  return (
    <TableShell
      totalRows={totalRows}
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
                  width: col.width,
                  minWidth: col.width ?? DEFAULT_COLUMN_MIN_WIDTH,
                  maxWidth: col.width
                }}
                align={col.align ?? "left"}
              >
                <SortableHeaderContent
                  col={col}
                  sortCol={sortCol}
                  sortDir={sortDir}
                  onSort={onSort}
                />
              </TableCell>
            ))}
            {onEdit && <TableCell sx={{ width: 40 }} />}
            {onDelete && <TableCell sx={{ width: 40 }} />}
            {onReorder && <TableCell sx={{ width: 40 }} />}
          </TableRow>
        </TableHead>

        {/* TABLE BODY */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="mui-table-droppable">
            {(droppableProvided) => (
              <TableBody
                ref={droppableProvided.innerRef}
                {...droppableProvided.droppableProps}
              >
                {data.map((row, rowIndex) => (
                  <Draggable
                    key={row[idKey] || rowIndex}
                    draggableId={String(row[idKey] || rowIndex)}
                    index={rowIndex}
                  >
                    {(provided, snapshot) => (
                      <TableRow
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{
                          ...(snapshot.isDragging
                            ? {
                                display: "table",
                                width: "100%",
                                tableLayout: "fixed",
                                backgroundColor: "#f0f0f0",
                                transform: "scale(1.01)",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                zIndex: 1,
                                position: "relative",
                                transition:
                                  "transform 0.2s ease, background-color 0.2s ease"
                              }
                            : {
                                transition: "background-color 0.2s ease"
                              })
                        }}
                      >
                        {/* Main content columns */}
                        {columns.map((col) => (
                          <TableCell
                            key={col.columnKey}
                            align={col.align ?? "left"}
                            className={`${
                              col.dottedBorder && styles.dottedBorderLeft
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
                            {...provided.dragHandleProps}
                          >
                            <IconButton size="large">
                              <UnfoldMoreIcon fontSize="large" />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    )}
                  </Draggable>
                ))}
                {droppableProvided.placeholder}
                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center">
                      {T.translate("mui_table.no_items")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            )}
          </Droppable>
        </DragDropContext>
      </Table>
    </TableShell>
  );
};

export default MuiTableSortable;
