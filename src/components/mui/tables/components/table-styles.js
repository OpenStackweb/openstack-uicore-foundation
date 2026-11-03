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

export const RESPONSIVE_TABLE_SX = {
  tableLayout: "auto"
};

export const getActionsMenuBreakpoint = (dataColumnCount) =>
  dataColumnCount <= SMALL_TABLE_MAX_COLUMNS ? "md" : "lg";

export const getColumnWidthSx = (col) => ({
  minWidth: col.width ?? DEFAULT_COLUMN_MIN_WIDTH,
  ...(col.width && {
    width: col.width,
    maxWidth: col.width
  })
});

export const getArchivedRowSx = (row, disableProp) =>
  disableProp && row[disableProp] ? ARCHIVED_CELL_SX : {};

export const getActionCellSx = (row, disableProp, widthOverride) => ({
  ...ACTION_CELL_SX,
  ...(widthOverride && {
    width: widthOverride,
    minWidth: widthOverride,
    maxWidth: widthOverride
  }),
  ...getArchivedRowSx(row, disableProp)
});
