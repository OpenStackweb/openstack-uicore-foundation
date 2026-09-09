import CheckboxList from "../../src/components/inputs/checkbox-list";

export default {
  title: "Core/Inputs/CheckboxList",
  component: CheckboxList,
  argTypes: { onChange: { action: "changed" } }
};

const options = [
  { value: 1, label: "Keynotes" },
  { value: 2, label: "Workshops" },
  { value: 3, label: "Expo Hall" }
];

export const Default = { args: { id: "interests", options, value: [1, 3] } };
export const AllowOther = { args: { id: "interests2", options, value: [], allowOther: true } };
