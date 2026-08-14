import FormikPriceField from "../src/components/mui/formik-inputs/mui-formik-pricefield";
import { withFormik } from "./_helpers";

export default {
  title: "MUI/Formik inputs/PriceField",
  component: FormikPriceField,
  decorators: [withFormik({ price: 8000 })]
};

export const Default = { args: { name: "price", label: "Price" } };

