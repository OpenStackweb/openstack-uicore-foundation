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
import "@testing-library/jest-dom";
import DragAndDropList from "../dnd-list";

// Unlike dnd-list.test.js, this runs the real drag-and-drop library, so it
// fails if the library can't render on the installed React version.
describe("DragAndDropList with the real drag-and-drop library", () => {
  const items = [
    { id: 1, order: 1, name: "Item 1" },
    { id: 2, order: 2, name: "Item 2" }
  ];

  test("renders the items as draggables with drag handles", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    render(
      <DragAndDropList
        items={items}
        onReorder={jest.fn()}
        renderItem={(item) => <span>{item.name}</span>}
      />
    );

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    const handles = document.querySelectorAll("[data-rfd-drag-handle-draggable-id]");
    expect(handles).toHaveLength(2);
    expect(handles[0]).toHaveAttribute("data-rfd-drag-handle-draggable-id", "1");
    expect(consoleError).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
