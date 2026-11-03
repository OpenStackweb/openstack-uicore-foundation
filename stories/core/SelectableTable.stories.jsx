import SelectableTable from "../../src/components/table-selectable/SelectableTable";

export default {
  title: "Core/Tables/SelectableTable",
  component: SelectableTable
};

const columns = [
  { columnKey: "name", value: "Event", sortable: true },
  { columnKey: "room", value: "Room" }
];

const data = [
  { id: 1, name: "Opening Keynote", room: "Keynote Hall", checked: true },
  { id: 2, name: "Edge Computing Panel", room: "Hall A", checked: false },
  { id: 3, name: "Security BoF", room: "Hall B", checked: false }
];

export const Default = {
  args: {
    columns,
    data,
    options: {
      sortCol: "name",
      sortDir: 1,
      selectedAll: false,
      actions: {
        edit: {
          onClick: (id) => console.log("edit", id),
          onSelected: (id, checked) => console.log("selected", id, checked),
          onSelectedAll: (checked) => console.log("selectedAll", checked)
        },
        delete: { onClick: (id) => console.log("delete", id) }
      }
    }
  }
};
