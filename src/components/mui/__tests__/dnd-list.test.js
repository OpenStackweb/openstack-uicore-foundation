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

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import DragAndDropList from "../dnd-list";

describe("DragAndDropList", () => {
  const items = [
    { id: 1, order: 1, name: "Item 1" },
    { id: 2, order: 2, name: "Item 2" },
    { id: 3, order: 3, name: "Item 3" }
  ];

  test("renders all items via renderItem", () => {
    render(
      <DragAndDropList
        items={items}
        onReorder={jest.fn()}
        renderItem={(item) => <div>{item.name}</div>}
        droppableId="test-list"
      />
    );
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
  });

  test("renders empty list without errors", () => {
    const { container } = render(
      <DragAndDropList
        items={[]}
        onReorder={jest.fn()}
        renderItem={(item) => <div>{item.name}</div>}
        droppableId="test-list"
      />
    );
    expect(container).toBeInTheDocument();
  });

  test("calls renderItem with item, index, provided, snapshot", () => {
    const renderItem = jest.fn((item) => <div key={item.id}>{item.name}</div>);
    render(
      <DragAndDropList
        items={items}
        onReorder={jest.fn()}
        renderItem={renderItem}
        droppableId="test-list"
      />
    );
    expect(renderItem).toHaveBeenCalledTimes(3);
    expect(renderItem).toHaveBeenCalledWith(
      items[0],
      0,
      expect.any(Object),
      expect.any(Object)
    );
  });
});
