import TextEditor from "../../src/components/inputs/editor-input";

export default {
  title: "Core/Inputs/TextEditor",
  component: TextEditor,
  argTypes: { onChange: { action: "changed" } }
};

export const Default = {
  args: { id: "description", value: "<p>Session <strong>abstract</strong> goes here.</p>" }
};
export const WithMaxLength = { args: { ...Default.args, maxLength: 500 } };
export const WithError = { args: { id: "description2", value: "", error: "Description is required" } };
