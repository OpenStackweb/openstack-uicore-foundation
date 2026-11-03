import AlertButton from "../src/components/mui/AlertButton";

export default {
  title: "MUI/Buttons/AlertButton",
  component: AlertButton,
  argTypes: { onClick: { action: "clicked" } }
};

export const Default = { args: { label: "Resolve conflict" } };

