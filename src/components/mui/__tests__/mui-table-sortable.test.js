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

jest.mock("react-beautiful-dnd", () => {
  const React = require("react");
  return {
    DragDropContext: ({ children }) => <>{children}</>,
    Droppable: ({ children }) =>
      children(
        { innerRef: jest.fn(), droppableProps: {}, placeholder: null },
        {}
      ),
    Draggable: ({ children }) =>
      children(
        { innerRef: jest.fn(), draggableProps: {}, dragHandleProps: {} },
        { isDragging: false }
      )
  };
});

jest.mock("@mui/material/TablePagination", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ count, page, onPageChange, onRowsPerPageChange, rowsPerPageOptions }) => (
      <div data-testid="pagination">
        <span>count:{count}</span>
        <button
          onClick={() => onPageChange({}, page + 1)}
          aria-label="next-page"
        >
          next
        </button>
        <button
          onClick={() =>
            onRowsPerPageChange({
              target: { value: rowsPerPageOptions?.[0] ?? 10 }
            })
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
import MuiTableSortable from "../sortable-table/mui-table-sortable";
import showConfirmDialog from "../showConfirmDialog";

const columns = [
  { columnKey: "name", header: "Name", sortable: true },
  { columnKey: "role", header: "Role", sortable: false }
];

const data = [
  { id: 1, name: "Alice", role: "Dev", order: 1 },
  { id: 2, name: "Bob", role: "PM", order: 2 }
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
    options: { sortCol: "name", sortDir: 1 },
    ...overrides
  };
  render(<MuiTableSortable {...props} />);
  return props;
};

describe("MuiTableSortable", () => {
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
    const onEdit = jest.fn();
    setup({ onEdit });
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
  });

  test("calls onEdit when edit button is clicked", async () => {
    const onEdit = jest.fn();
    setup({ onEdit });
    const buttons = screen.getAllByRole("button");
    // buttons[0] is the sort label button for the sortable "Name" column;
    // buttons[1] is the first edit button (row 1)
    await userEvent.click(buttons[1]);
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  test("calls showConfirmDialog and onDelete when delete is confirmed", async () => {
    const onDelete = jest.fn();
    showConfirmDialog.mockResolvedValueOnce(true);
    setup({ onDelete });
    const buttons = screen.getAllByRole("button");
    // buttons[0] is the sort label button; buttons[1] is the first delete button (row 1)
    await userEvent.click(buttons[1]);
    await new Promise((r) => setTimeout(r, 0));
    expect(showConfirmDialog).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  test("renders pagination", () => {
    setup();
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
  });

  test("calls onPageChange when next page is clicked", async () => {
    const onPageChange = jest.fn();
    setup({ onPageChange, currentPage: 1 });
    await userEvent.click(
      within(screen.getByTestId("pagination")).getByRole("button", {
        name: "next-page"
      })
    );
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
