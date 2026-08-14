import EditableTable from "../src/components/mui/editable-table/mui-table-editable";
import { sampleRows } from "./_helpers";

export default {
  title: "MUI/Tables/EditableTable",
  component: EditableTable,
  argTypes: { onSort: { action: "sort" }, onPageChange: { action: "page-change" } }
};

export const Default = {
  args: {
    columns: [
      { columnKey: "name", header: "Item", sortable: true },
      { columnKey: "quantity", header: "Qty", align: "right", editable: true },
      { columnKey: "price", header: "Price", align: "right", editable: true }
    ],
    data: sampleRows
  }
};

