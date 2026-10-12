import SortableTable from "../../src/components/table-sortable/SortableTable";

export default {
  title: "Core/Tables/SortableTable",
  component: SortableTable,
  argTypes: { dropCallback: { action: "dropped" } }
};

const columns = [
  { columnKey: "name", value: "Track" },
  { columnKey: "sessions", value: "Sessions" }
];

const data = [
  { id: 1, name: "Keynotes", sessions: 4, order: 1 },
  { id: 2, name: "Cloud Infrastructure", sessions: 12, order: 2 },
  { id: 3, name: "Security", sessions: 8, order: 3 }
];

export const Default = {
  args: {
    columns,
    data,
    orderField: "order",
    idField: "id",
    options: {
      actions: {
        edit: { onClick: (id) => console.log("edit", id) },
        delete: { onClick: (id) => console.log("delete", id) }
      }
    }
  }
};
