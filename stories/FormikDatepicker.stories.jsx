import FormikDatepicker from "../src/components/mui/formik-inputs/mui-formik-datepicker";
import { withFormik } from "./_helpers";

export default {
  title: "MUI/Formik inputs/Datepicker",
  component: FormikDatepicker,
  decorators: [withFormik({ starts_at: null })]
};

export const Default = { args: { name: "starts_at", label: "Starts at" } };

