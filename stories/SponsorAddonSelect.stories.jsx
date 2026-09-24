import SponsorAddonSelect from "../src/components/mui/sponsor-addon-select";
import { NEEDS_API } from "./_helpers";

export default {
  title: "MUI/API-backed/SponsorAddonSelect",
  component: SponsorAddonSelect,
  argTypes: { onChange: { action: "changed" } },
  parameters: { docs: { description: { component: NEEDS_API } } }
};

export const Default = {
  args: { summitId: 1, sponsor: {
      id: 7,
      company: { name: "Acme Corp" },
      sponsorships: [{ id: 1, name: "Diamond" }]
    }, placeholder: "Select an add-on" }
};

