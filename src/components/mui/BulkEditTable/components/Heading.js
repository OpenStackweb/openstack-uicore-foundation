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
import T from "i18n-react/dist/i18n-react";
import Box from "@mui/material/Box";
import TableCell from "@mui/material/TableCell";
import TableSortLabel from "@mui/material/TableSortLabel";
import { visuallyHidden } from "@mui/utils";

const Heading = (props) => {
  const {
    editEnabled,
    sortable,
    sortDir,
    onSort,
    columnIndex,
    columnKey,
    width,
    children
  } = props;

  const handleSort = () => {
    if (!onSort || !sortable || editEnabled) return;

    onSort(columnIndex, columnKey, sortDir ? sortDir * -1 : 1);
  };

  const headerSx = width ? { width, minWidth: width, maxWidth: width } : {};

  if (!sortable || editEnabled) {
    return <TableCell sx={headerSx}>{children}</TableCell>;
  }

  return (
    <TableCell sx={headerSx}>
      <TableSortLabel
        active={!!sortDir}
        direction={sortDir === -1 ? "desc" : "asc"}
        onClick={handleSort}
      >
        {children}
        {sortDir ? (
          <Box component="span" sx={visuallyHidden}>
            {sortDir === -1
              ? T.translate("bulk_edit_table.sorted_desc")
              : T.translate("bulk_edit_table.sorted_asc")}
          </Box>
        ) : null}
      </TableSortLabel>
    </TableCell>
  );
};

Heading.propTypes = {
  editEnabled: PropTypes.bool,
  onSort: PropTypes.func,
  sortDir: PropTypes.number,
  columnIndex: PropTypes.number,
  columnKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sortable: PropTypes.bool,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  children: PropTypes.node
};

export default Heading;
