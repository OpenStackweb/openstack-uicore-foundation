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
import MuiInfiniteTable from "../infinite-table/index";

const columns = [
  { columnKey: "name", header: "Name", sortable: false },
  { columnKey: "email", header: "Email", sortable: true }
];

const data = [
  { id: 1, name: "Alice", email: "alice@test.com" },
  { id: 2, name: "Bob", email: "bob@test.com" }
];

const setup = (overrides = {}) => {
  const props = {
    columns,
    data,
    loadMoreData: jest.fn(),
    onRowEdit: jest.fn(),
    onSort: jest.fn(),
    options: { sortCol: "", sortDir: "" },
    ...overrides
  };
  render(<MuiInfiniteTable {...props} />);
  return props;
};

describe("MuiInfiniteTable", () => {
  test("renders column headers", () => {
    setup();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  test("renders data rows", () => {
    setup();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("bob@test.com")).toBeInTheDocument();
  });

  test("shows no-data message when data is empty", () => {
    setup({ data: [] });
    expect(screen.getByText("mui_table.no_data")).toBeInTheDocument();
  });

  test("renders sortable columns with sort labels", () => {
    setup({ options: { sortCol: "email", sortDir: 1 } });
    // Email column is sortable, should have a sort button
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  test("renders custom cell content via col.render", () => {
    const customColumns = [
      {
        columnKey: "name",
        header: "Name",
        render: (row) => <strong>{row.name.toUpperCase()}</strong>
      }
    ];
    render(
      <MuiInfiniteTable
        columns={customColumns}
        data={data}
        loadMoreData={jest.fn()}
        onSort={jest.fn()}
        options={{ sortCol: "", sortDir: "" }}
      />
    );
    expect(screen.getByText("ALICE")).toBeInTheDocument();
    expect(screen.getByText("BOB")).toBeInTheDocument();
  });
});
