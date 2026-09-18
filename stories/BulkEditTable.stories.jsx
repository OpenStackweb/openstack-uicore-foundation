import BulkEditTable from "../src/components/mui/BulkEditTable";
import { sampleRows } from "./_helpers";

export default {
  title: "MUI/Tables/BulkEditTable",
  component: BulkEditTable,
  argTypes: { onSort: { action: "sort" }, onUpdate: { action: "update" } }
};

export const Default = {
  args: {
    options: { sortCol: "name", sortDir: 1 },
    columns: [
      { columnKey: "name", header: "Item", sortable: true },
      { columnKey: "quantity", header: "Qty", align: "right", editable: true },
      { columnKey: "price", header: "Price", align: "right", editable: true }
    ],
    data: sampleRows
  }
};

