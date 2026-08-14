import SummitDaysSelect from "../../src/components/inputs/summit-days-select";

export default {
  title: "Core/Inputs/SummitDaysSelect",
  component: SummitDaysSelect,
  argTypes: { onDayChanged: { action: "dayChanged" } }
};

const days = [
  { value: "2026-06-15", label: "Monday, June 15" },
  { value: "2026-06-16", label: "Tuesday, June 16" },
  { value: "2026-06-17", label: "Wednesday, June 17" }
];

export const Default = { args: { days, currentValue: "2026-06-16", placeholder: "Select a day" } };
