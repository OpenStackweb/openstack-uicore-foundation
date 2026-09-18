import FormikFileSizeField from "../src/components/mui/formik-inputs/mui-formik-file-size-field";
import { withFormik } from "./_helpers";

export default {
  title: "MUI/Formik inputs/FileSizeField",
  component: FormikFileSizeField,
  decorators: [withFormik({ max_size: 5242880 })]
};

export const Default = { args: { name: "max_size", label: "Max file size", displayUnit: "MB", valueUnit: "B" } };

