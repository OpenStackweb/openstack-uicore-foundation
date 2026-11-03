import FreeMultiTextInput from "../../src/components/inputs/free-multi-text-input";

export default {
  title: "Core/Inputs/FreeMultiTextInput",
  component: FreeMultiTextInput,
  argTypes: { onChange: { action: "changed" } }
};

export const Default = {
  args: { id: "keywords", value: [{ label: "kubernetes", value: "kubernetes" }, { label: "edge", value: "edge" }] }
};
export const Empty = { args: { id: "keywords2", value: [] } };
