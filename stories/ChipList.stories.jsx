import ChipList from "../src/components/mui/chip-list";

export default { title: "MUI/Data display/ChipList", component: ChipList };

const chips = ["Diamond", "Gold", "Silver", "Bronze", "In-kind", "Media"];

export const Default = { args: { chips } };
export const Truncated = { args: { chips, maxLength: 3 } };

