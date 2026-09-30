import React from "react";
import {
  TotalRow,
  NotesRow,
  FeeRow,
  PaymentRow,
  RefundRow,
  DiscountRow
} from "../src/components/mui/tables/extra-rows";
import { inTable } from "./_helpers";

export default {
  title: "MUI/Tables/Extra rows",
  decorators: [inTable],
  parameters: {
    docs: {
      description: {
        component:
          "Summary rows appended to MuiTable. Each has to render inside a table body. Amounts and balance are in cents; Discount, Fee, Payment and Refund render nothing without their data prop."
      }
    }
  }
};

// 2026-07-01 12:00 UTC, epoch seconds
const PAID_AT = 1782907200;

export const Total = { render: () => <TotalRow total={3350000} /> };
export const Discount = {
  render: () => <DiscountRow discount="Early bird" discountCents={150000} balance={3200000} />
};
export const Fee = {
  render: () => <FeeRow fee={{ title: "Processing fee", amount: 12000 }} balance={3212000} />
};
export const Payment = {
  render: () => <PaymentRow payment={{ method: "Visa", amount: 3212000, created: PAID_AT }} balance={0} />
};
export const Refund = {
  render: () => <RefundRow refund={{ reason: "Duplicate charge", status: "completed", amount: 50000 }} balance={50000} />
};
export const Notes = {
  render: () => <NotesRow note="Reconciled against PO 4417." colCount={6} showCode />
};
