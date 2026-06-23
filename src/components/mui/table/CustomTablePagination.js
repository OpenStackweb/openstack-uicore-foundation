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
import TablePagination from "@mui/material/TablePagination";
import PropTypes from "prop-types";
import { DEFAULT_PER_PAGE, FIFTY_PER_PAGE, TWENTY_PER_PAGE } from "../../../utils/constants";

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

const CustomTablePagination = ({ totalRows, perPage, currentPage, onPageChange, onPerPageChange }) => {
  const initialPerPage = React.useRef(perPage);

  let perPageOptions = BASE_PER_PAGE_OPTIONS.includes(initialPerPage.current)
    ? BASE_PER_PAGE_OPTIONS
    : [...BASE_PER_PAGE_OPTIONS, initialPerPage.current].sort((a, b) => a - b);

  if (!onPerPageChange) {
    perPageOptions = [initialPerPage.current];
  }

  const handlePageChange = (_, newPage) => {
    onPageChange(newPage + 1);
  };

  const handleRowsPerPageChange = (ev) => {
    onPerPageChange(ev.target.value);
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
      sx={PAGINATION_SX}
    />
  );
};

CustomTablePagination.propTypes = {
  totalRows: PropTypes.number,
  perPage: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onPerPageChange: PropTypes.func
};

export default CustomTablePagination;
