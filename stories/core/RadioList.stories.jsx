import RadioList from "../../src/components/inputs/radio-list";

export default {
  title: "Core/Inputs/RadioList",
  component: RadioList,
  argTypes: { onChange: { action: "changed" } }
};

const options = [
  { value: "in_person", label: "In person", description: "Attend at the venue" },
  { value: "virtual", label: "Virtual", description: "Join the live stream" }
];

export const Default = { args: { id: "attendance", options, value: "in_person" } };
export const Inline = {
  args: { id: "attendance2", options, value: "virtual", inline: true }
};
