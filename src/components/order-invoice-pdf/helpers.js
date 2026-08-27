/**
 * Copyright 2026 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * */

import moment from "moment-timezone";
import T from "i18n-react/dist/i18n-react";
import { Font } from "@react-pdf/renderer";
import { currencyAmountFromCents, formatDiscount } from "../../utils/money";
import { MILLISECONDS_IN_SECOND } from "../../utils/constants";

export const DEFAULT_FONT_FAMILY = "Helvetica";

export const formatDate = (
  date,
  timeZone = "LOC",
  format = "dddd Do h:mm a"
) => {
  if (!date) return "";

  if (timeZone === "LOC") {
    return moment(date * MILLISECONDS_IN_SECOND).format(format);
  }

  return moment(date * MILLISECONDS_IN_SECOND)
    .tz(timeZone)
    .format(format);
};

export const formatAddress = (address) => {
  if (!address) return "";
  return [
    address.address_1 ?? address.line1,
    address.address_2 ?? address.line2,
    address.city,
    address.state,
    address.zip_code ?? address.postal_code,
    address.country
  ]
    .map(val => (val ?? "").toString().trim())
    .filter(Boolean)
    .join(", ");
};

export const formatVenueName = (location) => {
  if (!location) return "";
  return `${location?.short_name ?? ""}${location?.name ? ` (${location?.name})` : ""}`;
};

// Reads fontFamily off the consumer's MUI theme so it stays in sync with the
// rest of their app instead of being duplicated as a separate literal. Only
// the first name in the CSS font stack is usable here: react-pdf renders
// with fonts registered via Font.register, so this name must match a family
// already registered that way in the consuming app.
export const getThemeFontFamily = (theme) => {
  const fontFamily = theme?.typography?.fontFamily;
  if (!fontFamily) return DEFAULT_FONT_FAMILY;
  const resolved = fontFamily.split(",")[0].trim().replace(/^['"]|['"]$/g, "");
  return Font.getRegisteredFontFamilies().includes(resolved)
    ? resolved
    : DEFAULT_FONT_FAMILY;
};

export const buildRows = (order) => {
  const rows = [];
  let balanceCents = 0;

  (order.forms || []).forEach((form) => {
    (form.items || [])
      .filter((item) => (item.quantity ?? 1) > 0)
      .forEach((item) => {
        // Cancellation is per-item and quantity-scoped: canceled_quantity may
        // be anywhere from 0 (not cancelled) up to quantity (fully cancelled),
        // with the individual cancellation events (and their frozen per-event
        // amounts) listed in cancellations. Mirrors SponsorOrderGrid's contract.
        const quantity = item.quantity ?? 1;
        const canceledQuantity = item.canceled_quantity ?? 0;
        const cancellations = item.cancellations ?? [];
        const cancelled = canceledQuantity > 0 && canceledQuantity === quantity;
        const partiallyCancelled = canceledQuantity > 0 && canceledQuantity < quantity;

        // Matches SponsorOrderGrid: a charge stays in the ledger in full
        // whether it's cancelled or not, partially or fully -- cancellation
        // only nets out via the reconciliation block below.
        balanceCents += item.amount;

        rows.push({
          rowKey: `item-${item.line_id ?? item.id}`,
          type: "item",
          // Table shows form.code per item row (columnKey: "formCode", value: form.code)
          code: String(form.code || ""),
          // Distinct from `code` (the form's code) -- this is the item's own
          // code, used by the "Cancelled items:" summary to mirror
          // SponsorOrderGrid's "formCode - itemCode (x/y)" links.
          itemCode: String(item.type?.code || item.code || ""),
          description: String(item.type?.name || item.title || ""),
          addon: String(form.add_on?.name || ""),
          qty: String(quantity - canceledQuantity),
          quantity,
          canceledQuantity,
          price: currencyAmountFromCents(item.amount),
          balanceCents,
          cancelled,
          partiallyCancelled,
          cancellations: cancellations.map((c) => ({
            id: c.id,
            label: T.translate("sponsor_order_grid.cancelled_by", {
              x: c.quantity,
              y: quantity,
              user: c.canceled_by_full_name,
              date: formatDate(c.created, "LOC", "M/D/YY [@] h:mm A")
            }),
            reason: c.reason ? String(c.reason) : ""
          }))
        });
      });

    const discountCents = form.discount_in_cents ?? 0;
    if (discountCents) {
      balanceCents -= discountCents;
      rows.push({
        rowKey: `discount-${form.id}`,
        type: "discount",
        code: T.translate("mui_table.dis"),
        description: formatDiscount(form.discount_amount, form.discount_type),
        addon: "",
        qty: "",
        price: currencyAmountFromCents(discountCents),
        balanceCents
      });
    }
  });

  (order.fees || []).forEach((fee) => {
    balanceCents += fee.amount;
    rows.push({
      rowKey: `fee-${fee.line_id ?? fee.id}`,
      type: "fee",
      code: T.translate("mui_table.payfee"),
      description: String(fee.title || ""),
      addon: "",
      qty: "1",
      price: currencyAmountFromCents(fee.amount),
      balanceCents
    });
  });

  // Payments and refunds interleaved and sorted by created:
  const paymentsAndRefundsOrdered = [
    ...(order.payments || []).map((p) => ({ ...p, _rowType: "payment" })),
    ...(order.refunds || []).map((r) => ({ ...r, _rowType: "refund" }))
  ].sort((a, b) => a.created - b.created);

  paymentsAndRefundsOrdered.forEach((item) => {
    if (item._rowType === "payment") {
      balanceCents -= item.amount;
      rows.push({
        rowKey: `payment-${item.id}`,
        type: "payment",
        code: T.translate("mui_table.pay"),
        description: `${T.translate("mui_table.paid_via")} ${item.method || T.translate("mui_table.card")}`,
        subDescription: formatDate(item.created, "LOC", "YYYY/MM/DD HH:mm"),
        addon: "",
        qty: "1",
        price: currencyAmountFromCents(item.amount),
        balanceCents
      });
    } else {
      balanceCents += item.amount;
      rows.push({
        rowKey: `refund-${item.id}`,
        type: "refund",
        code: T.translate("mui_table.ref"),
        description: String(item.reason || T.translate("mui_table.refund")),
        subDescription: String(item.status || ""),
        addon: "",
        qty: "1",
        price: currencyAmountFromCents(item.amount),
        balanceCents
      });
    }
  });

  (order.notes || []).forEach((note) => {
    rows.push({
      rowKey: `note-${note.id}`,
      type: "note",
      content: String(note.content || "")
    });
  });

  return rows;
};
