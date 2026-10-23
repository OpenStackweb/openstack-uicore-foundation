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
  paginationPosition,
  pageSliderVisible,
  onSort,
  options: userOptions = {},
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
  const options = {
    sortCol: "",
    sortDir: 1,
    disableProp: null, // disableProp is the prop that will disable the row
    ...userOptions
  };
  const activeActionsCount =
    (onDelete ? 1 : 0) + (onArchive ? 1 : 0) + (onSelect ? 1 : 0);

  const totalColumnsCount = columns.length + activeActionsCount;

  const {sortCol, sortDir} = options;

  const getHeaderSx = (col) => ({
    ...getColumnWidthSx(col),
    ...(col.headSx || {})
  });

  const getCellSx = (row, col) => ({
    ...getColumnWidthSx(col),
    ...(col.cellSx || {}),
    ...getArchivedRowSx(row, options.disableProp)
  });

  // whole row edits on click; disabled rows stay inert
  const getRowEditProps = (row) =>
    onEdit && !(options.disableProp && row[options.disableProp])
      ? {
          hover: true,
          onClick: (ev) => {
            // ignore clicks on controls rendered inside cells
            if (!ev.target.closest("button, a, input, [role=button]")) onEdit(row);
          },
          sx: { cursor: "pointer" }
        }
      : {};

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
      paginationPosition={paginationPosition}
      pageSliderVisible={pageSliderVisible}
    >
      <Table sx={{ ...RESPONSIVE_TABLE_SX, ...tableSx }}>
        {/* TABLE HEADER */}
        <TableHead sx={{ backgroundColor: "#EAEDF4" }}>
          <TableRow>
            {onDelete && <TableCell sx={ACTION_CELL_SX} />}
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
            {onArchive && <TableCell sx={ACTION_CELL_SX} />}
            {onSelect && <TableCell sx={ACTION_CELL_SX} />}
          </TableRow>
        </TableHead>

        {/* TABLE BODY */}
        <TableBody>
          {/* rows with renderRow (e.g. NotesRow) replace the default row, receiving the column count */}
          {data.map((row) => row.renderRow ? (
            <React.Fragment key={row.id}>{row.renderRow(totalColumnsCount)}</React.Fragment>
          ) : (
            <TableRow key={row.id} {...getRowEditProps(row)}>
              {/* Delete column */}
              {onDelete && (
                <TableCell
                  align="center"
                  sx={getActionCellSx(row, options.disableProp)}
                  onClick={(ev) => ev.stopPropagation()}
                >
                  {canDelete(row) && (
                    <RowActionsMenu
                      actions={[{
                        label: T.translate("general.delete"),
                        onClick: () => handleDelete(row),
                        disabled: !!(options.disableProp && row[options.disableProp])
                      }]}
                    />
                  )}
                </TableCell>
              )}
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
              {onArchive && (
                <TableCell
                  align="center"
                  sx={getActionCellSx(row, options.disableProp)}
                  onClick={(ev) => ev.stopPropagation()}
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
                          <UnarchiveIcon />
                        ) : (
                          <ArchiveIcon />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              )}
              {onSelect && (
                <TableCell
                  align="center"
                  sx={getActionCellSx(row, options.disableProp)}
                  className={styles.dottedBorderLeft}
                  onClick={(ev) => ev.stopPropagation()}
                >
                  <Tooltip title={T.translate("general.view")}>
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
  paginationPosition: PropTypes.string,
  pageSliderVisible: PropTypes.bool,
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
