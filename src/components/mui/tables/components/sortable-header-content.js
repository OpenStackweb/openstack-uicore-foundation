import * as React from "react";
import T from "i18n-react/dist/i18n-react";
import Box from "@mui/material/Box";
import TableSortLabel from "@mui/material/TableSortLabel";
import PropTypes from "prop-types";
import { visuallyHidden } from "@mui/utils";

const SortableHeaderContent = ({ col, sortCol, sortDir, onSort, sx }) => {
  if (!col.sortable) {
    return sx ? <span style={sx}>{col.header}</span> : col.header;
  }

  return (
    <TableSortLabel
      active={sortCol === col.columnKey}
      direction={sortCol === col.columnKey && sortDir === -1 ? "desc" : "asc"}
      onClick={() => onSort(col.columnKey, sortDir * -1)}
      sx={sx}
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
  );
};

SortableHeaderContent.propTypes = {
  col: PropTypes.object.isRequired,
  sortCol: PropTypes.string,
  sortDir: PropTypes.oneOf([1, -1]),
  onSort: PropTypes.func,
  sx: PropTypes.object
};

export default SortableHeaderContent;
