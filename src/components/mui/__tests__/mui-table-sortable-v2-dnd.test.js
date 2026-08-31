/**
 * Integration guard for MuiTableSortableV2 + the REAL @dnd-kit modules.
 * The main spec mocks @dnd-kit/* wholesale, so nothing there exercises what
 * DndContext / useSortable actually render into the DOM.
 */
jest.mock("i18n-react/dist/i18n-react", () => ({
  __esModule: true,
  default: { translate: (key) => key }
}));

jest.mock("../showConfirmDialog", () => ({ __esModule: true, default: jest.fn() }));

import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import MuiTableSortableV2 from "../tables/sortable-table-v2/mui-table-sortable-v2";

const columns = [{ columnKey: "name", header: "Name" }];
const data = [{ id: 1, name: "Row A", order: 1 }];

const renderTable = () =>
  render(
    <MuiTableSortableV2 columns={columns} data={data} onReorder={jest.fn()} />
  );

test("renders only table sections as children of <table>", () => {
  const { container } = renderTable();
  const tags = Array.from(container.querySelector("table").children).map(
    (n) => n.tagName
  );
  expect(tags).toEqual(["THEAD", "TBODY"]);
});

test("puts the drag activator on the handle button, not on the cell", () => {
  const { container } = renderTable();
  const handleCell = container.querySelector("tbody td:last-child");

  expect(handleCell).not.toHaveAttribute("role", "button");
  expect(handleCell.querySelector("button")).toHaveAttribute(
    "aria-roledescription",
    "sortable"
  );
});
