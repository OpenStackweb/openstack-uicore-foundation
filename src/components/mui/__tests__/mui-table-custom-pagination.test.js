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
    showPageJump: true,
    ...overrides
  };
  render(<CustomTablePagination {...props} />);
  return props;
};

describe("CustomTablePagination showPageJump", () => {
  test("does not render the go-to-page toggle when showPageJump is not set", () => {
    setup({ showPageJump: false });
    expect(
      screen.queryByRole("button", { name: "mui_table.go_to_page" })
    ).not.toBeInTheDocument();
  });

  test("jumping to a page pre-fills the current page and calls onPageChange with the new page", async () => {
    const { onPageChange } = setup();

    await userEvent.click(screen.getByRole("button", { name: "mui_table.go_to_page" }));

    const input = screen.getByRole("textbox", { name: "mui_table.go_to_page" });
    expect(input).toHaveValue("3");
    expect(
      screen.queryByRole("button", { name: "mui_table.previous_page" })
    ).not.toBeInTheDocument();

    await userEvent.clear(input);
    await userEvent.type(input, "7");
    await userEvent.click(screen.getByRole("button", { name: "general.confirm" }));

    expect(onPageChange).toHaveBeenCalledWith(7);
    expect(
      screen.getByRole("button", { name: "mui_table.previous_page" })
    ).toBeInTheDocument();
  });

  test("cancelling the input restores the arrows without calling onPageChange", async () => {
    const { onPageChange } = setup();

    await userEvent.click(screen.getByRole("button", { name: "mui_table.go_to_page" }));
    await userEvent.click(screen.getByRole("button", { name: "general.cancel" }));

    expect(onPageChange).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "mui_table.go_to_page" })
    ).toBeInTheDocument();
  });
});
