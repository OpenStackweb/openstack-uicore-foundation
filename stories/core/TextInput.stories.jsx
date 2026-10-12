import Input from "../../src/components/inputs/text-input";

export default {
  title: "Core/Inputs/Input",
  component: Input,
  argTypes: { onChange: { action: "changed" } }
};

export const Default = { args: { id: "first_name", value: "Ada", placeholder: "First name" } };
export const WithError = { args: { ...Default.args, value: "", error: "First name is required" } };
