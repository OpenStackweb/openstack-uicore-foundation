import FormikDiscountField from "../src/components/mui/formik-inputs/mui-formik-discountfield";
import { withFormik } from "./_helpers";

export default {
  title: "MUI/Formik inputs/DiscountField",
  component: FormikDiscountField,
  decorators: [withFormik({ discount: 10 })]
};

export const Default = { args: { name: "discount", label: "Discount", discountType: "percentage" } };

