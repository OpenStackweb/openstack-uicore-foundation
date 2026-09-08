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
import { useCallback, useState } from "react";
import T from "i18n-react/dist/i18n-react";
import TablePagination from "@mui/material/TablePagination";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PropTypes from "prop-types";
import { DEFAULT_PER_PAGE, FIFTY_PER_PAGE, TWENTY_PER_PAGE } from "../../../../utils/constants";

const PAGINATION_SX = {
  ".MuiTablePagination-toolbar": {
    alignItems: "baseline",
    marginTop: "1.6rem"
  },
  ".MuiTablePagination-selectLabel": {
    color: "rgba(0, 0, 0, 0.6)",
    fontSize: "12px",
    fontWeight: "normal"
  },
  ".MuiTablePagination-select": {
    color: "rgba(0, 0, 0, 0.6)",
    fontSize: "12px",
    fontWeight: "normal"
  },
  ".MuiTablePagination-spacer": {
    display: "none"
  },
  ".MuiTablePagination-displayedRows": {
    marginLeft: "auto"
  }
};

const BASE_PER_PAGE_OPTIONS = [DEFAULT_PER_PAGE, TWENTY_PER_PAGE, FIFTY_PER_PAGE];

// Custom actions cell: keeps the default prev/next arrows but adds a
// "go to page" toggle between them, wired to the parent's edit-mode state.
const PaginationActions = ({ count, page, rowsPerPage, onPageChange, onEditClick }) => {
  const lastPage = Math.max(0, Math.ceil(count / rowsPerPage) - 1);

  return (
    <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0, ml: 1 }}>
      <IconButton
        onClick={(ev) => onPageChange(ev, page - 1)}
        disabled={page === 0}
        aria-label={T.translate("mui_table.previous_page")}
        size="small"
      >
        <KeyboardArrowLeft />
      </IconButton>
      <Tooltip title={T.translate("mui_table.go_to_page")}>
        <IconButton
          onClick={onEditClick}
          size="small"
          aria-label={T.translate("mui_table.go_to_page")}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <IconButton
        onClick={(ev) => onPageChange(ev, page + 1)}
        disabled={page >= lastPage}
        aria-label={T.translate("mui_table.next_page")}
        size="small"
      >
        <KeyboardArrowRight />
      </IconButton>
    </Box>
  );
};

PaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired
};

const CustomTablePagination = ({
  totalRows,
  perPage,
  currentPage,
  onPageChange,
  onPerPageChange,
  showPageJump = false
}) => {
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [pageInput, setPageInput] = useState(String(currentPage));

  const totalPages = Math.max(1, Math.ceil((totalRows ?? 0) / perPage));

  const perPageOptions = React.useMemo(() => {
    if (!onPerPageChange) return [perPage];
    return BASE_PER_PAGE_OPTIONS.includes(perPage)
      ? BASE_PER_PAGE_OPTIONS
      : [...BASE_PER_PAGE_OPTIONS, perPage].sort((a, b) => a - b);
  }, [perPage, onPerPageChange]);

  const handlePageChange = (_, newPage) => {
    onPageChange(newPage + 1);
  };

  const handleRowsPerPageChange = (ev) => {
    onPerPageChange(parseInt(ev.target.value, 10));
  };

  const startPageEdit = useCallback(() => {
    setPageInput(String(currentPage));
    setIsEditingPage(true);
  }, [currentPage]);

  const renderActions = useCallback(
    (actionsProps) =>
      isEditingPage ? null : (
        <PaginationActions {...actionsProps} onEditClick={startPageEdit} />
      ),
    [startPageEdit, isEditingPage]
  );

  const cancelPageEdit = () => setIsEditingPage(false);

  const commitPageEdit = () => {
    const parsed = parseInt(pageInput, 10);
    if (!Number.isNaN(parsed)) {
      const clamped = Math.min(Math.max(parsed, 1), totalPages);
      if (clamped !== currentPage) onPageChange(clamped);
    }
    setIsEditingPage(false);
  };

  const handlePageInputKeyDown = (ev) => {
    if (ev.key === "Enter") commitPageEdit();
    if (ev.key === "Escape") cancelPageEdit();
  };

  const renderDisplayedRows = ({ from, to, count }) => {
    if (!isEditingPage) {
      return `${from}-${to === -1 ? count : to} ${T.translate("mui_table.of")} ${count}`;
    }
    return (
      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
        <TextField
          size="small"
          autoFocus
          value={pageInput}
          onChange={(ev) => setPageInput(ev.target.value.replace(/\D/g, ""))}
          onKeyDown={handlePageInputKeyDown}
          inputProps={{
            inputMode: "numeric",
            pattern: "[0-9]*",
            "aria-label": T.translate("mui_table.go_to_page"),
            style: { textAlign: "center", padding: "4px 4px 0px" }
          }}
          sx={{ width: 56 }}
        />
        <Tooltip title={T.translate("general.confirm")}>
          <IconButton
            size="small"
            onClick={commitPageEdit}
            aria-label={T.translate("general.confirm")}
          >
            <CheckIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={T.translate("general.cancel")}>
          <IconButton
            size="small"
            onClick={cancelPageEdit}
            aria-label={T.translate("general.cancel")}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  };

  return (
    <TablePagination
      component="div"
      count={totalRows ?? 0}
      rowsPerPageOptions={perPageOptions}
      rowsPerPage={perPage}
      page={currentPage - 1}
      onPageChange={handlePageChange}
      onRowsPerPageChange={onPerPageChange ? handleRowsPerPageChange : undefined}
      labelRowsPerPage={T.translate("mui_table.rows_per_page")}
      labelDisplayedRows={showPageJump ? renderDisplayedRows : undefined}
      // swap the <p> for a <span> only while editing (avoids invalid nesting) — swapping it always drops the default body2 styling from the "x-y of z" text
      slots={showPageJump && isEditingPage ? { displayedRows: "span" } : undefined}
      ActionsComponent={showPageJump ? renderActions : undefined}
      sx={PAGINATION_SX}
    />
  );
};

CustomTablePagination.propTypes = {
  totalRows: PropTypes.number,
  perPage: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onPerPageChange: PropTypes.func,
  showPageJump: PropTypes.bool
};

export default CustomTablePagination;
