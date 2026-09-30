import FormikDropdownCheckbox from "../src/components/mui/formik-inputs/mui-formik-dropdown-checkbox";
import { withFormik } from "./_helpers";

export default {
  title: "MUI/Formik inputs/DropdownCheckbox",
  component: FormikDropdownCheckbox,
  decorators: [withFormik({ tracks: ["ai"] })]
};

export const Default = { args: {
    name: "tracks",
    label: "Tracks",
    placeholder: "Select tracks",
    options: [
      { value: "ai", label: "AI / ML" },
      { value: "infra", label: "Infrastructure" }
    ]
  } };

