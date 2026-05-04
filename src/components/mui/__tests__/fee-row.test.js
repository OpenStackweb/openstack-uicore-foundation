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
import FeeRow from "../table/extra-rows/FeeRow";

const renderInTable = (props) =>
  render(
    <table>
      <tbody>
        <FeeRow {...props} />
      </tbody>
    </table>
  );

describe("FeeRow", () => {
  test("renders nothing when fee is not provided", () => {
    const { container } = renderInTable({});
    expect(container.querySelector("tr")).not.toBeInTheDocument();
  });

  test("renders the fee title", () => {
    renderInTable({ fee: { title: "Processing Fee", amount: 150 } });
    expect(screen.getByText("Processing Fee")).toBeInTheDocument();
  });

  test("renders the formatted fee amount", () => {
    renderInTable({ fee: { title: "Service Fee", amount: 500 } });
    expect(screen.getByText("$5.00")).toBeInTheDocument();
  });

  test("renders the i18n label key", () => {
    renderInTable({ fee: { title: "Fee", amount: 0 } });
    expect(screen.getByText("mui_table.payfee")).toBeInTheDocument();
  });

  test("renders a single table row", () => {
    const { container } = renderInTable({ fee: { title: "Fee", amount: 100 } });
    expect(container.querySelectorAll("tr")).toHaveLength(1);
  });
});
