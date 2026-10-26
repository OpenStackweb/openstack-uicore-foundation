import FormikSelectV2 from "../src/components/mui/formik-inputs/mui-formik-select-v2";
import { withFormik } from "./_helpers";

export default {
  title: "MUI/Formik inputs/Select v2",
  component: FormikSelectV2,
  decorators: [withFormik({ tier: "gold" })]
};

export const Default = { args: {
    name: "tier",
    label: "Tier",
    placeholder: "Select a tier",
    options: [
      { value: "diamond", label: "Diamond" },
      { value: "gold", label: "Gold" },
      { value: "silver", label: "Silver" }
    ]
  } };

