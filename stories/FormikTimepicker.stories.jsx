import FormikTimepicker from "../src/components/mui/formik-inputs/mui-formik-timepicker";
import { withFormik } from "./_helpers";

export default {
  title: "MUI/Formik inputs/Timepicker",
  component: FormikTimepicker,
  decorators: [withFormik({ starts_at: null })]
};

export const Default = { args: { name: "starts_at", label: "Starts at", timeZone: "America/Chicago" } };

