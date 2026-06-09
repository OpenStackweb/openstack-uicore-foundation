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

jest.mock("i18n-react/dist/i18n-react", () => ({
  __esModule: true,
  default: { translate: (key) => key }
}));

jest.mock("../../../../utils/money", () => ({
  currencyAmountFromCents: (amount) => `$${(amount / 100).toFixed(2)}`
}));

jest.mock("../../../../utils/constants", () => ({
  ...jest.requireActual("../../../../utils/constants"),
  SPONSOR_FORMS_METAFIELD_CLASS: { FORM: "Form", ITEM: "Item" }
}));

jest.mock("../../../../utils/methods", () => ({
  formatEpoch: () => "2026-01-01"
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SponsorOrderGrid from "../index";

const makeItem = (overrides = {}) => ({
  line_id: 1,
  quantity: 1,
  amount: 10000,
  canceled_by_id: null,
  type: { name: "Booth", code: "BOOTH" },
  meta_fields: [],
  ...overrides
});

const makeForm = (overrides = {}) => ({
  id: 10,
  code: "GOLD",
  name: "Gold Sponsor",
  discount: null,
  discount_in_cents: null,
  items: [makeItem()],
  ...overrides
});

const defaultProps = {
  order: {
    forms: [makeForm()],
    total: 10000
  }
};

describe("SponsorOrderGrid", () => {
  test("renders column headers", () => {
    render(<SponsorOrderGrid {...defaultProps} />);
    expect(screen.getByText("sponsor_order_grid.code")).toBeInTheDocument();
    expect(screen.getByText("sponsor_order_grid.type")).toBeInTheDocument();
    expect(screen.getByText("sponsor_order_grid.details")).toBeInTheDocument();
    expect(screen.getByText("sponsor_order_grid.amount")).toBeInTheDocument();
    expect(screen.getByText("sponsor_order_grid.balance")).toBeInTheDocument();
  });

  test("renders item form code", () => {
    render(<SponsorOrderGrid {...defaultProps} />);
    expect(screen.getByText("GOLD")).toBeInTheDocument();
  });

  test("renders item name in details column", () => {
    render(<SponsorOrderGrid {...defaultProps} />);
    expect(screen.getByText(/Booth/)).toBeInTheDocument();
  });

  test("renders formatted charge amount", () => {
    render(<SponsorOrderGrid {...defaultProps} />);
    expect(screen.getAllByText("$100.00").length).toBeGreaterThan(0);
  });

  test("renders no-items message when forms is empty", () => {
    render(<SponsorOrderGrid order={{ forms: [], total: 0 }} />);
    expect(screen.getByText("mui_table.no_items")).toBeInTheDocument();
  });

  test("renders no-items message when forms is undefined", () => {
    render(<SponsorOrderGrid order={{ total: 0 }} />);
    expect(screen.getByText("mui_table.no_items")).toBeInTheDocument();
  });

  test("filters out items with zero quantity", () => {
    const order = { forms: [makeForm({ items: [makeItem({ quantity: 0 })] })], total: 0 };
    render(<SponsorOrderGrid order={order} />);
    expect(screen.queryByText("$100.00")).not.toBeInTheDocument();
  });

  test("does not render action column when callbacks are absent", () => {
    render(<SponsorOrderGrid {...defaultProps} />);
    expect(screen.queryByText("sponsor_order_grid.action")).not.toBeInTheDocument();
  });

  test("renders action column header when both callbacks are provided", () => {
    render(
      <SponsorOrderGrid
        {...defaultProps}
        onCancelForm={jest.fn()}
        onUndoCancelForm={jest.fn()}
      />
    );
    expect(screen.getByText("sponsor_order_grid.action")).toBeInTheDocument();
  });

  test("renders delete button for active item and calls onCancelForm on click", () => {
    const onCancelForm = jest.fn();
    render(
      <SponsorOrderGrid
        {...defaultProps}
        onCancelForm={onCancelForm}
        onUndoCancelForm={jest.fn()}
      />
    );
    const button = document.querySelector("tbody button");
    fireEvent.click(button);
    expect(onCancelForm).toHaveBeenCalledTimes(1);
  });

  test("renders undo button for cancelled item and calls onUndoCancelForm on click", () => {
    const onUndoCancelForm = jest.fn();
    const order = { forms: [makeForm({ items: [makeItem({ canceled_by_id: 99 })] })], total: 0 };
    render(
      <SponsorOrderGrid
        order={order}
        onCancelForm={jest.fn()}
        onUndoCancelForm={onUndoCancelForm}
      />
    );
    const button = document.querySelector("tbody button");
    fireEvent.click(button);
    expect(onUndoCancelForm).toHaveBeenCalledTimes(1);
  });

  test("renders amount_due label in total row", () => {
    render(<SponsorOrderGrid order={{ forms: [], total: 5000 }} />);
    expect(screen.getByText("sponsor_order_grid.amount_due")).toBeInTheDocument();
  });

  test("renders reconciliation section when withReconciliation is true", () => {
    const order = {
      forms: [],
      total: 10000,
      retained: 2000,
      credited_to_payment_method: 0,
      cancelled_total: 5000,
      refunds_total: 3000
    };
    render(<SponsorOrderGrid order={order} withReconciliation />);
    expect(screen.getByText("sponsor_order_grid.reconciliation")).toBeInTheDocument();
  });

  test("does not render reconciliation section by default", () => {
    render(<SponsorOrderGrid order={{ forms: [], total: 0 }} />);
    expect(screen.queryByText("sponsor_order_grid.reconciliation")).not.toBeInTheDocument();
  });
});
