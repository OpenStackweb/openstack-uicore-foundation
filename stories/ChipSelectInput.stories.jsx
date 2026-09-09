import ChipSelectInput from "../src/components/mui/chip-select-input";

export default { title: "MUI/Inputs/ChipSelectInput", component: ChipSelectInput };

export const Default = {
  args: {
    inputLabel: "Badge features",
    availableOptions: [
      { id: 1, name: "Expo Access" },
      { id: 2, name: "Keynote Access" },
      { id: 3, name: "Workshop Access" }
    ],
    canAdd: true,
    canEdit: true
  }
};

