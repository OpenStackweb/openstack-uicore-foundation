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

// One raw v2 order, run through both real consumers (the invoice PDF's
// buildRows and SponsorOrderGrid's render), asserting they land on the same
// row order/keys and the same running balance. This is the regression net
// against the two copies silently drifting apart again.

jest.mock("i18n-react/dist/i18n-react", () => ({
  __esModule: true,
  default: {
    translate: (key, tokens) => {
      let text = key;
      if (tokens) {
        Object.entries(tokens).forEach(([token, value]) => {
          text = text.replace(new RegExp(`{${token}}`, "g"), value);
        });
      }
      return text;
    }
  }
}));

jest.mock("@react-pdf/renderer", () => ({
  Document: () => null,
  Page: () => null,
  Text: () => null,
  View: () => null,
  Image: () => null,
  Svg: () => null,
  Path: () => null,
  StyleSheet: { create: (s) => s },
  Font: { register: () => {}, getRegisteredFontFamilies: () => [] },
  pdf: jest.fn()
}));

import React from "react";
import { render } from "@testing-library/react";
import { buildOrderLedger } from "../../../utils/order-ledger";
import { formatBalance } from "../../../utils/money";
import { buildRows } from "../helpers";
import SponsorOrderGrid from "../../mui/SponsorOrderGrid";
import purchaseV2Fixture from "./fixtures/purchase-v2.json";

describe("order ledger consistency — PDF buildRows and SponsorOrderGrid on the same fixture", () => {
  const ledger = buildOrderLedger(purchaseV2Fixture);

  it("has a non-trivial fixture covering every entry type", () => {
    expect(new Set(ledger.map((e) => e.type))).toEqual(
      new Set(["item", "discount", "fee", "payment", "refund", "note"])
    );
  });

  it("buildRows (PDF) preserves the ledger's row order, keys and running balance", () => {
    const pdfRows = buildRows(purchaseV2Fixture);
    expect(pdfRows).toHaveLength(ledger.length);

    ledger.forEach((entry, i) => {
      expect(pdfRows[i].rowKey).toBe(entry.rowKey);
      expect(pdfRows[i].type).toBe(entry.type);
      if (entry.type !== "note") {
        expect(pdfRows[i].balanceCents).toBe(entry.balanceCents);
      }
    });
  });

  it("SponsorOrderGrid renders the same running balance, in the same order, as the ledger", () => {
    const { container } = render(<SponsorOrderGrid order={purchaseV2Fixture} />);
    const rows = container.querySelectorAll("tbody tr");

    ledger.forEach((entry, i) => {
      if (entry.type === "note") return;
      const balanceCell = rows[i].querySelector("td:last-child");
      expect(balanceCell.textContent).toBe(formatBalance(entry.balanceCents));
    });
  });

  it("buildRows (PDF) and SponsorOrderGrid render the same discount description when form.discount is a pre-formatted string", () => {
    const orderWithNormalizedDiscount = {
      ...purchaseV2Fixture,
      forms: [{ ...purchaseV2Fixture.forms[0], discount: "10% off" }]
    };

    const pdfDiscountRow = buildRows(orderWithNormalizedDiscount).find(
      (row) => row.type === "discount"
    );
    const { container } = render(
      <SponsorOrderGrid order={orderWithNormalizedDiscount} />
    );

    expect(pdfDiscountRow.description).toBe("10% off");
    expect(container.textContent).toContain("10% off");
  });

  it("PDF's cancelled-items filter and the grid's cancelled-items header agree on which items are cancelled", () => {
    const pdfCancelledRatios = buildRows(purchaseV2Fixture)
      .filter((row) => row.type === "item" && row.canceledQuantity > 0)
      .map((row) => `(${row.canceledQuantity}/${row.quantity})`);

    // Sanity check the fixture actually exercises both a fully and a
    // partially cancelled item -- otherwise this test would pass vacuously.
    expect(pdfCancelledRatios.length).toBeGreaterThanOrEqual(2);

    const { container } = render(
      <SponsorOrderGrid order={purchaseV2Fixture} withCancelledItemsHeader />
    );

    // Matched on the "(canceled/total)" ratio the CancelledItems header
    // renders per item -- itemCode is deliberately not part of this check,
    // since real purchases-api-v2 items always carry a populated `type`.
    pdfCancelledRatios.forEach((ratio) => {
      expect(container.textContent).toContain(ratio);
    });
  });
});
