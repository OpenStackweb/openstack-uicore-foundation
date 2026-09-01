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
        component: "Summary rows appended to MuiTable. Each has to render inside a table body."
      }
    }
  }
};

export const Total = { render: () => <TotalRow label="Total" value="$33,500.00" /> };
export const Discount = { render: () => <DiscountRow label="Early bird" value="-$1,500.00" /> };
export const Fee = { render: () => <FeeRow label="Processing fee" value="$120.00" /> };
export const Payment = { render: () => <PaymentRow label="Paid 2026-07-01" value="$33,500.00" /> };
export const Refund = { render: () => <RefundRow label="Refund" value="-$500.00" /> };
export const Notes = { render: () => <NotesRow label="Note" value="Reconciled against PO 4417." /> };

