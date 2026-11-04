import * as React from "react";
import isBoolean from "lodash/isBoolean";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import TruncateText from "../../truncate-text";
import TableCellLink from "./table-cell-link";

const contentStyle = {
  fontWeight: "normal",
  overflowWrap: "break-word",
};

const TableCellContent = ({ row, col, onNavigate, disabled }) => {
  const content = (
    <span style={contentStyle}>
      {col.render ? (
        col.render(row)
      ) : isBoolean(row[col.columnKey]) ? (
        row[col.columnKey] ? (
          <CheckIcon />
        ) : (
          <CloseIcon />
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

  // columns with getHref render as a link; disabled rows or no href fall back to plain text
  const href = !disabled && col.getHref?.(row);
  return href ? (
    <TableCellLink href={href} row={row} onNavigate={onNavigate}>
      {content}
    </TableCellLink>
  ) : (
    content
  );
};

export default TableCellContent;