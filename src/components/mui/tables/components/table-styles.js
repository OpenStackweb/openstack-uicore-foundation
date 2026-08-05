export const MIN_WIDTH_SMALL = 690; // sm breakpoint content width
export const MIN_WIDTH_WIDE = 910; // md breakpoint content width
export const SMALL_TABLE_MAX_COLUMNS = 3; // fewer than 4 data columns = small
export const DEFAULT_COLUMN_MIN_WIDTH = 40; // floor for columns with no explicit width

export const ARCHIVED_CELL_SX = {
  backgroundColor: "background.light",
  color: "text.disabled"
};

export const ACTION_CELL_SX = {
  p: 0,
  textAlign: "center",
  verticalAlign: "middle",
  width: 40,
  minWidth: 40,
  maxWidth: 40
};

export const getResponsiveTableSx = (dataColumnCount) => ({
  tableLayout: "auto",
  minWidth:
    dataColumnCount <= SMALL_TABLE_MAX_COLUMNS ? MIN_WIDTH_SMALL : MIN_WIDTH_WIDE
});
