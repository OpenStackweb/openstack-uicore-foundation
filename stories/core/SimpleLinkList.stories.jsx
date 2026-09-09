import SimpleLinkList from "../../src/components/simple-link-list";

export default {
  title: "Core/Tables/SimpleLinkList",
  component: SimpleLinkList
};

const allSpeakers = [
  { id: 10, name: "Ada Lovelace" },
  { id: 11, name: "Grace Hopper" },
  { id: 12, name: "Katherine Johnson" }
];

export const Default = {
  args: {
    values: [allSpeakers[0]],
    columns: [
      { columnKey: "id", value: "Id" },
      { columnKey: "name", value: "Name" }
    ],
    options: {
      title: "Speakers",
      valueKey: "id",
      labelKey: "name",
      // search is injectable, so this story works without a backend
      actions: {
        search: (input, callback) =>
          callback(allSpeakers.filter((s) => s.name.toLowerCase().includes(input.toLowerCase()))),
        add: { onClick: (value) => console.log("add", value) },
        delete: { onClick: (id) => console.log("delete", id) }
      }
    }
  }
};
