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
  SPONSOR_FORMS_METAFIELD_CLASS: { FORM: "Form", ITEM: "Item" }
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SponsorOrderGrid from "../index";

const makeItem = (overrides = {}) => ({
  line_id: 1,
  quantity: 1,
  amount: 10000,
  current_rate: 5000,
  canceled_by_id: null,
  type: { name: "Booth" },
  meta_fields: [],
  ...overrides
});

const makeForm = (overrides = {}) => ({
  id: 10,
  code: "GOLD",
  name: "Gold Sponsor",
  addon_name: "Premium",
  discount: null,
  discount_total: null,
  items: [makeItem()],
  ...overrides
});

const defaultProps = {
  lines: [makeForm()],
  total: 10000
};

describe("SponsorOrderGrid", () => {
  test("renders column headers", () => {
    render(<SponsorOrderGrid {...defaultProps} />);
    expect(screen.getByText("sponsor_order_grid.code")).toBeInTheDocument();
    expect(screen.getByText("sponsor_order_grid.contents")).toBeInTheDocument();
    expect(screen.getByText("sponsor_order_grid.addon")).toBeInTheDocument();
    expect(screen.getByText("sponsor_order_grid.details")).toBeInTheDocument();
    expect(screen.getByText("sponsor_order_grid.rate")).toBeInTheDocument();
    expect(screen.getByText("sponsor_order_grid.amount")).toBeInTheDocument();
  });

  test("renders item code and name", () => {
    render(<SponsorOrderGrid {...defaultProps} />);
    expect(screen.getByText("GOLD")).toBeInTheDocument();
    expect(screen.getByText("Gold Sponsor")).toBeInTheDocument();
  });

  test("renders formatted amount and rate", () => {
    render(<SponsorOrderGrid {...defaultProps} />);
    expect(screen.getByText("$100.00")).toBeInTheDocument();
    expect(screen.getByText("$50.00")).toBeInTheDocument();
  });

  test("renders no-items message when lines is empty", () => {
    render(<SponsorOrderGrid lines={[]} total={0} />);
    expect(screen.getByText("mui_table.no_items")).toBeInTheDocument();
  });

  test("renders no-items message when lines is undefined", () => {
    render(<SponsorOrderGrid total={0} />);
    expect(screen.getByText("mui_table.no_items")).toBeInTheDocument();
  });

  test("filters out items with zero quantity", () => {
    const lines = [makeForm({ items: [makeItem({ quantity: 0 })] })];
    render(<SponsorOrderGrid lines={lines} total={0} />);
    expect(screen.queryByText("$100.00")).not.toBeInTheDocument();
  });

  test("does not render action column when callbacks are absent", () => {
    render(<SponsorOrderGrid {...defaultProps} />);
    expect(
      screen.queryByText("sponsor_order_grid.action")
    ).not.toBeInTheDocument();
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
    const deleteButton = screen.getByTestId
      ? document.querySelector('[data-testid="DeleteIcon"]')
      : null;
    const button = document.querySelector("button[aria-label]") || document.querySelector("tbody button");
    fireEvent.click(button);
    expect(onCancelForm).toHaveBeenCalledTimes(1);
  });

  test("renders undo button for cancelled item and calls onUndoCancelForm on click", () => {
    const onUndoCancelForm = jest.fn();
    const lines = [makeForm({ items: [makeItem({ canceled_by_id: 99 })] })];
    render(
      <SponsorOrderGrid
        lines={lines}
        total={0}
        onCancelForm={jest.fn()}
        onUndoCancelForm={onUndoCancelForm}
      />
    );
    const button = document.querySelector("tbody button");
    fireEvent.click(button);
    expect(onUndoCancelForm).toHaveBeenCalledTimes(1);
  });

  test("uses amountDue label when amountDue prop is provided", () => {
    render(<SponsorOrderGrid lines={[]} amountDue={5000} />);
    expect(
      screen.getByText("sponsor_order_grid.amount_due")
    ).toBeInTheDocument();
  });

  test("renders meta_field values in item details", () => {
    const item = makeItem({
      meta_fields: [
        {
          id: 1,
          name: "Booth Size",
          class_field: "Form",
          current_value: "Large",
          values: []
        }
      ]
    });
    render(<SponsorOrderGrid lines={[makeForm({ items: [item] })]} total={0} withDescription />);
    expect(screen.getByText(/Booth Size/)).toBeInTheDocument();
  });
});
