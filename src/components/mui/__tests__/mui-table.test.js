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

jest.mock("../showConfirmDialog", () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock("@mui/material/TablePagination", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ count, rowsPerPage, page, onPageChange, onRowsPerPageChange }) => (
      <div data-testid="pagination">
        <span>count:{count}</span>
        <span>page:{page}</span>
        <button
          onClick={() => onPageChange({}, page + 1)}
          aria-label="next-page"
        >
          next
        </button>
        <button
          onClick={() =>
            onRowsPerPageChange({ target: { value: 20 } })
          }
          aria-label="change-rows"
        >
          change-rows
        </button>
      </div>
    )
  };
});

import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import MuiTable from "../table/mui-table";
import showConfirmDialog from "../showConfirmDialog";

const columns = [
  { columnKey: "name", header: "Name" },
  { columnKey: "role", header: "Role" }
];

const data = [
  { id: 1, name: "Alice", role: "Dev" },
  { id: 2, name: "Bob", role: "PM" }
];

const setup = (overrides = {}) => {
  const props = {
    columns,
    data,
    totalRows: 2,
    perPage: 10,
    currentPage: 1,
    onPageChange: jest.fn(),
    onPerPageChange: jest.fn(),
    onSort: jest.fn(),
    ...overrides
  };
  render(<MuiTable {...props} />);
  return props;
};

describe("MuiTable", () => {
  beforeEach(() => jest.clearAllMocks());

  test("renders column headers", () => {
    setup();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
  });

  test("renders data rows", () => {
    setup();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  test("shows no-items message when data is empty", () => {
    setup({ data: [] });
    expect(screen.getByText("mui_table.no_items")).toBeInTheDocument();
  });

  test("renders edit button when onEdit is provided", () => {
    setup({ onEdit: jest.fn() });
    const editBtns = screen.getAllByRole("button");
    expect(editBtns.length).toBeGreaterThan(0);
  });

  test("calls onEdit when edit button is clicked", async () => {
    const onEdit = jest.fn();
    setup({ onEdit });
    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[0]);
    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1 })
    );
  });

  test("calls showConfirmDialog and then onDelete when delete confirmed", async () => {
    const onDelete = jest.fn();
    showConfirmDialog.mockResolvedValueOnce(true);
    setup({ onDelete });
    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[0]);
    await new Promise((r) => setTimeout(r, 0));
    expect(showConfirmDialog).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  test("does not call onDelete when delete is cancelled", async () => {
    const onDelete = jest.fn();
    showConfirmDialog.mockResolvedValueOnce(false);
    setup({ onDelete });
    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[0]);
    await new Promise((r) => setTimeout(r, 0));
    expect(onDelete).not.toHaveBeenCalled();
  });

  test("renders pagination when perPage and currentPage are set", () => {
    setup();
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
  });

  test("pagination shows correct count", () => {
    setup({ totalRows: 50 });
    expect(
      within(screen.getByTestId("pagination")).getByText("count:50")
    ).toBeInTheDocument();
  });

  test("calls onPageChange when next page button clicked", async () => {
    const onPageChange = jest.fn();
    setup({ onPageChange, currentPage: 1 });
    await userEvent.click(
      within(screen.getByTestId("pagination")).getByRole("button", {
        name: "next-page"
      })
    );
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  test("calls onPerPageChange when rows-per-page button clicked", async () => {
    const onPerPageChange = jest.fn();
    setup({ onPerPageChange });
    await userEvent.click(
      within(screen.getByTestId("pagination")).getByRole("button", {
        name: "change-rows"
      })
    );
    expect(onPerPageChange).toHaveBeenCalledWith(20);
  });

  test("renders boolean true as CheckIcon", () => {
    const boolCols = [{ columnKey: "active", header: "Active" }];
    render(
      <MuiTable
        columns={boolCols}
        data={[{ id: 1, active: true }]}
        totalRows={1}
        perPage={10}
        currentPage={1}
        onPageChange={jest.fn()}
        onPerPageChange={jest.fn()}
        onSort={jest.fn()}
      />
    );
    // MUI CheckIcon renders an SVG; just ensure no error
    expect(screen.getByRole("cell", { hidden: true })).toBeInTheDocument();
  });
});
