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
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import CustomTablePagination from "../tables/components/CustomTablePagination";

const setup = (overrides = {}) => {
  const props = {
    totalRows: 100,
    perPage: 10,
    currentPage: 3,
    onPageChange: jest.fn(),
    onPerPageChange: jest.fn(),
    ...overrides
  };
  render(<CustomTablePagination {...props} />);
  return props;
};

describe("CustomTablePagination", () => {
  test("shows the page label and no rows-per-page select without onPerPageChange", () => {
    setup({ onPerPageChange: undefined });
    expect(screen.getByText("mui_table.page_of")).toBeInTheDocument();
    expect(screen.queryByLabelText("mui_table.rows_per_page")).not.toBeInTheDocument();
  });

  test("shows the rows-per-page select when onPerPageChange is provided and calls it", async () => {
    const { onPerPageChange } = setup();
    await userEvent.click(screen.getByLabelText("mui_table.rows_per_page"));
    await userEvent.click(screen.getByRole("option", { name: "20" }));
    expect(onPerPageChange).toHaveBeenCalledWith(20);
  });

  test("prev/next buttons call onPageChange and disable at the boundaries", async () => {
    const onPageChange = jest.fn();
    setup({ onPageChange, currentPage: 1, totalRows: 20, perPage: 10 });

    expect(screen.getByRole("button", { name: "mui_table.previous_page" })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "mui_table.next_page" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  test("disables the next button on the last page", () => {
    setup({ currentPage: 10, totalRows: 100, perPage: 10 });
    expect(screen.getByRole("button", { name: "mui_table.next_page" })).toBeDisabled();
  });

  test("clicking the pill reveals a slider bounded to the page count", async () => {
    setup({ currentPage: 3, totalRows: 100, perPage: 10 });
    await userEvent.click(screen.getByText("mui_table.page_of"));

    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuemin", "1");
    expect(slider).toHaveAttribute("aria-valuemax", "10");
    expect(slider).toHaveAttribute("aria-valuenow", "3");
  });

  test("moving the slider commits the new page via onPageChange", async () => {
    const onPageChange = jest.fn();
    setup({ onPageChange, currentPage: 3, totalRows: 100, perPage: 10 });
    await userEvent.click(screen.getByText("mui_table.page_of"));

    const slider = screen.getByRole("slider");
    fireEvent.keyDown(slider, { key: "ArrowRight" });

    expect(onPageChange).toHaveBeenCalledWith(4);
  });
});
