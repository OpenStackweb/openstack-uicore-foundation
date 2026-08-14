import UploadBtn from "../src/components/mui/UploadBtn";

export default {
  title: "MUI/Buttons/UploadBtn",
  component: UploadBtn,
  argTypes: { onClick: { action: "clicked" } }
};

export const Default = { args: { disabled: false } };
export const Disabled = { args: { disabled: true } };

