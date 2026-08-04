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

import { buildOrderLedger } from "../order-ledger";
import purchaseV2Fixture from "../../components/order-invoice-pdf/__tests__/fixtures/purchase-v2.json";

// ─── Fixture-derived builders ──────────────────────────────────────────────
// Same pattern as order-invoice-pdf.test.js: start from a real slice of the
// PurchaseV2Serializer fixture and override only what a given test cares
// about, instead of hand-authoring object literals.

const baseForm = purchaseV2Fixture.forms[0];
const baseItem = baseForm.items[0]; // not cancelled
const baseCancelledItem = baseForm.items[1]; // cancelled
const baseFee = purchaseV2Fixture.fees[0];
const basePayment = purchaseV2Fixture.payments[0];
const baseRefund = purchaseV2Fixture.refunds[0];
const baseNote = purchaseV2Fixture.notes[0];

const makeForm = (overrides = {}) => ({ ...baseForm, ...overrides });
const makeItem = (overrides = {}) => ({ ...baseItem, ...overrides });
const makeCancelledItem = (overrides = {}) => ({
  ...baseCancelledItem,
  ...overrides
});
const makeFee = (overrides = {}) => ({ ...baseFee, ...overrides });
const makePayment = (overrides = {}) => ({ ...basePayment, ...overrides });
const makeRefund = (overrides = {}) => ({ ...baseRefund, ...overrides });
const makeNote = (overrides = {}) => ({ ...baseNote, ...overrides });

// ─── Empty / missing collections ───────────────────────────────────────────

describe("buildOrderLedger — empty / missing collections", () => {
  it("returns [] without throwing for any empty input", () => {
    expect(buildOrderLedger(undefined)).toEqual([]);
    expect(buildOrderLedger({})).toEqual([]);
    expect(
      buildOrderLedger({ forms: [], fees: [], payments: [], refunds: [] })
    ).toEqual([]);
  });
});

// ─── Item entries ───────────────────────────────────────────────────────────

describe("buildOrderLedger — item entries", () => {
  it("carries the raw form/item and amount in cents, keyed by line_id", () => {
    const item = makeItem({ line_id: 9001, amount: 5000, quantity: 3 });
    const form = makeForm({ id: 156, discount_in_cents: 0, items: [item] });
    const entries = buildOrderLedger({ forms: [form] });

    expect(entries).toHaveLength(1);
    expect(entries[0].type).toBe("item");
    expect(entries[0].rowKey).toBe("item-156-9001");
    expect(entries[0].form).toBe(form);
    expect(entries[0].item).toBe(item);
    expect(entries[0].amountCents).toBe(5000);
    expect(entries[0].quantity).toBe(3);
    expect(entries[0].balanceCents).toBe(5000);
  });

  it("defaults quantity to 1 but still excludes items with quantity 0 (fix: previously the grid dropped undefined-quantity items)", () => {
    const undefinedQty = makeItem({ line_id: 1, quantity: undefined });
    const nullQty = makeItem({ line_id: 2, quantity: null });
    const zeroQty = makeItem({ line_id: 3, quantity: 0 });
    const form = makeForm({
      discount_in_cents: 0,
      items: [undefinedQty, nullQty, zeroQty]
    });
    const entries = buildOrderLedger({ forms: [form] });

    expect(entries).toHaveLength(2);
    expect(entries.map((e) => e.rowKey)).toEqual(["item-156-1", "item-156-2"]);
    entries.forEach((e) => expect(e.quantity).toBe(1));
  });

  it("gives distinct, form-scoped row keys to items in different forms that carry no line_id/id (fix: previously collided order-wide, corrupting SponsorOrderGrid's row lookup)", () => {
    const itemA = makeItem({ line_id: undefined, id: undefined });
    const itemB = makeItem({ line_id: undefined, id: undefined });
    const entries = buildOrderLedger({
      forms: [
        makeForm({ id: 1, discount_in_cents: 0, items: [itemA] }),
        makeForm({ id: 2, discount_in_cents: 0, items: [itemB] })
      ]
    });
    expect(entries).toHaveLength(2);
    expect(new Set(entries.map((e) => e.rowKey)).size).toBe(2);
    expect(entries[0].rowKey).toBe("item-1-0");
    expect(entries[1].rowKey).toBe("item-2-0");
  });

  it("sets cancelled: true when item.canceled_by_id is set, false otherwise", () => {
    const entries = buildOrderLedger({
      forms: [
        makeForm({ id: 1, discount_in_cents: 0, items: [makeCancelledItem()] }),
        makeForm({ id: 2, discount_in_cents: 0, items: [makeItem()] })
      ]
    });
    expect(entries[0].cancelled).toBe(true);
    expect(entries[1].cancelled).toBe(false);
  });

  it("a form-level canceled_by_id does not mark items as cancelled", () => {
    const form = makeForm({ canceled_by_id: 99, items: [makeItem()] });
    const entries = buildOrderLedger({ forms: [form] });
    expect(entries[0].cancelled).toBe(false);
  });

  it("cancelled items still accumulate into the running balance", () => {
    const normalItem = makeItem({ amount: 8000 });
    const cancelledItem = makeCancelledItem({ amount: 10000 });
    const entries = buildOrderLedger({
      forms: [
        makeForm({ id: 1, discount_in_cents: 0, items: [normalItem] }),
        makeForm({ id: 2, discount_in_cents: 0, items: [cancelledItem] })
      ]
    });
    expect(entries[0].balanceCents).toBe(8000);
    expect(entries[1].balanceCents).toBe(18000); // 8000 + 10000
  });
});

// ─── Discount entries ───────────────────────────────────────────────────────

describe("buildOrderLedger — discount entries", () => {
  it("emits no discount entry when discount_in_cents is 0 (fix: the grid used to render one anyway)", () => {
    const form = makeForm({ discount_in_cents: 0 });
    const entries = buildOrderLedger({ forms: [form] });
    expect(entries.filter((e) => e.type === "discount")).toHaveLength(0);
  });

  it("emits no discount entry when discount_in_cents is absent", () => {
    const form = makeForm({ items: [] });
    delete form.discount_in_cents;
    const entries = buildOrderLedger({ forms: [form] });
    expect(entries.filter((e) => e.type === "discount")).toHaveLength(0);
  });

  it("emits one discount entry keyed by form.id, subtracting from the balance", () => {
    const item = makeItem({ amount: 10000 });
    const form = makeForm({ id: 156, discount_in_cents: 5000, items: [item] });
    const entries = buildOrderLedger({ forms: [form] });
    const discountEntry = entries.find((e) => e.type === "discount");

    expect(discountEntry.rowKey).toBe("discount-156");
    expect(discountEntry.form).toBe(form);
    expect(discountEntry.amountCents).toBe(5000);
    expect(discountEntry.balanceCents).toBe(5000); // 10000 - 5000
  });
});

// ─── Fee entries ─────────────────────────────────────────────────────────────

describe("buildOrderLedger — fee entries", () => {
  it("gives distinct row keys to multiple fees, none of which carry an `id` field (fix: PDF already used line_id, the grid used fee.id)", () => {
    expect(baseFee.id).toBeUndefined();
    const entries = buildOrderLedger({
      fees: [purchaseV2Fixture.fees[0], purchaseV2Fixture.fees[1]]
    });
    expect(entries).toHaveLength(2);
    expect(new Set(entries.map((e) => e.rowKey)).size).toBe(2);
    expect(entries[0].rowKey).toBe(`fee-${purchaseV2Fixture.fees[0].line_id}`);
    expect(entries[1].rowKey).toBe(`fee-${purchaseV2Fixture.fees[1].line_id}`);
  });

  it("adds fee amount to the running balance and carries the raw fee", () => {
    const fee = makeFee({ line_id: 7001, amount: 500 });
    const entries = buildOrderLedger({ fees: [fee] });
    expect(entries[0].fee).toBe(fee);
    expect(entries[0].amountCents).toBe(500);
    expect(entries[0].balanceCents).toBe(500);
  });
});

// ─── Payment / refund entries ────────────────────────────────────────────────

describe("buildOrderLedger — payment and refund entries", () => {
  it("interleaves payments and refunds by created date, subtracting payments and adding refunds", () => {
    const entries = buildOrderLedger({
      payments: [makePayment({ id: 1, amount: 10000, created: 2 })],
      refunds: [makeRefund({ id: 1, amount: 3000, created: 1 })]
    });

    // refund first (created: 1), then payment (created: 2)
    expect(entries[0].type).toBe("refund");
    expect(entries[0].balanceCents).toBe(3000);
    expect(entries[1].type).toBe("payment");
    expect(entries[1].balanceCents).toBe(-7000); // 3000 - 10000
  });

  it("keys payment and refund entries by id and carries the raw source object", () => {
    const payment = makePayment({ id: 3001 });
    const refund = makeRefund({ id: 4001 });
    const entries = buildOrderLedger({ payments: [payment], refunds: [refund] });

    const paymentEntry = entries.find((e) => e.type === "payment");
    const refundEntry = entries.find((e) => e.type === "refund");
    expect(paymentEntry.rowKey).toBe("payment-3001");
    expect(paymentEntry.payment).toBe(payment);
    expect(refundEntry.rowKey).toBe("refund-4001");
    expect(refundEntry.refund).toBe(refund);
  });
});

// ─── Note entries ─────────────────────────────────────────────────────────────

describe("buildOrderLedger — note entries", () => {
  it("carries the raw note, with no amount or balance (notes have no monetary effect)", () => {
    const note = makeNote();
    const entries = buildOrderLedger({ notes: [note] });
    expect(entries[0].type).toBe("note");
    expect(entries[0].rowKey).toBe(`note-${note.id}`);
    expect(entries[0].note).toBe(note);
    expect(entries[0].amountCents).toBeUndefined();
    expect(entries[0].balanceCents).toBeUndefined();
  });
});

// ─── Ordering ─────────────────────────────────────────────────────────────────

describe("buildOrderLedger — overall ordering", () => {
  it("orders entries as: per-form (items then discount), fees, payments/refunds interleaved, notes", () => {
    const entries = buildOrderLedger(purchaseV2Fixture);
    expect(entries.map((e) => e.type)).toEqual([
      "item",
      "item",
      "discount",
      "fee",
      "fee",
      "payment",
      "refund",
      "note"
    ]);
  });
});
