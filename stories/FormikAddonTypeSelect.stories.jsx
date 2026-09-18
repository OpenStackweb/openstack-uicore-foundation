import FormikAddonTypeSelect from "../src/components/mui/formik-inputs/mui-formik-addon-type-select";
import { withFormik, NEEDS_API } from "./_helpers";

export default {
  title: "MUI/Formik inputs/AddonTypeSelect",
  component: FormikAddonTypeSelect,
  decorators: [withFormik({ addon: "" })],
  parameters: { docs: { description: { component: NEEDS_API } } }
};

export const Default = { args: { name: "addon", placeholder: "Select an add-on" } };
