import DropdownCheckbox from "../src/components/mui/dropdown-checkbox";

export default {
  title: "MUI/Inputs/DropdownCheckbox",
  component: DropdownCheckbox,
  argTypes: { onChange: { action: "changed" } }
};

export const Default = {
  args: {
    name: "tracks",
    label: "Tracks",
    allLabel: "All tracks",
    value: ["ai"],
    options: [
      { value: "ai", label: "AI / ML" },
      { value: "infra", label: "Infrastructure" },
      { value: "security", label: "Security" }
    ]
  }
};

