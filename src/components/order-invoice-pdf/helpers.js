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
import { buildOrderLedger } from "../../utils/order-ledger";

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

// Thin presentational mapper: buildOrderLedger holds the derivation rules
// (sign conventions, ordering, quantity filtering, row keys) shared with
// SponsorOrderGrid — this only translates labels, formats currency/dates,
// and shapes the row fields PdfTableRow expects.
export const buildRows = (order) =>
  buildOrderLedger(order).map((entry) => {
    switch (entry.type) {
      case "item": {
        const { form, item, quantity, cancelled, amountCents, balanceCents } = entry;
        const cancelledBy = cancelled
          ? T.translate("sponsor_order_grid.cancelled_by", {
              user: item.canceled_by_full_name,
              date: formatDate(item.canceled_at, "LOC", "YYYY/MM/DD HH:mm")
            })
          : "";

        return {
          rowKey: entry.rowKey,
          type: "item",
          // Table shows form.code per item row (columnKey: "formCode", value: form.code)
          code: String(form.code || ""),
          description: String(item.type?.name || item.title || ""),
          addon: String(form.add_on?.name || ""),
          qty: String(quantity),
          price: currencyAmountFromCents(amountCents),
          balanceCents,
          cancelled,
          cancelledBy
        };
      }

      case "discount": {
        const { form, amountCents, balanceCents } = entry;
        return {
          rowKey: entry.rowKey,
          type: "discount",
          code: T.translate("mui_table.dis"),
          description: formatDiscount(form.discount_amount, form.discount_type),
          addon: "",
          qty: "",
          price: currencyAmountFromCents(amountCents),
          balanceCents
        };
      }

      case "fee": {
        const { fee, amountCents, balanceCents } = entry;
        return {
          rowKey: entry.rowKey,
          type: "fee",
          code: T.translate("mui_table.payfee"),
          description: String(fee.title || ""),
          addon: "",
          qty: "1",
          price: currencyAmountFromCents(amountCents),
          balanceCents
        };
      }

      case "payment": {
        const { payment, amountCents, balanceCents } = entry;
        return {
          rowKey: entry.rowKey,
          type: "payment",
          code: T.translate("mui_table.pay"),
          description: `${T.translate("mui_table.paid_via")} ${payment.method || T.translate("mui_table.card")}`,
          subDescription: formatDate(payment.created, "LOC", "YYYY/MM/DD HH:mm"),
          addon: "",
          qty: "1",
          price: currencyAmountFromCents(amountCents),
          balanceCents
        };
      }

      case "refund": {
        const { refund, amountCents, balanceCents } = entry;
        return {
          rowKey: entry.rowKey,
          type: "refund",
          code: T.translate("mui_table.ref"),
          description: String(refund.reason || T.translate("mui_table.refund")),
          subDescription: String(refund.status || ""),
          addon: "",
          qty: "1",
          price: currencyAmountFromCents(amountCents),
          balanceCents
        };
      }

      case "note":
        return {
          rowKey: entry.rowKey,
          type: "note",
          content: String(entry.note.content || "")
        };

      default:
        return null;
    }
  }).filter(Boolean);
