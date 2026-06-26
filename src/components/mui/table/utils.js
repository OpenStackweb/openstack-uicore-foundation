import * as React from "react";
import isBoolean from "lodash/isBoolean";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import TruncateText from "../truncate-text";

export const renderCell = (row, col) => {
  if (isBoolean(row[col.columnKey])) {
    return row[col.columnKey] ? (
      <CheckIcon fontSize="large" />
    ) : (
      <CloseIcon fontSize="large" />
    );
  }

  if (col.render) {
    return col.render(row);
  }

  if (col.truncateText) {
    return (
      <TruncateText charLimit={col.truncateText}>
        {row[col.columnKey]}
      </TruncateText>
    );
  }

  return <span style={{ fontWeight: "normal" }}>{row[col.columnKey]}</span>;
};
