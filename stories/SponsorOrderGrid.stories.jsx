import SponsorOrderGrid from "../src/components/mui/SponsorOrderGrid";

const order = {
  id: 9001,
  status: "Paid",
  currency: "USD",
  currency_symbol: "$",
  sub_total: 3300000,
  taxes_amount: 50000,
  discount_amount: 0,
  total: 3350000,
  purchased_amount: 3350000,
  refunded_amount: 0,
  lines: [
    {
      id: 1,
      name: "Diamond Sponsorship",
      description: "Top tier package",
      qty: 1,
      subtotal: 2500000,
      total: 2500000,
      early_bird_discount: 0
    },
    {
      id: 2,
      name: "Booth 10x10",
      description: "Expo floor booth",
      qty: 1,
      subtotal: 800000,
      total: 800000,
      early_bird_discount: 0
    }
  ]
};

export default {
  title: "MUI/Commerce/SponsorOrderGrid",
  component: SponsorOrderGrid,
  argTypes: { onCancelForm: { action: "cancel" }, onUndoCancelForm: { action: "undo-cancel" } }
};

export const Default = { args: { order } };
export const WithReconciliation = { args: { order, withReconciliation: true } };

