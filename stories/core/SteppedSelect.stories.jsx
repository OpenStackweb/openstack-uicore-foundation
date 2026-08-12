import SteppedSelect from "../../src/components/inputs/stepped-select/index.jsx";

export default {
  title: "Core/Inputs/SteppedSelect",
  component: SteppedSelect,
  argTypes: { onChange: { action: "changed" } }
};

const options = [
  { value: 30, label: "30 min." },
  { value: 60, label: "60 min." },
  { value: 90, label: "90 min." }
];

// value must match an option — the component derives its label from the match
export const Default = { args: { options, value: 60 } };
