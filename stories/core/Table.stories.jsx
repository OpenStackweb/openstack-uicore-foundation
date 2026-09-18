import Table from "../../src/components/table/Table";
import { sampleRows } from "../_helpers";

export default {
  title: "Core/Tables/Table",
  component: Table,
  argTypes: { onSort: { action: "sort" } }
};

const columns = [
  { columnKey: "name", value: "Item", sortable: true },
  { columnKey: "quantity", value: "Qty" },
  { columnKey: "price", value: "Price" }
];

export const Default = {
  args: {
    columns,
    data: sampleRows,
    options: { sortCol: "name", sortDir: 1, actions: {} }
  }
};

export const WithActions = {
  args: {
    ...Default.args,
    options: {
      sortCol: "name",
      sortDir: 1,
      actions: {
        edit: { onClick: (id) => console.log("edit", id) },
        delete: { onClick: (id) => console.log("delete", id) }
      }
    }
  }
};
