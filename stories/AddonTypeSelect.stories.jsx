import AddonTypeSelect from "../src/components/mui/addon-type-select";
import { NEEDS_API } from "./_helpers";

export default {
  title: "MUI/API-backed/AddonTypeSelect",
  component: AddonTypeSelect,
  argTypes: { onChange: { action: "changed" } },
  parameters: { docs: { description: { component: NEEDS_API } } }
};

// Options come from querySummitAddons and are keyed by add-on name, so `value`
// is a name rather than an id. No summit scoping — the query is global.
export const Default = { args: { value: "", placeholder: "Select an add-on" } };
