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
import CheckBoxList from "../checkbox-list";

describe("CheckBoxList", () => {
  const items = [
    { id: 1, name: "Item A" },
    { id: 2, name: "Item B" },
    { id: 3, name: "Item C" }
  ];

  test("renders no-items label when items array is empty", () => {
    render(<CheckBoxList items={[]} onChange={jest.fn()} />);
    expect(screen.getByText("No items found")).toBeInTheDocument();
  });

  test("renders all items", () => {
    render(<CheckBoxList items={items} onChange={jest.fn()} />);
    expect(screen.getByText("Item A")).toBeInTheDocument();
    expect(screen.getByText("Item B")).toBeInTheDocument();
    expect(screen.getByText("Item C")).toBeInTheDocument();
  });

  test("renders select-all checkbox with default label", () => {
    render(<CheckBoxList items={items} onChange={jest.fn()} />);
    expect(screen.getByText("Select All")).toBeInTheDocument();
  });

  test("renders custom allItemsLabel", () => {
    render(
      <CheckBoxList items={items} onChange={jest.fn()} allItemsLabel="Check All" />
    );
    expect(screen.getByText("Check All")).toBeInTheDocument();
  });

  test("renders custom noItemsLabel", () => {
    render(
      <CheckBoxList items={[]} onChange={jest.fn()} noItemsLabel="Nothing here" />
    );
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  test("selecting an individual item calls onChange with that item id", async () => {
    const onChange = jest.fn();
    render(<CheckBoxList items={items} onChange={onChange} />);
    const checkboxes = screen.getAllByRole("checkbox");
    // Index 0 is "Select All", index 1 is first item
    await userEvent.click(checkboxes[1]);
    expect(onChange).toHaveBeenCalledWith([1]);
  });

  test("clicking select-all calls onChange with empty array and true", async () => {
    const onChange = jest.fn();
    render(<CheckBoxList items={items} onChange={onChange} />);
    const selectAllCheckbox = screen.getAllByRole("checkbox")[0];
    await userEvent.click(selectAllCheckbox);
    expect(onChange).toHaveBeenCalledWith([], true);
  });

  test("deselecting an item after select-all removes it from selection", async () => {
    const onChange = jest.fn();
    render(<CheckBoxList items={items} onChange={onChange} />);
    const checkboxes = screen.getAllByRole("checkbox");
    // Select all first
    await userEvent.click(checkboxes[0]);
    onChange.mockClear();
    // Now uncheck one item (isAllSelected is true, so it filters that id out)
    await userEvent.click(checkboxes[1]);
    expect(onChange).toHaveBeenCalledWith([2, 3]);
  });
});
