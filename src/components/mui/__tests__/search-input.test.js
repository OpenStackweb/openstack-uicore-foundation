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
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import SearchInput from "../search-input";
import { DEBOUNCE_WAIT } from "../../../utils/constants";

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

  describe("debounced prop", () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    test("calls onSearch after debounce delay when debounced is true", async () => {
      const onSearch = jest.fn();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchInput term="" onSearch={onSearch} debounced />);
      const input = screen.getByPlaceholderText("Search...");
      await user.type(input, "something");
      expect(onSearch).not.toHaveBeenCalled();
      act(() => jest.advanceTimersByTime(DEBOUNCE_WAIT));
      expect(onSearch).toHaveBeenCalledWith("something");
    });

    test("pending debounced call is not lost when parent re-renders with a new onSearch reference", async () => {
      const firstSearch = jest.fn();
      const secondSearch = jest.fn();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const { rerender } = render(<SearchInput term="" onSearch={firstSearch} debounced />);
      const input = screen.getByPlaceholderText("Search...");
      await user.type(input, "hello");
      rerender(<SearchInput term="" onSearch={secondSearch} debounced />);
      act(() => jest.advanceTimersByTime(DEBOUNCE_WAIT));
      expect(firstSearch).not.toHaveBeenCalled();
      expect(secondSearch).toHaveBeenCalledWith("hello");
    });    

    test("does not call onSearch on Enter when debounced is true", async () => {
      const onSearch = jest.fn();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchInput term="" onSearch={onSearch} debounced />);
      const input = screen.getByPlaceholderText("Search...");
      await user.type(input, "something{Enter}");
      expect(onSearch).not.toHaveBeenCalled();
    });

    test("does not call onSearch on typing without Enter when not debounced", async () => {
      const onSearch = jest.fn();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<SearchInput term="" onSearch={onSearch} />);
      const input = screen.getByPlaceholderText("Search...");
      await user.type(input, "something");
      act(() => jest.runAllTimers());
      expect(onSearch).not.toHaveBeenCalled();
    });
  });
});
