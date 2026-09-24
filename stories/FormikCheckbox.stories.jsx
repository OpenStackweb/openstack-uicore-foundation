import FormikCheckbox from "../src/components/mui/formik-inputs/mui-formik-checkbox";
import { withFormik } from "./_helpers";

export default {
  title: "MUI/Formik inputs/Checkbox",
  component: FormikCheckbox,
  decorators: [withFormik({ is_active: true })]
};

export const Default = { args: { name: "is_active", label: "Active" } };

