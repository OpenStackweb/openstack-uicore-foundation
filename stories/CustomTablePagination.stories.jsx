import CustomTablePagination from "../src/components/mui/table/CustomTablePagination";

export default {
  title: "MUI/Tables/CustomTablePagination",
  component: CustomTablePagination,
  argTypes: { onPageChange: { action: "page-change" }, onPerPageChange: { action: "per-page-change" } }
};

export const Default = { args: { totalRows: 137, perPage: 10, currentPage: 3 } };
export const SinglePage = { args: { totalRows: 4, perPage: 10, currentPage: 1 } };

