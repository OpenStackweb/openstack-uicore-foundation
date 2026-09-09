import FormikSponsorshipInput from "../src/components/mui/formik-inputs/sponsorship-input-mui";
import { withFormik, NEEDS_API } from "./_helpers";

export default {
  title: "MUI/Formik inputs/SponsorshipInput",
  component: FormikSponsorshipInput,
  decorators: [withFormik({ sponsorship: null })],
  parameters: { docs: { description: { component: NEEDS_API } } }
};

export const Default = { args: { id: "sponsorship", name: "sponsorship", placeholder: "Search sponsorships..." } };

