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

import React from "react";
import { render } from "@testing-library/react";
import { pdf } from "@react-pdf/renderer";
import { buildRows, OrderPdf, generateInvoicePDF, previewPDF } from "../index";
import { formatDate, getThemeFontFamily } from "../helpers";
import purchaseV2Fixture from "./fixtures/purchase-v2.json";

const TRANSLATIONS = {
  "order_invoice_pdf.invoice_title": "Invoice",
  "order_invoice_pdf.order": "Order",
  "order_invoice_pdf.date": "Date",
  "order_invoice_pdf.pending": "Pending",
  "order_invoice_pdf.client": "Client",
  "order_invoice_pdf.address": "Address",
  "order_invoice_pdf.event": "Event",
  "order_invoice_pdf.venue": "Venue",
  "order_invoice_pdf.charge": "Charge",
  "order_invoice_pdf.payment_method": "Payment Method",
  "order_invoice_pdf.status": "Status",
  "order_invoice_pdf.payment_date": "Payment Date",
  "sponsor_order_grid.code": "Code",
  "sponsor_order_grid.type": "Type",
  "sponsor_order_grid.details": "Details",
  "sponsor_order_grid.amount": "Amount",
  "sponsor_order_grid.balance": "Balance",
  "sponsor_order_grid.amount_due": "AMOUNT DUE",
  "sponsor_order_grid.reconciliation": "Reconciliation",
  "sponsor_order_grid.cancelled": "Cancelled",
  "sponsor_order_grid.refunded": "Refunded",
  "sponsor_order_grid.retained": "Retained as cancellation fee",
  "sponsor_order_grid.credited": "Credited to Payment Method",
  "sponsor_order_grid.cancelled_by": "Cancelled ({x} of {y}) - {date} - {user}",
  "sponsor_order_grid.cancelled_items": "Cancelled items:",
  "mui_table.payment": "Payment",
  "mui_table.discount": "Discount",
  "mui_table.refund": "Refund",
  "mui_table.paid_via": "Paid via",
  "mui_table.note": "NOTE",
  "mui_table.total": "Total",
  "mui_table.pay": "PAY",
  "mui_table.ref": "REF",
  "mui_table.dis": "DIS",
  "mui_table.payfee": "PAYFEE",
  "mui_table.card": "card",
  "general.not_available": "N/A"
};

jest.mock("i18n-react/dist/i18n-react", () => ({
  __esModule: true,
  default: {
    translate: (key, tokens) => {
      let text = TRANSLATIONS[key] ?? key;
      if (tokens) {
        Object.entries(tokens).forEach(([token, value]) => {
          text = text.replace(new RegExp(`{${token}}`, "g"), value);
        });
      }
      return text;
    }
  }
}));

jest.mock("@react-pdf/renderer", () => {
  const React = require("react");
  const Span = ({ children }) =>
    React.createElement("span", null, children ?? null);
  return {
    Document: Span,
    Page: Span,
    Text: Span,
    View: Span,
    Image: () => null,
    Svg: () => null,
    Path: () => null,
    StyleSheet: { create: (s) => s },
    // Mirrors a consuming app that has registered "Inter" via Font.register
    // and nothing else — matches the real @react-pdf/font contract, which
    // only ever knows about Helvetica/Courier/Times-Roman plus whatever the
    // consumer explicitly registered.
    Font: {
      register: () => {},
      getRegisteredFontFamilies: () => ["Inter"]
    },
    pdf: jest.fn(() => ({ toBlob: async () => ({}) }))
  };
});

// ─── Fixture-derived builders ──────────────────────────────────────────────
//
// `purchase-v2.json` pins the shape of GET .../api/v2/summits/{id}/sponsors/{id}/purchases/{id}
// ?expand=forms,forms.items,forms.items.meta_fields,forms.items.type,refunds,payments,notes,fees
// (PurchaseV2Serializer) — the exact call sponsor-services makes before handing the raw order to
// generateInvoicePDF/previewPDF. Every builder below starts from a real slice of that fixture and
// overrides only the field(s) a given test cares about, instead of hand-authoring object literals.
// A field this component reads that the fixture doesn't carry (or carries under a different key)
// now surfaces as a failing assertion instead of a silently blank cell in the PDF.

const baseForm = purchaseV2Fixture.forms[0];
const baseItem = baseForm.items[0]; // not cancelled
const baseCancelledItem = baseForm.items[1]; // fully cancelled
const basePartiallyCancelledItem = baseForm.items[2]; // partially cancelled
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
const makePartiallyCancelledItem = (overrides = {}) => ({
  ...basePartiallyCancelledItem,
  ...overrides
});
const makeFee = (overrides = {}) => ({ ...baseFee, ...overrides });
const makePayment = (overrides = {}) => ({ ...basePayment, ...overrides });
const makeRefund = (overrides = {}) => ({ ...baseRefund, ...overrides });
const makeNote = (overrides = {}) => ({ ...baseNote, ...overrides });

// The full raw order as sponsor-services receives it — used as-is or overridden
// per test, never hand-rolled.
const makeRenderOrder = (overrides = {}) => ({
  ...purchaseV2Fixture,
  ...overrides
});

// Venue/location data comes from a different API (summit-api), which already uses
// address_1/zip_code — not part of the purchases-api v2 contract this fixture pins.
const makeRenderSummit = (overrides = {}) => ({
  name: "OpenStack Summit 2026",
  time_zone_id: "America/Los_Angeles",
  locations: [
    {
      is_main: true,
      short_name: "Main Hall",
      name: "Convention Center",
      address_1: "123 Expo Blvd",
      city: "Vancouver",
      state: "BC",
      postal_code: "V6B 1A1",
      country: "Canada"
    }
  ],
  ...overrides
});

// buildRows is now a thin presentational mapper over utils/order-ledger —
// derivation rules (filtering, ordering, sign conventions, row keys) are
// unit-tested against raw cents in utils/__tests__/order-ledger.test.js.
// What's left here is the mapping from ledger entries to presentational
// fields: i18n labels, currency/date formatting, and description composition.

// ─── Empty / missing collections ─────────────────────────────────────────────

describe("buildRows — empty / missing collections", () => {
  it("returns [] without throwing for any empty input", () => {
    expect(buildRows({})).toEqual([]);
    expect(
      buildRows({ forms: [], fees: [], payments: [], refunds: [] })
    ).toEqual([]);
  });
});

// ─── Item rows ────────────────────────────────────────────────────────────────

describe("buildRows — item rows", () => {
  it("emits item rows directly with no group row", () => {
    const rows = buildRows({ forms: [makeForm({ items: [makeItem()] })] });
    expect(rows[0].type).toBe("item");
    expect(rows.every((r) => r.type !== "group")).toBe(true);
  });

  it("formats price, stringifies qty, and uses form.code as the row code", () => {
    const form = makeForm({
      code: "ABC-1",
      items: [makeItem({ amount: 5000, quantity: 3 })]
    });
    const itemRow = buildRows({ forms: [form] }).find((r) => r.type === "item");
    expect(itemRow.price).toBe("$50.00");
    expect(itemRow.qty).toBe("3");
    expect(itemRow.code).toBe("ABC-1");
  });

  it("prefers item.type.name over item.title for description", () => {
    const withType = makeItem(); // base item already carries type.name = "Platinum Sponsor"
    const withoutType = makeItem({ type: null }); // falls back to title = "Logo Placement"
    const rows = buildRows({
      forms: [
        makeForm({ id: 1, items: [withType] }),
        makeForm({ id: 2, items: [withoutType] })
      ]
    });
    const itemRows = rows.filter((r) => r.type === "item");
    expect(itemRows[0].description).toBe("Platinum Sponsor");
    expect(itemRows[1].description).toBe("Logo Placement");
  });
});

// ─── Cancelled items (per-item, not per-form) ─────────────────────────────────

describe("buildRows — cancelled items", () => {
  it("sets cancelled: true and populates cancellations when canceled_quantity equals quantity", () => {
    const rows = buildRows({ forms: [makeForm({ items: [makeCancelledItem()] })] });
    expect(rows[0].cancelled).toBe(true);
    expect(rows[0].partiallyCancelled).toBe(false);
    expect(rows[0].cancellations).toHaveLength(1);
    expect(rows[0].cancellations[0].label).toMatch(/Admin User/);
    expect(rows[0].qty).toBe("0"); // quantity(1) - canceled_quantity(1)
  });

  it("sets cancelled: false, partiallyCancelled: false and no cancellations when canceled_quantity is absent or 0", () => {
    const withZero = makeForm({
      id: 1,
      discount_in_cents: 0,
      items: [makeItem({ canceled_quantity: 0 })]
    });
    const withAbsent = makeForm({
      id: 2,
      discount_in_cents: 0,
      items: [makeItem()]
    });
    const rows = buildRows({ forms: [withZero, withAbsent] });
    rows.forEach((r) => {
      expect(r.cancelled).toBe(false);
      expect(r.partiallyCancelled).toBe(false);
      expect(r.cancellations).toEqual([]);
    });
  });

  it("sets partiallyCancelled: true (and cancelled: false) when canceled_quantity is between 0 and quantity", () => {
    const rows = buildRows({ forms: [makeForm({ items: [makePartiallyCancelledItem()] })] });
    expect(rows[0].cancelled).toBe(false);
    expect(rows[0].partiallyCancelled).toBe(true);
    // quantity(5) - canceled_quantity(2) = 3 remaining
    expect(rows[0].qty).toBe("3");
    expect(rows[0].cancellations).toHaveLength(1);
    expect(rows[0].cancellations[0].label).toMatch(/Admin User/);
  });

  it("fully cancelled items still accumulate their full amount into the running balance", () => {
    const normalItem = makeItem({ amount: 8000 });
    const cancelledItem = makeCancelledItem({ amount: 10000 });
    const rows = buildRows({
      forms: [
        makeForm({ id: 1, discount_in_cents: 0, items: [normalItem] }),
        makeForm({ id: 2, discount_in_cents: 0, items: [cancelledItem] })
      ]
    });
    const normal = rows.find((r) => !r.cancelled);
    const cancelled = rows.find((r) => r.cancelled);
    expect(normal.balanceCents).toBe(8000);
    expect(cancelled.balanceCents).toBe(18000); // 8000 + 10000
  });

  it("partially cancelled items still accumulate their full amount into the running balance (matches SponsorOrderGrid; cancellation only nets out via reconciliation)", () => {
    const partialItem = makePartiallyCancelledItem({ amount: 50000 });
    const rows = buildRows({ forms: [makeForm({ discount_in_cents: 0, items: [partialItem] })] });
    expect(rows[0].balanceCents).toBe(50000);
  });

  it("a form-level canceled_by_id does not mark items as cancelled", () => {
    const form = makeForm({ canceled_by_id: 99, items: [makeItem()] });
    const rows = buildRows({ forms: [form] });
    expect(rows[0].cancelled).toBe(false);
  });
});

// ─── Fee rows ─────────────────────────────────────────────────────────────────

describe("buildRows — fee rows", () => {
  it("emits code PAYFEE with formatted amount", () => {
    const feeRow = buildRows({
      fees: [makeFee({ title: "Processing Fee", amount: 200 })]
    }).find((r) => r.type === "fee");
    expect(feeRow.code).toBe("PAYFEE");
    expect(feeRow.price).toBe("$2.00");
  });
});

// ─── Discount rows ────────────────────────────────────────────────────────────

describe("buildRows — discount rows", () => {
  it("emits one discount row with code DIS and formatted amount, describing a Rate discount from raw discount_amount/discount_type", () => {
    // Base form already carries discount_in_cents/discount_amount/discount_type
    // as raw fields — never a pre-formatted `discount` string (the API doesn't send one).
    const form = makeForm();
    const discountRows = buildRows({ forms: [form] }).filter(
      (r) => r.type === "discount"
    );
    expect(discountRows).toHaveLength(1);
    expect(discountRows[0].rowKey).toBe(`discount-${form.id}`);
    expect(discountRows[0].code).toBe("DIS");
    expect(discountRows[0].price).toBe("$50.00");
    expect(discountRows[0].description).toBe("10%");
  });

  it("describes an Amount discount from raw discount_amount/discount_type", () => {
    const form = makeForm({
      discount_in_cents: 500,
      discount_amount: 500,
      discount_type: "Amount"
    });
    const discountRows = buildRows({ forms: [form] }).filter(
      (r) => r.type === "discount"
    );
    expect(discountRows[0].description).toBe("$5.00");
  });

  it("prefers a pre-formatted form.discount string over discount_amount/discount_type when present (matches SponsorOrderGrid)", () => {
    const form = makeForm({
      discount: "10% off",
      discount_amount: 1000,
      discount_type: "Rate"
    });
    const discountRows = buildRows({ forms: [form] }).filter(
      (r) => r.type === "discount"
    );
    expect(discountRows[0].description).toBe("10% off");
  });
});

// ─── Payment rows ─────────────────────────────────────────────────────────────

describe("buildRows — payment rows", () => {
  it("sets description to 'Paid via <method>' and defaults method to card", () => {
    const withMethod = buildRows({
      payments: [makePayment({ method: "wire" })]
    }).find((r) => r.type === "payment");
    expect(withMethod.price).toBe("$600.00");
    expect(withMethod.description).toBe("Paid via wire");

    const withoutMethod = buildRows({
      payments: [makePayment({ id: 2, method: undefined })]
    }).find((r) => r.type === "payment");
    expect(withoutMethod.description).toBe("Paid via card");
  });
});

// ─── Refund rows ──────────────────────────────────────────────────────────────

describe("buildRows — refund rows", () => {
  it("maps reason to description and status to subDescription, with defaults when absent", () => {
    const withFields = buildRows({ refunds: [makeRefund()] }).find(
      (r) => r.type === "refund"
    );
    expect(withFields.price).toBe("$30.00");
    expect(withFields.description).toBe("duplicate charge");
    expect(withFields.subDescription).toBe("approved");

    const withDefaults = buildRows({
      refunds: [
        makeRefund({ id: 2, reason: undefined, status: undefined, amount: 1000 })
      ]
    }).find((r) => r.type === "refund");
    expect(withDefaults.description).toBe("Refund");
    expect(withDefaults.subDescription).toBe("");
  });
});

// ─── Note rows ────────────────────────────────────────────────────────────────

describe("buildRows — note rows", () => {
  it("emits type 'note' with content, defaulting to empty string when absent", () => {
    const withContent = buildRows({ notes: [makeNote()] });
    expect(withContent[0].type).toBe("note");
    expect(withContent[0].content).toBe("Call client to confirm shipping address");

    const withoutContent = buildRows({
      notes: [makeNote({ id: 2, content: undefined })]
    });
    expect(withoutContent[0].content).toBe("");
  });
});

// ─── getThemeFontFamily ─────────────────────────────────────────────────────
//
// Exercised directly (not just via a full OrderPdf render) because the real
// failure this guards against — react-pdf's FontStore throwing "Font family
// not registered" — lives inside @react-pdf/font/@react-pdf/layout, which the
// mock above replaces entirely. A render-level "does not throw" assertion
// would pass whether or not getThemeFontFamily's registration check exists,
// since the mocked Font never throws either way.

describe("getThemeFontFamily", () => {
  it("returns DEFAULT_FONT_FAMILY when the theme has no fontFamily", () => {
    expect(getThemeFontFamily(undefined)).toBe("Helvetica");
    expect(getThemeFontFamily({})).toBe("Helvetica");
  });

  it("falls back to DEFAULT_FONT_FAMILY when the theme's fontFamily is not registered via Font.register", () => {
    // Mocked Font.getRegisteredFontFamilies() above only returns ["Inter"] —
    // this is the exact shape of sponsor-services' MUI theme (Roboto stack).
    expect(
      getThemeFontFamily({ typography: { fontFamily: "Roboto, sans-serif" } })
    ).toBe("Helvetica");
  });

  it("returns the theme's fontFamily when it is registered via Font.register", () => {
    expect(
      getThemeFontFamily({ typography: { fontFamily: "Inter, sans-serif" } })
    ).toBe("Inter");
  });
});

// ─── OrderPdf render-level ────────────────────────────────────────────────────

describe("OrderPdf — render", () => {
  it("renders header fields from order and summit, venue from locations marked is_main", () => {
    const { container } = render(
      <OrderPdf order={makeRenderOrder()} summit={makeRenderSummit()} />
    );
    const text = container.textContent;
    expect(text).toContain("000042");
    expect(text).toContain("Acme Corp");
    expect(text).toContain("Jane Doe");
    // Client address — purchases-api v2 shape (line1/line2), not summit-api's address_1.
    expect(text).toContain("789 Client Ave");
    expect(text).toContain("97201");
    // Payment method/status/date — plain reads off PurchaseV2Serializer.allowed_fields,
    // present on the raw order this component receives. Checking the labels (not just
    // the values) avoids false positives from "Invoice"/"Pending" already appearing
    // elsewhere in the header for unrelated reasons.
    expect(text).toContain("Payment Method");
    expect(text).toContain("Status");
    expect(text).toContain("Payment Date");
    expect(text).toContain(formatDate(purchaseV2Fixture.created, "LOC", "YYYY/MM/DD hh:mm a"));
    expect(text).toContain("OpenStack Summit 2026");
    expect(text).toContain("Main Hall");
    expect(text).toContain("123 Expo Blvd");
    expect(text).toContain("V6B 1A1");
  });

  it("renders 'N/A' for the client Address field when order.address is missing", () => {
    const { container } = render(
      <OrderPdf
        order={makeRenderOrder({ address: null })}
        summit={makeRenderSummit()}
      />
    );
    expect(container.textContent).toContain("N/A");
  });

  it("prefers main_locations over locations.is_main when both are present", () => {
    const { container } = render(
      <OrderPdf
        order={makeRenderOrder()}
        summit={makeRenderSummit({
          main_locations: [
            {
              short_name: "Legacy Hall",
              name: "Legacy Center",
              address_1: "1 Legacy Way",
              city: "Legacy City",
              state: "LC",
              postal_code: "00000",
              country: "Legacyland"
            }
          ]
        })}
      />
    );
    const text = container.textContent;
    expect(text).toContain("Legacy Hall");
    expect(text).toContain("1 Legacy Way");
    expect(text).not.toContain("Main Hall");
  });

  it("throws a clear error when order or summit are omitted", () => {
    expect(() => render(<OrderPdf summit={makeRenderSummit()} />)).toThrow(
      "OrderPdf: order is required"
    );
    expect(() => render(<OrderPdf order={makeRenderOrder()} />)).toThrow(
      "OrderPdf: summit is required"
    );
  });

  it("renders 'Pending' for the Date field when purchased_date is null", () => {
    const { container } = render(
      <OrderPdf
        order={makeRenderOrder({ purchased_date: null })}
        summit={makeRenderSummit()}
      />
    );
    expect(container.textContent).toContain("Pending");
  });

  it("renders the formatted date when purchased_date is present", () => {
    // status: overridden away from the fixture's default "Pending" so this
    // assertion isn't confounded by the unrelated Status field sharing that text.
    const { container } = render(
      <OrderPdf
        order={makeRenderOrder({ status: "Paid" })}
        summit={makeRenderSummit()}
      />
    );
    expect(container.textContent).not.toContain("Pending");
    expect(container.textContent).toContain(
      formatDate(
        makeRenderOrder().purchased_date,
        "LOC",
        "YYYY/MM/DD hh:mm a"
      )
    );
  });
});

// ─── Reconciliation block ─────────────────────────────────────────────────────

describe("OrderPdf — reconciliation block", () => {
  it("renders cancelled and refunded totals from order-level fields", () => {
    const order = makeRenderOrder({
      cancelled_total: 75000,
      refunds_total: 20000,
      retained: 75000,
      credited_to_payment_method: 0
    });
    const { container } = render(
      <OrderPdf order={order} summit={makeRenderSummit()} />
    );
    const text = container.textContent;
    expect(text).toContain("Reconciliation");
    expect(text).toContain("Cancelled");
    expect(text).toContain("Refunded");
    expect(text).toContain("$750.00");
    expect(text).toContain("$200.00");
  });

  it("switches label between 'Retained as cancellation fee' and 'Credited to Payment Method'", () => {
    const { container: retainedContainer } = render(
      <OrderPdf
        order={makeRenderOrder({ retained: 5000 })}
        summit={makeRenderSummit()}
      />
    );
    expect(retainedContainer.textContent).toContain(
      "Retained as cancellation fee"
    );

    const { container: creditedContainer } = render(
      <OrderPdf
        order={makeRenderOrder({ retained: 0, credited_to_payment_method: 5000 })}
        summit={makeRenderSummit()}
      />
    );
    expect(creditedContainer.textContent).toContain(
      "Credited to Payment Method"
    );
  });

  it("omits the block entirely when cancelled/refunded/retained/credited are all zero", () => {
    const order = makeRenderOrder({
      cancelled_total: 0,
      refunds_total: 0,
      retained: 0,
      credited_to_payment_method: 0
    });
    const { container } = render(
      <OrderPdf order={order} summit={makeRenderSummit()} />
    );
    expect(container.textContent).not.toContain("Reconciliation");
  });
});

// ─── Partial cancellation (render-level) ──────────────────────────────────

describe("OrderPdf — partial cancellation", () => {
  it("shows a quantity split for a partially-cancelled line instead of a full strikethrough row", () => {
    const { container } = render(
      <OrderPdf order={makeRenderOrder()} summit={makeRenderSummit()} />
    );
    const text = container.textContent;
    // basePartiallyCancelledItem: quantity 5, canceled_quantity 2 -> 3 remaining
    expect(text).toContain("Extra Badges - Total: 3");
    // Cancellation event line uses the (x of y) translation tokens
    expect(text).toContain("Cancelled (2 of 5) - ");
    expect(text).toContain("Admin User");
    expect(text).toContain(
      formatDate(
        basePartiallyCancelledItem.cancellations[0].created,
        "LOC",
        "M/D/YY [@] h:mm A"
      )
    );
  });
});

// ─── Cancelled items summary (render-level) ───────────────────────────────
//
// Mirrors SponsorOrderGrid's CancelledItems: an at-a-glance list of every
// (partially or fully) cancelled line, so a reader doesn't have to scan the
// whole table to find them.

describe("OrderPdf — cancelled items summary", () => {
  it("lists every cancelled line as 'formCode - itemCode (x/y)'", () => {
    const { container } = render(
      <OrderPdf order={makeRenderOrder()} summit={makeRenderSummit()} />
    );
    const text = container.textContent;
    expect(text).toContain("Cancelled items:");
    // baseCancelledItem: form GOLD-1, ITEM-B, fully cancelled (1/1)
    expect(text).toContain("GOLD-1 - ITEM-B (1/1)");
    // basePartiallyCancelledItem: form GOLD-1, ITEM-C, partially cancelled (2/5)
    expect(text).toContain("GOLD-1 - ITEM-C (2/5)");
  });

  it("omits the summary entirely when no line is cancelled", () => {
    const { container } = render(
      <OrderPdf
        order={makeRenderOrder({
          forms: [makeForm({ discount_in_cents: 0, items: [makeItem()] })]
        })}
        summit={makeRenderSummit()}
      />
    );
    expect(container.textContent).not.toContain("Cancelled items:");
  });
});

// ─── generateInvoicePDF ────────────────────────────────────────────────────

describe("generateInvoicePDF", () => {
  let callOrder;
  let clickSpy;
  let appendChildSpy;
  let removeChildSpy;

  beforeEach(() => {
    jest.useFakeTimers();
    callOrder = [];
    URL.createObjectURL = jest.fn(() => {
      callOrder.push("createObjectURL");
      return "blob:mock-url";
    });
    URL.revokeObjectURL = jest.fn(() => callOrder.push("revokeObjectURL"));
    clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => callOrder.push("click"));
    appendChildSpy = jest.spyOn(document.body, "appendChild");
    removeChildSpy = jest.spyOn(document.body, "removeChild");
  });

  afterEach(() => {
    jest.useRealTimers();
    delete URL.createObjectURL;
    delete URL.revokeObjectURL;
    jest.restoreAllMocks();
  });

  it("downloads the blob through a temporary link, then revokes the URL only after a delay", async () => {
    await generateInvoicePDF(
      makeRenderOrder({ number: "ORD 2026 001" }),
      makeRenderSummit()
    );

    const link = appendChildSpy.mock.calls[0][0];
    expect(link.tagName).toBe("A");
    expect(link.href).toContain("blob:mock-url");
    expect(link.download).toBe("invoice-ord-2026-001.pdf");

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(removeChildSpy).toHaveBeenCalledWith(link);
    // revoking right after click() has been reported to produce empty/failed
    // downloads on Safari and some Firefox versions, so it must be deferred
    expect(callOrder).toEqual(["createObjectURL", "click"]);
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();

    jest.advanceTimersByTime(60_000);
    expect(callOrder).toEqual(["createObjectURL", "click", "revokeObjectURL"]);
  });

  it("logs and rethrows when PDF generation fails, without touching the DOM", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    pdf.mockReturnValueOnce({
      toBlob: () => Promise.reject(new Error("boom"))
    });

    await expect(
      generateInvoicePDF(makeRenderOrder(), makeRenderSummit())
    ).rejects.toThrow("boom");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error generating invoice PDF:",
      expect.any(Error)
    );
    expect(appendChildSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

// ─── previewPDF ─────────────────────────────────────────────────────────────

describe("previewPDF", () => {
  let originalOpen;
  let fakeTab;

  beforeEach(() => {
    jest.useFakeTimers();
    originalOpen = window.open;
    fakeTab = { location: { href: "" } };
    URL.createObjectURL = jest.fn(() => "blob:mock-preview-url");
    URL.revokeObjectURL = jest.fn();
    window.open = jest.fn(() => fakeTab);
  });

  afterEach(() => {
    jest.useRealTimers();
    delete URL.createObjectURL;
    delete URL.revokeObjectURL;
    window.open = originalOpen;
  });

  it("opens a blank tab synchronously (before the blob is ready) so Safari's popup blocker doesn't kill it", async () => {
    const promise = previewPDF(makeRenderOrder(), makeRenderSummit());

    // asserted before awaiting, i.e. before the pending PDF promise resolves
    expect(window.open).toHaveBeenCalledWith("", "_blank");

    await promise;
  });

  it("navigates the pre-opened tab to the blob URL once it's ready", async () => {
    await previewPDF(makeRenderOrder(), makeRenderSummit());

    expect(fakeTab.location.href).toBe("blob:mock-preview-url");
  });

  it("falls back to downloading the PDF when the popup blocker returns null for the pre-opened tab", async () => {
    window.open = jest.fn(() => null);
    const appendChildSpy = jest.spyOn(document.body, "appendChild");
    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    await previewPDF(makeRenderOrder(), makeRenderSummit());

    expect(appendChildSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();

    appendChildSpy.mockRestore();
    clickSpy.mockRestore();
  });

  it("logs, closes the pre-opened tab, and rethrows when PDF generation fails", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    fakeTab.close = jest.fn();
    pdf.mockReturnValueOnce({
      toBlob: () => Promise.reject(new Error("boom"))
    });

    await expect(
      previewPDF(makeRenderOrder(), makeRenderSummit())
    ).rejects.toThrow("boom");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error generating invoice PDF preview:",
      expect.any(Error)
    );
    expect(fakeTab.close).toHaveBeenCalledTimes(1);
    consoleErrorSpy.mockRestore();
  });

  it("keeps the URL alive until the new tab has had time to load it", async () => {
    await previewPDF(makeRenderOrder(), makeRenderSummit());

    expect(URL.revokeObjectURL).not.toHaveBeenCalled();

    jest.advanceTimersByTime(59_999);
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-preview-url");
  });
});
