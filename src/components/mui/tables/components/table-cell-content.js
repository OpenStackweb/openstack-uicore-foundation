import * as React from "react";
import isBoolean from "lodash/isBoolean";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import TruncateText from "../../truncate-text";

const contentStyle = {
  fontWeight: "normal",
  overflowWrap: "break-word",
};

const TableCellContent = ({ row, col }) => {
  return (
    <span style={contentStyle}>
      {col.render ? (
        col.render(row)
      ) : isBoolean(row[col.columnKey]) ? (
        row[col.columnKey] ? (
          <CheckIcon fontSize="large" />
        ) : (
          <CloseIcon fontSize="large" />
        )
      ) : col.truncateText ? (
        <TruncateText charLimit={col.truncateText}>
          {row[col.columnKey]}
        </TruncateText>
      ) : (
        row[col.columnKey]
      )}
    </span>
  );
};

export default TableCellContent;