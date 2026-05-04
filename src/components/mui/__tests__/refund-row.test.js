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
import RefundRow from "../table/extra-rows/RefundRow";

const renderInTable = (props) =>
  render(
    <table>
      <tbody>
        <RefundRow {...props} />
      </tbody>
    </table>
  );

describe("RefundRow", () => {
  test("renders nothing when refund is not provided", () => {
    const { container } = renderInTable({});
    expect(container.querySelector("tr")).not.toBeInTheDocument();
  });

  test("renders the formatted refund amount", () => {
    renderInTable({ refund: { reason: "Duplicate", status: "completed", amount: 3000 } });
    expect(screen.getByText("-$30.00")).toBeInTheDocument();
  });

  test("renders the refund reason", () => {
    renderInTable({ refund: { reason: "Customer request", status: "pending", amount: 1000 } });
    expect(screen.getByText("Customer request")).toBeInTheDocument();
  });

  test("renders the refund status", () => {
    renderInTable({ refund: { reason: "Error", status: "approved", amount: 500 } });
    expect(screen.getByText("approved")).toBeInTheDocument();
  });

  test("renders the i18n label keys", () => {
    renderInTable({ refund: { reason: "Test", status: "pending", amount: 100 } });
    expect(screen.getByText("mui_table.ref")).toBeInTheDocument();
    expect(screen.getByText("mui_table.refund")).toBeInTheDocument();
  });

  test("renders a single table row", () => {
    const { container } = renderInTable({
      refund: { reason: "Test", status: "pending", amount: 100 }
    });
    expect(container.querySelectorAll("tr")).toHaveLength(1);
  });
});
