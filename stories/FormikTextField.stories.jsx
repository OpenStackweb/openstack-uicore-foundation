import FormikTextField from "../src/components/mui/formik-inputs/mui-formik-textfield";
import { withFormik } from "./_helpers";

export default {
  title: "MUI/Formik inputs/TextField",
  component: FormikTextField,
  decorators: [withFormik({ company_name: "Acme Corp" })]
};

export const Default = { args: { name: "company_name", label: "Company name", maxLength: 80 } };

