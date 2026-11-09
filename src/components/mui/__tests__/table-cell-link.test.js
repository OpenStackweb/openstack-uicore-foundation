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

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import TableCellLink from "../tables/components/table-cell-link";

// hash URLs: jsdom can't follow real page navigations
const setup = (overrides = {}) => {
  const props = { href: "#/people/1", onNavigate: jest.fn(), ...overrides };
  render(
    <div>
      <TableCellLink {...props}>Alice</TableCellLink>
      <span>Dev</span>
    </div>
  );
  return props;
};

const selectText = (text, anchorNode) =>
  jest.spyOn(window, "getSelection").mockReturnValue({ toString: () => text, anchorNode });

describe("TableCellLink", () => {
  afterEach(() => jest.restoreAllMocks());

  test("renders a link to href", () => {
    setup();
    expect(screen.getByRole("link", { name: "Alice" })).toHaveAttribute("href", "#/people/1");
  });

  test("a plain click calls onNavigate with the href", async () => {
    const { onNavigate } = setup();
    await userEvent.click(screen.getByRole("link", { name: "Alice" }));
    expect(onNavigate).toHaveBeenCalledWith("#/people/1");
  });

  test("ctrl-click leaves the browser default so the link opens in a new tab", () => {
    const { onNavigate } = setup();
    const notCancelled = fireEvent.click(screen.getByRole("link", { name: "Alice" }), {
      ctrlKey: true
    });
    expect(notCancelled).toBe(true);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  test("a click that ends a text selection doesn't navigate", () => {
    const { onNavigate } = setup();
    const link = screen.getByRole("link", { name: "Alice" });
    selectText("Ali", link);
    const notCancelled = fireEvent.click(link, { detail: 1 });
    expect(notCancelled).toBe(false);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  test("ctrl-click with text selected in the link keeps the browser default", () => {
    const { onNavigate } = setup();
    const link = screen.getByRole("link", { name: "Alice" });
    selectText("Ali", link);
    const notCancelled = fireEvent.click(link, { ctrlKey: true, detail: 1 });
    expect(notCancelled).toBe(true);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  test("keyboard activation with text selected in the link still navigates", () => {
    const { onNavigate } = setup();
    const link = screen.getByRole("link", { name: "Alice" });
    selectText("Ali", link);
    // Enter on a link fires a click with detail 0
    fireEvent.click(link, { detail: 0 });
    expect(onNavigate).toHaveBeenCalledWith("#/people/1");
  });

  test("a selection elsewhere on the page doesn't block navigation", () => {
    const { onNavigate } = setup();
    selectText("Dev", screen.getByText("Dev"));
    fireEvent.click(screen.getByRole("link", { name: "Alice" }), { detail: 1 });
    expect(onNavigate).toHaveBeenCalledWith("#/people/1");
  });

  test("renders plain text when disabled", () => {
    setup({ disabled: true });
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });
});
