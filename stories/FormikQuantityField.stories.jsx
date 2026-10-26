import FormikQuantityField from "../src/components/mui/formik-inputs/mui-formik-quantity-field";
import { withFormik } from "./_helpers";

export default {
  title: "MUI/Formik inputs/QuantityField",
  component: FormikQuantityField,
  decorators: [withFormik({ quantity: 2 })]
};

export const Default = { args: { name: "quantity", label: "Quantity", min: 0, max: 99 } };

