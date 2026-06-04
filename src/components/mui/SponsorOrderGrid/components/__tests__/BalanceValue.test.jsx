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

jest.mock("../../../../../utils/money", () => ({
  currencyAmountFromCents: (amount) => `$${(amount / 100).toFixed(2)}`
}));

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import BalanceValue from "../BalanceValue";

describe("BalanceValue", () => {
  test("renders a positive balance", () => {
    render(<BalanceValue value={10000} />);
    expect(screen.getByText("$100.00")).toBeInTheDocument();
  });

  test("renders a negative balance with a leading dash", () => {
    render(<BalanceValue value={-5000} />);
    expect(screen.getByText("-$50.00")).toBeInTheDocument();
  });

  test("renders zero balance", () => {
    render(<BalanceValue value={0} />);
    expect(screen.getByText("$0.00")).toBeInTheDocument();
  });
});
