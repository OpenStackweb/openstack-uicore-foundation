import InfiniteTable from "../src/components/mui/infinite-table";
import { sampleRows, sampleColumns } from "./_helpers";

export default {
  title: "MUI/Tables/InfiniteTable",
  component: InfiniteTable,
  argTypes: { onSort: { action: "sort" }, loadMoreData: { action: "load-more" }, onRowEdit: { action: "row-edit" } }
};

export const Default = {
  args: { columns: sampleColumns, data: sampleRows, boxHeight: "300px" }
};

export const Empty = { args: { columns: sampleColumns, data: [], boxHeight: "300px" } };

