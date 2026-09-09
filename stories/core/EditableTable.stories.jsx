import EditableTable from "../../src/components/table-editable/EditableTable";

export default {
  title: "Core/Tables/EditableTable",
  component: EditableTable
};

const columns = [
  { columnKey: "name", value: "Name" },
  { columnKey: "email", value: "Email" }
];

const data = [
  { id: 1, name: "Ada Lovelace", email: "ada@example.com" },
  { id: 2, name: "Grace Hopper", email: "grace@example.com" }
];

export const Default = {
  args: {
    columns,
    data,
    options: {
      actions: {
        save: { onClick: (rows) => console.log("save", rows) },
        delete: { onClick: (id) => console.log("delete", id) }
      }
    }
  }
};
