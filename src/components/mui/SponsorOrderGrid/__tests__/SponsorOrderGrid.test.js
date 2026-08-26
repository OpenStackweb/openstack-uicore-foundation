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
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import T from "i18n-react/dist/i18n-react";
import SponsorOrderGrid from "../index";

const makeItem = (overrides = {}) => ({
  line_id: 841,
  quantity: 1,
  canceled_quantity: 0,
  amount: 10000,
  cancellations: [],
  type: { id: 146, name: "Booth", code: "BOOTH" },
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

  test("clicking the action icon opens the change-quantity modal instead of calling callbacks directly", () => {
    const onCancelForm = jest.fn();
    const onUndoCancelForm = jest.fn();
    render(
      <SponsorOrderGrid
        {...defaultProps}
        onCancelForm={onCancelForm}
        onUndoCancelForm={onUndoCancelForm}
      />
    );
    const button = document.querySelector("tbody button");
    fireEvent.click(button);
    expect(
      screen.getByText("sponsor_order_grid.change_quantity_modal.title")
    ).toBeInTheDocument();
    expect(onCancelForm).not.toHaveBeenCalled();
    expect(onUndoCancelForm).not.toHaveBeenCalled();
  });

  test("reset is disabled in the modal when nothing has been cancelled yet", () => {
    render(
      <SponsorOrderGrid
        {...defaultProps}
        onCancelForm={jest.fn()}
        onUndoCancelForm={jest.fn()}
      />
    );
    const button = document.querySelector("tbody button");
    fireEvent.click(button);
    expect(
      screen.getByRole("button", {
        name: "sponsor_order_grid.change_quantity_modal.reset"
      })
    ).toBeDisabled();
  });

  test("lowering the quantity and applying calls onCancelForm with the delta, item and reason, then closes the dialog", async () => {
    const onCancelForm = jest.fn(() => Promise.resolve());
    const order = {
      forms: [makeForm({ items: [makeItem({ line_id: 841, quantity: 5, canceled_quantity: 0 })] })],
      total: 0
    };
    render(
      <SponsorOrderGrid
        order={order}
        onCancelForm={onCancelForm}
        onUndoCancelForm={jest.fn(() => Promise.resolve())}
      />
    );
    const button = document.querySelector("tbody button");
    fireEvent.click(button);

    const quantityField = screen.getByLabelText(
      "sponsor_order_grid.change_quantity_modal.quantity"
    );
    fireEvent.change(quantityField, { target: { value: "2" } });
    const reasonField = screen.getByLabelText(
      "sponsor_order_grid.change_quantity_modal.reason"
    );
    fireEvent.change(reasonField, { target: { value: "Damaged" } });

    fireEvent.click(screen.getByRole("button", { name: "general.apply" }));

    await waitFor(() =>
      expect(onCancelForm).toHaveBeenCalledWith(
        expect.objectContaining({ id: 841 }),
        3,
        "Damaged"
      )
    );
    await waitFor(() =>
      expect(
        screen.queryByText("sponsor_order_grid.change_quantity_modal.title")
      ).not.toBeInTheDocument()
    );
  });

  test("dialog stays open and the typed reason is preserved when onCancelForm rejects", async () => {
    const onCancelForm = jest.fn(() => Promise.reject(new Error("Cannot cancel 3 units; only 2 remain")));
    const order = {
      forms: [makeForm({ items: [makeItem({ line_id: 841, quantity: 5, canceled_quantity: 0 })] })],
      total: 0
    };
    render(
      <SponsorOrderGrid
        order={order}
        onCancelForm={onCancelForm}
        onUndoCancelForm={jest.fn(() => Promise.resolve())}
      />
    );
    const button = document.querySelector("tbody button");
    fireEvent.click(button);

    const quantityField = screen.getByLabelText(
      "sponsor_order_grid.change_quantity_modal.quantity"
    );
    fireEvent.change(quantityField, { target: { value: "2" } });
    const reasonField = screen.getByLabelText(
      "sponsor_order_grid.change_quantity_modal.reason"
    );
    fireEvent.change(reasonField, { target: { value: "Damaged" } });

    fireEvent.click(screen.getByRole("button", { name: "general.apply" }));

    await waitFor(() => expect(onCancelForm).toHaveBeenCalled());
    expect(
      screen.getByText("sponsor_order_grid.change_quantity_modal.title")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("sponsor_order_grid.change_quantity_modal.reason")).toHaveValue(
      "Damaged"
    );
  });

  test("clicking reset then applying calls onUndoCancelForm with the item, then closes the dialog", async () => {
    const onUndoCancelForm = jest.fn(() => Promise.resolve());
    const order = {
      forms: [
        makeForm({
          items: [makeItem({ line_id: 841, quantity: 5, canceled_quantity: 2 })]
        })
      ],
      total: 0
    };
    render(
      <SponsorOrderGrid
        order={order}
        onCancelForm={jest.fn(() => Promise.resolve())}
        onUndoCancelForm={onUndoCancelForm}
      />
    );
    const button = document.querySelector("tbody button");
    fireEvent.click(button);

    fireEvent.click(
      screen.getByRole("button", {
        name: "sponsor_order_grid.change_quantity_modal.reset"
      })
    );
    fireEvent.click(screen.getByRole("button", { name: "general.apply" }));

    await waitFor(() =>
      expect(onUndoCancelForm).toHaveBeenCalledWith(
        expect.objectContaining({ id: 841 })
      )
    );
    await waitFor(() =>
      expect(
        screen.queryByText("sponsor_order_grid.change_quantity_modal.title")
      ).not.toBeInTheDocument()
    );
  });

  test("clicking reset disables the reason field, typing a lower quantity re-enables it", () => {
    const order = {
      forms: [
        makeForm({
          items: [makeItem({ line_id: 841, quantity: 5, canceled_quantity: 2 })]
        })
      ],
      total: 0
    };
    render(
      <SponsorOrderGrid
        order={order}
        onCancelForm={jest.fn()}
        onUndoCancelForm={jest.fn()}
      />
    );
    const button = document.querySelector("tbody button");
    fireEvent.click(button);

    const reasonField = screen.getByLabelText(
      "sponsor_order_grid.change_quantity_modal.reason"
    );
    expect(reasonField).toBeEnabled();

    fireEvent.click(
      screen.getByRole("button", {
        name: "sponsor_order_grid.change_quantity_modal.reset"
      })
    );
    expect(reasonField).toBeDisabled();

    const quantityField = screen.getByLabelText(
      "sponsor_order_grid.change_quantity_modal.quantity"
    );
    fireEvent.change(quantityField, { target: { value: "1" } });
    expect(reasonField).toBeEnabled();
  });

  test("a fully cancelled line keeps the quantity field disabled, so it cannot be typed back to a non-zero value that would trigger a silent restore", async () => {
    const user = userEvent.setup();
    const onUndoCancelForm = jest.fn();
    const order = {
      forms: [
        makeForm({
          items: [makeItem({ line_id: 841, quantity: 5, canceled_quantity: 5 })]
        })
      ],
      total: 0
    };
    render(
      <SponsorOrderGrid
        order={order}
        onCancelForm={jest.fn()}
        onUndoCancelForm={onUndoCancelForm}
      />
    );
    const button = document.querySelector("tbody button");
    fireEvent.click(button);

    const quantityField = screen.getByLabelText(
      "sponsor_order_grid.change_quantity_modal.quantity"
    );
    await user.type(quantityField, "4");

    const applyButton = screen.getByRole("button", { name: "general.apply" });
    await act(async () => {
      fireEvent.click(applyButton);
      // flush the formik async submit pipeline so a call would have landed by now
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(onUndoCancelForm).not.toHaveBeenCalled();
  });

  test("does not strikethrough or show Cancelled type when only partially cancelled", () => {
    const order = {
      forms: [makeForm({ items: [makeItem({ quantity: 5, canceled_quantity: 2 })] })],
      total: 0
    };
    render(<SponsorOrderGrid order={order} />);
    expect(screen.queryByText("Cancelled")).not.toBeInTheDocument();
    expect(screen.getByText(/Booth/).closest("p")).not.toHaveStyle({
      textDecoration: "line-through"
    });
  });

  test("strikes through and shows Cancelled type only when fully cancelled", () => {
    const order = {
      forms: [makeForm({ items: [makeItem({ quantity: 5, canceled_quantity: 5 })] })],
      total: 0
    };
    render(<SponsorOrderGrid order={order} />);
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
    expect(screen.getByText(/Booth/).closest("p")).toHaveStyle({
      textDecoration: "line-through"
    });
  });

  test("renders a list of all cancellations with date, author and reason", () => {
    const order = {
      forms: [
        makeForm({
          items: [
            makeItem({
              quantity: 5,
              canceled_quantity: 3,
              cancellations: [
                {
                  id: 1,
                  quantity: 2,
                  amount: 200,
                  reason: "Too many",
                  canceled_by_id: 5,
                  canceled_by_email: "a@test.com",
                  canceled_by_full_name: "Alice Admin",
                  created: 1000
                },
                {
                  id: 2,
                  quantity: 1,
                  amount: 100,
                  reason: "",
                  canceled_by_id: 6,
                  canceled_by_email: "b@test.com",
                  canceled_by_full_name: "Bob Admin",
                  created: 2000
                }
              ]
            })
          ]
        })
      ],
      total: 0
    };
    const translateSpy = jest.spyOn(T, "translate");
    render(<SponsorOrderGrid order={order} />);

    expect(translateSpy).toHaveBeenCalledWith(
      "sponsor_order_grid.cancelled_by",
      expect.objectContaining({ x: 2, y: 5, user: "Alice Admin", date: "2026-01-01" })
    );
    expect(translateSpy).toHaveBeenCalledWith(
      "sponsor_order_grid.cancelled_by",
      expect.objectContaining({ x: 1, y: 5, user: "Bob Admin", date: "2026-01-01" })
    );
    expect(screen.getByText(/Too many/)).toBeInTheDocument();
  });

  test("gives rows from different forms with the same item type distinct ids", () => {
    const order = {
      forms: [
        makeForm({ id: 10, items: [makeItem({ line_id: 841, type: { id: 146, name: "Booth", code: "BOOTH" } })] }),
        makeForm({ id: 11, items: [makeItem({ line_id: 900, type: { id: 146, name: "Booth", code: "BOOTH" } })] })
      ],
      total: 0
    };
    render(<SponsorOrderGrid order={order} />);
    expect(document.getElementById("item-841")).toBeInTheDocument();
    expect(document.getElementById("item-900")).toBeInTheDocument();
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
