import FormikSwitch from "../src/components/mui/formik-inputs/mui-formik-switch";
import { withFormik } from "./_helpers";

export default {
  title: "MUI/Formik inputs/Switch",
  component: FormikSwitch,
  decorators: [withFormik({ notify: false })]
};

export const Default = { args: { name: "notify", label: "Email the sponsor on change" } };

