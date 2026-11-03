import FormikDropdownRadio from "../src/components/mui/formik-inputs/mui-formik-dropdown-radio";
import { withFormik } from "./_helpers";

export default {
  title: "MUI/Formik inputs/DropdownRadio",
  component: FormikDropdownRadio,
  decorators: [withFormik({ tier: "gold" })]
};

export const Default = { args: {
    name: "tier",
    label: "Tier",
    placeholder: "Select a tier",
    options: [
      { value: "gold", label: "Gold" },
      { value: "silver", label: "Silver" }
    ]
  } };

