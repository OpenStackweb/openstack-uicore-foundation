import FormikCheckboxGroup from "../src/components/mui/formik-inputs/mui-formik-checkbox-group";
import { withFormik } from "./_helpers";

export default {
  title: "MUI/Formik inputs/CheckboxGroup",
  component: FormikCheckboxGroup,
  decorators: [withFormik({ tracks: ["ai"] })]
};

export const Default = { args: {
    name: "tracks",
    label: "Tracks",
    options: [
      { value: "ai", label: "AI / ML" },
      { value: "infra", label: "Infrastructure" },
      { value: "security", label: "Security" }
    ]
  } };

