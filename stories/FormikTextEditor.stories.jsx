import FormikTextEditor from "../src/components/mui/formik-inputs/mui-formik-text-editor";
import { withFormik } from "./_helpers";

export default {
  title: "MUI/Formik inputs/TextEditor",
  component: FormikTextEditor,
  decorators: [withFormik({ description: "<p>Sponsor description</p>" })]
};

export const Default = { args: { name: "description", label: "Description" } };

