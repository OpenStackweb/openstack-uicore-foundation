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
import { formatDate } from "../helpers";

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
    Font: { register: () => {} },
    pdf: jest.fn(() => ({ toBlob: async () => ({}) }))
  };
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MOCK_SUMMIT = { time_zone_id: "UTC" };

const makeForm = (overrides = {}) => ({
  id: 1,
  code: "FORM-1",
  name: "Gold Package",
  discount_in_cents: 0,
  discount: null,
  add_on: null,
  items: [],
  ...overrides
});

const makeItem = (overrides = {}) => ({
  line_id: 10,
  code: "ITEM-A",
  title: "Logo Placement",
  type: null,
  quantity: 2,
  amount: 5000,
  ...overrides
});

// ─── Empty / missing collections ─────────────────────────────────────────────

describe("buildRows — empty / missing collections", () => {
  it("returns [] without throwing for any empty input", () => {
    expect(buildRows({}, MOCK_SUMMIT)).toEqual([]);
    expect(
      buildRows({ forms: [], fees: [], payments: [], refunds: [] }, MOCK_SUMMIT)
    ).toEqual([]);
  });
});

// ─── Item rows ────────────────────────────────────────────────────────────────

describe("buildRows — item rows", () => {
  it("emits item rows directly with no group row", () => {
    const rows = buildRows(
      { forms: [makeForm({ items: [makeItem()] })] },
      MOCK_SUMMIT
    );
    expect(rows[0].type).toBe("item");
    expect(rows.every((r) => r.type !== "group")).toBe(true);
  });

  it("formats price, stringifies qty, and uses form.code as the row code", () => {
    const form = makeForm({
      code: "ABC-1",
      items: [makeItem({ amount: 5000, quantity: 3 })]
    });
    const itemRow = buildRows({ forms: [form] }, MOCK_SUMMIT).find(
      (r) => r.type === "item"
    );
    expect(itemRow.price).toBe("$50.00");
    expect(itemRow.qty).toBe("3");
    expect(itemRow.code).toBe("ABC-1");
  });

  it("prefers item.type.name over item.title for description", () => {
    const withType = makeItem({
      type: { name: "Platinum Sponsor" },
      title: "fallback"
    });
    const withoutType = makeItem({ type: null, title: "Logo Placement" });
    const rows = buildRows(
      {
        forms: [
          makeForm({ id: 1, items: [withType] }),
          makeForm({ id: 2, items: [withoutType] })
        ]
      },
      MOCK_SUMMIT
    );
    const itemRows = rows.filter((r) => r.type === "item");
    expect(itemRows[0].description).toBe("Platinum Sponsor");
    expect(itemRows[1].description).toBe("Logo Placement");
  });

  it("excludes items with quantity 0", () => {
    const rows = buildRows(
      { forms: [makeForm({ items: [makeItem({ quantity: 0 })] })] },
      MOCK_SUMMIT
    );
    expect(rows).toHaveLength(0);
  });
});

// ─── Cancelled items (per-item, not per-form) ─────────────────────────────────

describe("buildRows — cancelled items", () => {
  const cancelledItem = makeItem({
    line_id: 20,
    amount: 10000,
    canceled_by_id: 99,
    canceled_by_full_name: "Admin User",
    canceled_at: 1700000000
  });

  it("sets cancelled: true and populates cancelledBy when item.canceled_by_id is set", () => {
    const rows = buildRows(
      { forms: [makeForm({ items: [cancelledItem] })] },
      MOCK_SUMMIT
    );
    expect(rows[0].cancelled).toBe(true);
    expect(rows[0].cancelledBy).toMatch(/Admin User/);
  });

  it("sets cancelled: false and empty cancelledBy when canceled_by_id is absent or null", () => {
    const withNull = makeForm({
      id: 1,
      items: [makeItem({ canceled_by_id: null })]
    });
    const withAbsent = makeForm({ id: 2, items: [makeItem()] });
    const rows = buildRows({ forms: [withNull, withAbsent] }, MOCK_SUMMIT);
    rows.forEach((r) => {
      expect(r.cancelled).toBe(false);
      expect(r.cancelledBy).toBe("");
    });
  });

  it("cancelled items still accumulate into the running balance", () => {
    const normalItem = makeItem({ line_id: 10, amount: 8000 });
    const rows = buildRows(
      {
        forms: [
          makeForm({ id: 1, items: [normalItem] }),
          makeForm({ id: 2, items: [cancelledItem] })
        ]
      },
      MOCK_SUMMIT
    );
    const normal = rows.find((r) => !r.cancelled);
    const cancelled = rows.find((r) => r.cancelled);
    expect(normal.balanceCents).toBe(8000);
    expect(cancelled.balanceCents).toBe(18000); // 8000 + 10000
  });

  it("a form-level canceled_by_id does not mark items as cancelled", () => {
    const form = makeForm({ canceled_by_id: 99, items: [makeItem()] });
    const rows = buildRows({ forms: [form] }, MOCK_SUMMIT);
    expect(rows[0].cancelled).toBe(false);
  });
});

// ─── Fee rows ─────────────────────────────────────────────────────────────────

describe("buildRows — fee rows", () => {
  it("emits code PAYFEE with formatted amount", () => {
    const feeRow = buildRows(
      { fees: [{ id: 1, title: "Processing Fee", amount: 200 }] },
      MOCK_SUMMIT
    ).find((r) => r.type === "fee");
    expect(feeRow.code).toBe("PAYFEE");
    expect(feeRow.price).toBe("$2.00");
  });
});

// ─── Discount rows ────────────────────────────────────────────────────────────

describe("buildRows — discount rows", () => {
  it("emits no discount rows when discount_in_cents is 0", () => {
    const rows = buildRows(
      { forms: [makeForm({ discount_in_cents: 0 })] },
      MOCK_SUMMIT
    );
    expect(rows.filter((r) => r.type === "discount")).toHaveLength(0);
  });

  it("emits one discount row with code DIS and formatted amount", () => {
    const form = makeForm({
      discount_in_cents: 1500,
      discount: "15%",
      code: "DISC-1"
    });
    const discountRows = buildRows({ forms: [form] }, MOCK_SUMMIT).filter(
      (r) => r.type === "discount"
    );
    expect(discountRows).toHaveLength(1);
    expect(discountRows[0].rowKey).toBe(`discount-${form.id}`);
    expect(discountRows[0].code).toBe("DIS");
    expect(discountRows[0].price).toBe("$15.00");
  });
});

// ─── Payment rows ─────────────────────────────────────────────────────────────

describe("buildRows — payment rows", () => {
  it("sets description to 'Paid via <method>' and defaults method to card", () => {
    const withMethod = buildRows(
      { payments: [{ id: 1, amount: 2500, method: "wire" }] },
      MOCK_SUMMIT
    ).find((r) => r.type === "payment");
    expect(withMethod.price).toBe("$25.00");
    expect(withMethod.description).toBe("Paid via wire");

    const withoutMethod = buildRows(
      { payments: [{ id: 2, amount: 10000 }] },
      MOCK_SUMMIT
    ).find((r) => r.type === "payment");
    expect(withoutMethod.description).toBe("Paid via card");
  });
});

// ─── Refund rows ──────────────────────────────────────────────────────────────

describe("buildRows — refund rows", () => {
  it("maps reason to description and status to subDescription, with defaults when absent", () => {
    const withFields = buildRows(
      {
        refunds: [
          {
            id: 1,
            reason: "duplicate charge",
            status: "approved",
            amount: 3000
          }
        ]
      },
      MOCK_SUMMIT
    ).find((r) => r.type === "refund");
    expect(withFields.price).toBe("$30.00");
    expect(withFields.description).toBe("duplicate charge");
    expect(withFields.subDescription).toBe("approved");

    const withDefaults = buildRows(
      { refunds: [{ id: 2, amount: 1000 }] },
      MOCK_SUMMIT
    ).find((r) => r.type === "refund");
    expect(withDefaults.description).toBe("Refund");
    expect(withDefaults.subDescription).toBe("");
  });
});

// ─── Note rows ────────────────────────────────────────────────────────────────

describe("buildRows — note rows", () => {
  it("emits type 'note' with content, defaulting to empty string when absent", () => {
    const withContent = buildRows(
      { notes: [{ id: 1, content: "Call client to confirm" }] },
      MOCK_SUMMIT
    );
    expect(withContent[0].type).toBe("note");
    expect(withContent[0].content).toBe("Call client to confirm");

    const withoutContent = buildRows({ notes: [{ id: 2 }] }, MOCK_SUMMIT);
    expect(withoutContent[0].content).toBe("");
  });
});

// ─── Balance accumulation ─────────────────────────────────────────────────────

describe("buildRows — balance accumulation", () => {
  it("interleaves payments and refunds by created date and updates balance correctly", () => {
    const rows = buildRows(
      {
        payments: [{ id: 1, amount: 10000, created: 2 }],
        refunds: [{ id: 2, amount: 3000, created: 1 }]
      },
      MOCK_SUMMIT
    );
    // refund first (created: 1), then payment (created: 2)
    expect(rows[0].type).toBe("refund");
    expect(rows[0].balanceCents).toBe(3000);
    expect(rows[1].type).toBe("payment");
    expect(rows[1].balanceCents).toBe(-7000); // 3000 - 10000
  });
});

// ─── OrderPdf render-level ────────────────────────────────────────────────────

const makeRenderOrder = (overrides = {}) => ({
  number: "ORD-2026-001",
  total: 0,
  purchased_date: 1700000000,
  purchased_by_full_name: "Jane Doe",
  client: { contact_name: "Jane Doe", company_name: "Acme Corp" },
  address: null,
  forms: [],
  fees: [],
  payments: [],
  refunds: [],
  cancelled_total: 0,
  refunds_total: 0,
  retained: 0,
  credited_to_payment_method: 0,
  ...overrides
});

const makeRenderSummit = (overrides = {}) => ({
  name: "OpenStack Summit 2026",
  time_zone_id: "America/Los_Angeles",
  main_locations: [
    {
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

describe("OrderPdf — render", () => {
  it("renders header fields from order and summit, venue from main_locations", () => {
    const { container } = render(
      <OrderPdf order={makeRenderOrder()} summit={makeRenderSummit()} />
    );
    const text = container.textContent;
    expect(text).toContain("ORD-2026-001");
    expect(text).toContain("Acme Corp");
    expect(text).toContain("Jane Doe");
    expect(text).toContain("OpenStack Summit 2026");
    expect(text).toContain("Main Hall");
    expect(text).toContain("123 Expo Blvd");
    expect(text).toContain("V6B 1A1");
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
    const { container } = render(
      <OrderPdf order={makeRenderOrder()} summit={makeRenderSummit()} />
    );
    expect(container.textContent).not.toContain("Pending");
    expect(container.textContent).toContain(
      formatDate(
        makeRenderOrder().purchased_date,
        makeRenderSummit().time_zone_id,
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
        order={makeRenderOrder({ credited_to_payment_method: 5000 })}
        summit={makeRenderSummit()}
      />
    );
    expect(creditedContainer.textContent).toContain(
      "Credited to Payment Method"
    );
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

  it("does not throw when the popup blocker returns null for the pre-opened tab", async () => {
    window.open = jest.fn(() => null);

    await expect(
      previewPDF(makeRenderOrder(), makeRenderSummit())
    ).resolves.toBeUndefined();
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
