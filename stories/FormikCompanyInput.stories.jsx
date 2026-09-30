import FormikCompanyInput from "../src/components/mui/formik-inputs/company-input-mui";
import { withFormik, NEEDS_API } from "./_helpers";

export default {
  title: "MUI/Formik inputs/CompanyInput",
  component: FormikCompanyInput,
  decorators: [withFormik({ company: null })],
  parameters: { docs: { description: { component: NEEDS_API } } }
};

export const Default = { args: { id: "company", name: "company", placeholder: "Search companies...", allowCreate: true } };

