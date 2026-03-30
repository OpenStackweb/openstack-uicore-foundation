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

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TotalRow from "../table/extra-rows/TotalRow";

const columns = [
  { columnKey: "name", header: "Name" },
  { columnKey: "quantity", header: "Qty" },
  { columnKey: "price", header: "Price" }
];

const renderInTable = (props) =>
  render(
    <table>
      <tbody>
        <TotalRow columns={columns} {...props} />
      </tbody>
    </table>
  );

describe("TotalRow", () => {
  test("renders 'TOTAL' label key in first column", () => {
    renderInTable({ targetCol: "quantity", total: 42 });
    expect(screen.getByText("mui_table.total")).toBeInTheDocument();
  });

  test("renders total value in the targetCol", () => {
    renderInTable({ targetCol: "quantity", total: 42 });
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  test("renders correct number of cells (one per column)", () => {
    const { container } = renderInTable({ targetCol: "quantity", total: 10 });
    expect(container.querySelectorAll("td")).toHaveLength(columns.length);
  });

  test("renders extra trailing cells when trailing prop is provided", () => {
    const { container } = renderInTable({
      targetCol: "quantity",
      total: 10,
      trailing: 2
    });
    expect(container.querySelectorAll("td")).toHaveLength(columns.length + 2);
  });

  test("renders string totals", () => {
    renderInTable({ targetCol: "price", total: "$1,234" });
    expect(screen.getByText("$1,234")).toBeInTheDocument();
  });
});
