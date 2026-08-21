import RoundButton from "../src/components/mui/RoundButton";

export default {
  title: "MUI/Buttons/RoundButton",
  component: RoundButton,
  argTypes: { onClick: { action: "clicked" } }
};

export const Default = { args: { children: "Save changes" } };
export const Outlined = { args: { children: "Cancel", variant: "outlined" } };
export const Disabled = { args: { children: "Save changes", disabled: true } };

