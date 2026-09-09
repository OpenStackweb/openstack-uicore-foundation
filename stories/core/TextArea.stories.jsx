import TextArea from "../../src/components/inputs/textarea-input";

export default {
  title: "Core/Inputs/TextArea",
  component: TextArea,
  argTypes: { onChange: { action: "changed" } }
};

export const Default = {
  args: { id: "bio", value: "Cloud infrastructure engineer and frequent summit speaker.", rows: 4 }
};
export const WithMaxLength = { args: { ...Default.args, maxLength: 100 } };
export const WithError = { args: { ...Default.args, value: "", error: "Bio is required" } };
