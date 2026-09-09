import Dropdown from "../src/components/mui/Dropdown";

export default {
  title: "MUI/Inputs/Dropdown",
  component: Dropdown,
  argTypes: { onChange: { action: "changed" } }
};

const options = [
  { value: "diamond", label: "Diamond" },
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" },
  { value: "legacy", label: "Legacy (retired)", disabled: true }
];

export const Default = {
  args: { id: "tier", label: "Sponsorship tier", options, placeholder: "Select a tier" }
};

export const WithValue = { args: { ...Default.args, value: "gold" } };
export const Multiple = { args: { ...Default.args, multiple: true, value: ["gold", "silver"] } };

