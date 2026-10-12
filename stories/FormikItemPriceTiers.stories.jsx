import FormikItemPriceTiers from "../src/components/mui/formik-inputs/item-price-tiers";
import { withFormik } from "./_helpers";

export default {
  title: "MUI/Formik inputs/ItemPriceTiers",
  component: FormikItemPriceTiers,
  decorators: [withFormik({ price_tiers: [{ id: 1, name: "Early bird", price: 7000 }] })]
};

export const Default = { args: { readOnly: false } };

