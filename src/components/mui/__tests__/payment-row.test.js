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

jest.mock("../../../utils/money", () => ({
  currencyAmountFromCents: (amount) => `$${(amount / 100).toFixed(2)}`
}));

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import PaymentRow from "../table/extra-rows/PaymentRow";

// 2026-01-15 00:00:00 UTC in seconds
const PAYMENT_TIMESTAMP = 1736899200;

const renderInTable = (props) =>
  render(
    <table>
      <tbody>
        <PaymentRow {...props} />
      </tbody>
    </table>
  );

describe("PaymentRow", () => {
  test("renders nothing when payment is not provided", () => {
    const { container } = renderInTable({});
    expect(container.querySelector("tr")).not.toBeInTheDocument();
  });

  test("renders the formatted payment amount", () => {
    renderInTable({ payment: { method: "Visa", amount: 2000, created: PAYMENT_TIMESTAMP } });
    expect(screen.getByText("-$20.00")).toBeInTheDocument();
  });

  test("renders the payment method", () => {
    renderInTable({ payment: { method: "Visa", amount: 1000, created: PAYMENT_TIMESTAMP } });
    expect(screen.getByText(/Visa/)).toBeInTheDocument();
  });

  test("renders the i18n label keys", () => {
    renderInTable({ payment: { method: "Card", amount: 500, created: PAYMENT_TIMESTAMP } });
    expect(screen.getByText("mui_table.pay")).toBeInTheDocument();
    expect(screen.getByText("mui_table.payment")).toBeInTheDocument();
  });

  test("renders a single table row", () => {
    const { container } = renderInTable({
      payment: { method: "Card", amount: 100, created: PAYMENT_TIMESTAMP }
    });
    expect(container.querySelectorAll("tr")).toHaveLength(1);
  });
});
