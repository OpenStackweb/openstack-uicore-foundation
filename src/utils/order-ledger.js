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

// Pure derivation of an order's ledger (rows + running balance) from a raw
// PurchaseV2 payload. No i18n, no date/currency formatting, no react-pdf or
// MUI imports — those belong to the presentational mapper in each consumer
// (order-invoice-pdf/helpers.js, mui/SponsorOrderGrid/index.js). Keeping the
// rules below (sign conventions, ordering, filtering, row keys) in one place
// is what keeps the invoice PDF and the sponsor order grid from silently
// drifting apart on the numbers a sponsor sees.

/**
 * @param {object} order - Raw PurchaseV2 payload (or an object that spreads
 *   it, e.g. sponsor-services' normalizeOrder output). Only raw fields are
 *   read here — never props a consumer added on top (e.g. a pre-formatted
 *   `discount` string).
 * @returns {Array<object>} Ordered ledger entries, each carrying its raw
 *   source object(s), amounts in cents, and a precomputed running
 *   balanceCents (except `note` entries, which have no monetary effect).
 */
export const buildOrderLedger = (order) => {
  const entries = [];
  let balanceCents = 0;

  (order?.forms || []).forEach((form) => {
    (form.items || [])
      .filter((item) => (item.quantity ?? 1) > 0)
      .forEach((item, idx) => {
        // Cancellation is per-item and quantity-scoped: canceled_quantity may
        // be anywhere from 0 (not cancelled) up to quantity (fully cancelled),
        // with the individual cancellation events (and their frozen per-event
        // amounts) listed in cancellations. A form-level canceled_by_id never
        // marks an item as cancelled -- only canceled_quantity does.
        const quantity = item.quantity ?? 1;
        const canceledQuantity = item.canceled_quantity ?? 0;

        // A charge stays in the ledger in full whether it's cancelled or
        // not, partially or fully -- cancellation only nets out via the
        // reconciliation total, not the running balance.
        balanceCents += item.amount;
        entries.push({
          type: "item",
          // Scoped by form.id: line_id/id are expected to be unique per the
          // real purchases-api v2 shape, but a payload missing both (or a
          // stray collision) must not collide across DIFFERENT forms — that
          // silently corrupted rendering in SponsorOrderGrid, which looks
          // up row data by rowKey in a Map keyed across the whole order.
          rowKey: `item-${form.id}-${item.line_id ?? item.id ?? idx}`,
          form,
          item,
          quantity,
          canceledQuantity,
          cancellations: item.cancellations ?? [],
          amountCents: item.amount,
          cancelled: canceledQuantity > 0 && canceledQuantity === quantity,
          partiallyCancelled: canceledQuantity > 0 && canceledQuantity < quantity,
          balanceCents
        });
      });

    const discountCents = form.discount_in_cents ?? 0;
    if (discountCents) {
      balanceCents -= discountCents;
      entries.push({
        type: "discount",
        rowKey: `discount-${form.id}`,
        form,
        amountCents: discountCents,
        balanceCents
      });
    }
  });

  (order?.fees || []).forEach((fee) => {
    balanceCents += fee.amount;
    entries.push({
      type: "fee",
      rowKey: `fee-${fee.line_id ?? fee.id}`,
      fee,
      amountCents: fee.amount,
      balanceCents
    });
  });

  // Payments and refunds interleaved and sorted by created:
  const paymentsAndRefunds = [
    ...(order?.payments || []).map((payment) => ({ kind: "payment", payment, created: payment.created })),
    ...(order?.refunds || []).map((refund) => ({ kind: "refund", refund, created: refund.created }))
  ].sort((a, b) => a.created - b.created);

  paymentsAndRefunds.forEach(({ kind, payment, refund }) => {
    if (kind === "payment") {
      balanceCents -= payment.amount;
      entries.push({
        type: "payment",
        rowKey: `payment-${payment.id}`,
        payment,
        amountCents: payment.amount,
        balanceCents
      });
    } else {
      balanceCents += refund.amount;
      entries.push({
        type: "refund",
        rowKey: `refund-${refund.id}`,
        refund,
        amountCents: refund.amount,
        balanceCents
      });
    }
  });

  (order?.notes || []).forEach((note) => {
    entries.push({
      type: "note",
      rowKey: `note-${note.id}`,
      note
    });
  });

  return entries;
};
