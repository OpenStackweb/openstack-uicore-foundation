import SummitDropdown from "../../src/components/summit-dropdown";

export default {
  title: "Core/Inputs/SummitDropdown",
  component: SummitDropdown,
  argTypes: { onClick: { action: "action" } }
};

const summits = [
  { id: 13, name: "Vancouver 2026", start_date: 1780000000 },
  { id: 12, name: "Berlin 2025", start_date: 1750000000 },
  { id: 11, name: "Austin 2025", start_date: 1740000000 }
];

export const Default = { args: { summits, actionLabel: "Clone" } };
export const Big = { args: { ...Default.args, big: true } };
