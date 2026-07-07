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
import { currencyAmountFromCents } from "../../utils/money";
import { MILLISECONDS_IN_SECOND } from "../../utils/constants";

export const DEFAULT_FONT_FAMILY = "Helvetica";

export const MUI_ICON_PATHS = {
  ArrowUpward: "M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z",
  ArrowDownward:
    "M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z",
  Refresh:
    "M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z",
  DoNotDisturb:
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"
};

export const PDF_ICON_SIZE = 8;

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
    address.address_1,
    address.address_2,
    address.city,
    address.state,
    address.zip_code ?? address.postal_code,
    address.country
  ]
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
  return fontFamily.split(",")[0].trim().replace(/^['"]|['"]$/g, "");
};

export const fmtBalance = (cents) => {
  if (cents == null) return "";
  const abs = currencyAmountFromCents(Math.abs(cents));
  return cents < 0 ? `-${abs}` : abs;
};

export const buildRows = (order, summit) => {
  const rows = [];
  let balanceCents = 0;

  (order.forms || []).forEach((form) => {
    (form.items || [])
      .filter((item) => item.quantity)
      .forEach((item) => {
        // Cancelled is per-item
        const cancelled = !!item.canceled_by_id;
        const cancelledBy = cancelled
          ? `Cancelled by ${item.canceled_by_full_name} on ${formatDate(item.canceled_at, summit.time_zone_id, "YYYY/MM/DD HH:mm")}`
          : "";

        // Cancelled items still accumulate
        balanceCents += item.amount;

        rows.push({
          rowKey: `item-${item.line_id ?? item.id}`,
          type: "item",
          // Table shows form.code per item row (columnKey: "formCode", value: form.code)
          code: String(form.code || ""),
          description: String(item.type?.name || item.title || ""),
          addon: String(form.add_on?.name || ""),
          qty: String(item.quantity ?? 1),
          price: currencyAmountFromCents(item.amount),
          balanceCents,
          cancelled,
          cancelledBy
        });
      });

    const discountCents = form.discount_in_cents ?? 0;
    if (discountCents) {
      balanceCents -= discountCents;
      rows.push({
        rowKey: `discount-${form.id}`,
        type: "discount",
        code: "DIS",
        description: String(form.discount || ""),
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
      rowKey: `fee-${fee.id}`,
      type: "fee",
      code: "PAYFEE",
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
        code: "PAY",
        description: `Paid via ${item.method || "card"}`,
        subDescription: formatDate(
          item.created,
          summit.time_zone_id,
          "YYYY/MM/DD HH:mm"
        ),
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
        code: "REF",
        description: String(item.reason || "Refund"),
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
