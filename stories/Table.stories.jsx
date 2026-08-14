import Table from "../src/components/mui/table/mui-table";
import { sampleRows, sampleColumns } from "./_helpers";

export default {
  title: "MUI/Tables/Table",
  component: Table,
  argTypes: {
    onSort: { action: "sort" },
    onEdit: { action: "edit" },
    onDelete: { action: "delete" },
    onPageChange: { action: "page-change" },
    onPerPageChange: { action: "per-page-change" }
  }
};

export const Default = { args: { columns: sampleColumns, data: sampleRows } };

export const Paginated = {
  args: {
    columns: sampleColumns,
    data: sampleRows,
    totalRows: 42,
    perPage: 3,
    currentPage: 1
  }
};

export const Sorted = {
  args: {
    columns: sampleColumns,
    data: sampleRows,
    options: { sortCol: "name", sortDir: 1 }
  }
};

export const Empty = { args: { columns: sampleColumns, data: [] } };

