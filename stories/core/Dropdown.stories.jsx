import Dropdown from "../../src/components/inputs/dropdown";

export default {
  title: "Core/Inputs/Dropdown",
  component: Dropdown,
  argTypes: { onChange: { action: "changed" } }
};

const options = [
  { value: "diamond", label: "Diamond" },
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" }
];

export const Default = { args: { id: "tier", options, value: null, placeholder: "Select a tier" } };
export const WithValue = { args: { ...Default.args, value: "gold" } };
// isMulti reads value.includes, so value must be an array
export const Multi = { args: { ...Default.args, isMulti: true, value: ["gold", "silver"] } };
