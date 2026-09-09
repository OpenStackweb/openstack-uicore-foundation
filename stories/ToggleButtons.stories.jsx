import ToggleButtons from "../src/components/mui/ToggleButtons";

export default {
  title: "MUI/Inputs/ToggleButtons",
  component: ToggleButtons,
  argTypes: { onChange: { action: "changed" } }
};

export const Default = {
  args: { options: ["ALL", "ANY"], value: "ALL" }
};

export const Secondary = {
  args: { options: ["Day", "Week", "Month"], value: "Week", color: "secondary" }
};

