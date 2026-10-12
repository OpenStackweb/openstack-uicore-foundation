import FormikSponsorInput from "../src/components/mui/formik-inputs/mui-sponsor-input";
import { withFormik, NEEDS_API } from "./_helpers";

export default {
  title: "MUI/Formik inputs/SponsorInput",
  component: FormikSponsorInput,
  decorators: [withFormik({ sponsor: null })],
  parameters: { docs: { description: { component: NEEDS_API } } }
};

export const Default = { args: { id: "sponsor", name: "sponsor", summitId: 1, placeholder: "Search sponsors..." } };

