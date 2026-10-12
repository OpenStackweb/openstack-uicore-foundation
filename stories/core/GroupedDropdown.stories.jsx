import GroupedDropdown from "../../src/components/inputs/grouped-dropdown";

export default {
  title: "Core/Inputs/GroupedDropdown",
  component: GroupedDropdown,
  argTypes: { onChange: { action: "changed" } }
};

export const Default = {
  args: {
    id: "room",
    value: "",
    placeholder: "Select a room",
    options: [
      {
        label: "Main Venue",
        value: "venue_1",
        options: [
          { value: "keynote", label: "Keynote Hall" },
          { value: "expo", label: "Expo Floor" }
        ]
      },
      { value: "offsite", label: "Offsite Party" }
    ]
  }
};
