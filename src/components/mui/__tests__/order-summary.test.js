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
import OrderSummary from "../OrderSummary/index";

const defaultProps = {
  amount: 5000,
  dueDate: "2026-05-01",
  toName: "Alice",
  fromName: "Bob"
};

describe("OrderSummary", () => {
  test("renders the formatted amount", () => {
    render(<OrderSummary {...defaultProps} />);
    expect(screen.getByText("$50.00")).toBeInTheDocument();
  });

  test("renders toName", () => {
    render(<OrderSummary {...defaultProps} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  test("renders fromName", () => {
    render(<OrderSummary {...defaultProps} />);
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  test("renders dueDate", () => {
    render(<OrderSummary {...defaultProps} />);
    expect(screen.getByText(/2026-05-01/)).toBeInTheDocument();
  });

  test("renders a skeleton when amount is falsy", () => {
    render(<OrderSummary {...defaultProps} amount={0} />);
    // amount=0 is falsy — component renders a Skeleton placeholder
    expect(document.querySelector(".MuiSkeleton-root")).toBeInTheDocument();
  });
});
