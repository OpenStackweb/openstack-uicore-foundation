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
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import SearchInput from "../search-input";

describe("SearchInput", () => {
  test("renders with custom placeholder", () => {
    render(<SearchInput term="" onSearch={jest.fn()} placeholder="Find items..." />);
    expect(screen.getByPlaceholderText("Find items...")).toBeInTheDocument();
  });

  test("renders with default placeholder", () => {
    render(<SearchInput term="" onSearch={jest.fn()} />);
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  test("calls onSearch when Enter is pressed", async () => {
    const onSearch = jest.fn();
    render(<SearchInput term="" onSearch={onSearch} />);
    const input = screen.getByPlaceholderText("Search...");
    await userEvent.type(input, "hello{Enter}");
    expect(onSearch).toHaveBeenCalledWith("hello");
  });

  test("shows clear button when term is provided", () => {
    render(<SearchInput term="something" onSearch={jest.fn()} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  test("calls onSearch with empty string when clear button is clicked", async () => {
    const onSearch = jest.fn();
    render(<SearchInput term="something" onSearch={onSearch} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onSearch).toHaveBeenCalledWith("");
  });

  test("initializes with provided term value", () => {
    render(<SearchInput term="initial" onSearch={jest.fn()} />);
    expect(screen.getByDisplayValue("initial")).toBeInTheDocument();
  });

  test("syncs input when term prop changes", () => {
    const { rerender } = render(<SearchInput term="old" onSearch={jest.fn()} />);
    rerender(<SearchInput term="new" onSearch={jest.fn()} />);
    expect(screen.getByDisplayValue("new")).toBeInTheDocument();
  });
});
