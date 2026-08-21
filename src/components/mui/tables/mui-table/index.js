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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import styles from "../components/styles.module.less";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PropTypes from "prop-types";
import TableCellContent from "../components/table-cell-content";
import TableShell from "../components/table-shell";
import createDeleteHandler from "../components/create-delete-handler";
import SortableHeaderContent from "../components/sortable-header-content";
import RowActionsMenu from "../components/row-actions-menu";
import {
  RESPONSIVE_TABLE_SX,
  getColumnWidthSx,
  getArchivedRowSx,
  getActionCellSx,
  getActionsMenuBreakpoint,
  ACTION_CELL_SX
} from "../components/table-styles";

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
  confirmButtonColor = null,
  tableSx = {}
}) => {
  const activeActionsCount =
    (onEdit ? 1 : 0) + (onDelete ? 1 : 0) + (onArchive ? 1 : 0) + (onSelect ? 1 : 0);
  // responsive:false opts out of collapsing actions into a menu — needed when
  // extra rows (e.g. TotalRow) are passed as children with a static column
  // count that can't track the collapse breakpoint
  const collapseActions = options.responsive !== false && activeActionsCount >= 2;
  const collapseBreakpoint = getActionsMenuBreakpoint(columns.length);

  const totalColumnsCount =
    columns.length + activeActionsCount + (collapseActions ? 1 : 0);

  const {sortCol, sortDir} = options;

  const getHeaderSx = (col) => ({
    ...getColumnWidthSx(col),
    ...(col.headSx || {})
  });

  // individual action cells hide below collapseBreakpoint once actions collapse into a menu
  const getIndividualActionSx = () =>
    collapseActions ? { display: { xs: "none", [collapseBreakpoint]: "table-cell" } } : {};

  const menuCellSx = { display: { xs: "table-cell", [collapseBreakpoint]: "none" } };

  const getRowActions = (row) =>
    [
      onEdit && {
        label: T.translate("general.edit"),
        onClick: () => onEdit(row),
        disabled: !!(options.disableProp && row[options.disableProp])
      },
      onArchive && {
        label: row.is_archived
          ? T.translate("general.unarchive")
          : T.translate("general.archive"),
        onClick: () => onArchive(row),
        disabled: !!(
          options.disableProp &&
          options.disableProp !== "is_archived" &&
          row[options.disableProp]
        )
      },
      onDelete &&
        canDelete(row) && {
          label: T.translate("general.delete"),
          onClick: () => handleDelete(row),
          disabled: !!(options.disableProp && row[options.disableProp])
        },
      onSelect && {
        label: "View",
        onClick: () => onSelect(row),
        disabled: !!(options.disableProp && row[options.disableProp])
      }
    ].filter(Boolean);

  const getCellSx = (row, col) => ({
    ...getColumnWidthSx(col),
    ...(col.cellSx || {}),
    ...getArchivedRowSx(row, options.disableProp)
  });

  const handleDelete = createDeleteHandler({
    onDelete,
    getName,
    deleteDialogTitle,
    deleteDialogBody,
    deleteDialogConfirmText,
    confirmButtonColor: confirmButtonColor || "error"
  });

  return (
    <TableShell
      totalRows={totalRows}
      perPage={perPage}
      currentPage={currentPage}
      onPageChange={onPageChange}
      onPerPageChange={onPerPageChange}
    >
      <Table sx={{ ...RESPONSIVE_TABLE_SX, ...tableSx }}>
        {/* TABLE HEADER */}
        <TableHead sx={{ backgroundColor: "#EAEDF4" }}>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.columnKey}
                sx={getHeaderSx(col)}
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
            {onEdit && <TableCell sx={{ ...ACTION_CELL_SX, ...getIndividualActionSx() }} />}
            {onArchive && <TableCell sx={{ ...ACTION_CELL_SX, ...getIndividualActionSx() }} />}
            {onDelete && <TableCell sx={{ ...ACTION_CELL_SX, ...getIndividualActionSx() }} />}
            {onSelect && <TableCell sx={{ ...ACTION_CELL_SX, ...getIndividualActionSx() }} />}
            {collapseActions && <TableCell sx={{ ...ACTION_CELL_SX, ...menuCellSx }} />}
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
                  sx={{
                    ...getActionCellSx(row, options.disableProp),
                    ...getIndividualActionSx()
                  }}
                >
                  <Tooltip title={T.translate("general.edit")}>
                    <span>
                      <IconButton
                        size="medium"
                        onClick={() => onEdit(row)}
                        sx={{ padding: 0 }}
                        data-testid="action-edit"
                        disabled={options.disableProp && row[options.disableProp]}
                      >
                        <EditIcon fontSize="large" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              )}
              {onArchive && (
                <TableCell
                  align="center"
                  sx={{
                    ...getActionCellSx(row, options.disableProp),
                    ...getIndividualActionSx()
                  }}
                  className={styles.dottedBorderLeft}
                >
                  <Tooltip
                    title={
                      row.is_archived
                        ? T.translate("general.unarchive")
                        : T.translate("general.archive")
                    }
                  >
                    <span>
                      <IconButton
                        size="medium"
                        onClick={() => onArchive(row)}
                        sx={{ padding: 0 }}
                        data-testid="action-archive"
                        // bypass disabled if disableProp is "is_archived"
                        disabled={
                          options.disableProp &&
                          options.disableProp !== "is_archived" &&
                          row[options.disableProp]
                        }
                      >
                        {row.is_archived ? (
                          <UnarchiveIcon fontSize="large" />
                        ) : (
                          <ArchiveIcon fontSize="large" />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              )}
              {/* Delete column */}
              {onDelete && (
                <TableCell
                  align="center"
                  className={styles.dottedBorderLeft}
                  sx={{
                    ...getActionCellSx(row, options.disableProp),
                    ...getIndividualActionSx()
                  }}
                >
                  {canDelete(row) && (
                    <Tooltip title={T.translate("general.delete")}>
                      <span>
                        <IconButton
                          size="medium"
                          onClick={() => handleDelete(row)}
                          data-testid="action-delete"
                          sx={{ padding: 0 }}
                          disabled={options.disableProp && row[options.disableProp]}
                        >
                          <DeleteIcon fontSize="large" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                </TableCell>
              )}
              {onSelect && (
                <TableCell
                  align="center"
                  sx={{
                    ...getActionCellSx(row, options.disableProp),
                    ...getIndividualActionSx()
                  }}
                  className={styles.dottedBorderLeft}
                >
                  <Tooltip title="View">
                    <span>
                      <IconButton
                        size="medium"
                        onClick={() => onSelect(row)}
                        data-testid="action-select"
                        sx={{ padding: 0 }}
                        disabled={options.disableProp && row[options.disableProp]}
                      >
                        <ArrowForwardIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              )}
              {collapseActions && (
                <TableCell
                  align="center"
                  sx={{ ...getActionCellSx(row, options.disableProp), ...menuCellSx }}
                  className={styles.dottedBorderLeft}
                >
                  <RowActionsMenu actions={getRowActions(row)} />
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
    </TableShell>
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
  confirmButtonColor: PropTypes.string,
  tableSx: PropTypes.object
};

export default MuiTable;
