import CheckboxList from "../src/components/mui/checkbox-list";

export default {
  title: "MUI/Inputs/CheckboxList",
  component: CheckboxList,
  argTypes: { onChange: { action: "changed" } }
};

export const Default = {
  args: {
    items: [
      { id: 1, name: "Keynote Hall", checked: true },
      { id: 2, name: "Breakout A", checked: false },
      { id: 3, name: "Breakout B", checked: false },
      { id: 4, name: "Expo Floor", checked: true }
    ],
    boxHeight: "220px"
  }
};

export const Empty = { args: { items: [], boxHeight: "220px" } };

