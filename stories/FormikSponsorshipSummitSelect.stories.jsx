import FormikSponsorshipSummitSelect from "../src/components/mui/formik-inputs/sponsorship-summit-select-mui";
import { withFormik, NEEDS_API } from "./_helpers";

export default {
  title: "MUI/Formik inputs/SponsorshipSummitSelect",
  component: FormikSponsorshipSummitSelect,
  decorators: [withFormik({ sponsorship: null })],
  parameters: { docs: { description: { component: NEEDS_API } } }
};

export const Default = { args: { name: "sponsorship", summitId: 1, placeholder: "Select a sponsorship" } };

