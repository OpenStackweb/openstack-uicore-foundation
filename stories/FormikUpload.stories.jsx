import FormikUpload from "../src/components/mui/formik-inputs/mui-formik-upload";
import { withFormik } from "./_helpers";

export default {
  title: "MUI/Formik inputs/Upload",
  component: FormikUpload,
  decorators: [withFormik({ images: [] })]
};

export const Default = { args: { id: "images", name: "images", maxFiles: 3, allowedExtensions: ["png", "jpg"] } };

