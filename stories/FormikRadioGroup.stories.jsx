import FormikRadioGroup from "../src/components/mui/formik-inputs/mui-formik-radio-group";
import { withFormik } from "./_helpers";

export default {
  title: "MUI/Formik inputs/RadioGroup",
  component: FormikRadioGroup,
  decorators: [withFormik({ visibility: "public" })]
};

export const Default = { args: {
    name: "visibility",
    label: "Visibility",
    options: [
      { value: "public", label: "Public" },
      { value: "private", label: "Private" }
    ]
  } };

