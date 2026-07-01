import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import DragAndDropList from "../drag-n-drop-list";

// Capture the onDragEnd handler so tests can simulate drags
let triggerDragEnd;

jest.mock("@dnd-kit/core", () => ({
  DndContext: ({ children, onDragEnd }) => {
    triggerDragEnd = onDragEnd;
    return <>{children}</>;
  },
  closestCenter: jest.fn(),
  KeyboardSensor: function KeyboardSensor() { },
  PointerSensor: function PointerSensor() { },
  useSensor: jest.fn(() => ({})),
  useSensors: jest.fn(() => [])
}));

jest.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }) => <>{children}</>,
  sortableKeyboardCoordinates: jest.fn(),
  useSortable: () => ({
    attributes: { "data-dnd-handle": true },
    listeners: { onPointerDown: jest.fn() },
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false
  }),
  verticalListSortingStrategy: jest.fn(),
  arrayMove: (arr, from, to) => {
    const result = [...arr];
    const [item] = result.splice(from, 1);
    result.splice(to, 0, item);
    return result;
  }
}));

jest.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: () => "" } }
}));

const mockItems = [
  { id: 1, label: "First", order: 1 },
  { id: 2, label: "Second", order: 2 },
  { id: 3, label: "Third", order: 3 }
];

const renderItem = jest.fn((item, index, { isDragging, dragHandleProps }) => (
  <div
    key={index}
    data-testid={`item-${index}`}
    data-dragging={String(isDragging)}
    {...dragHandleProps}
  >
    {item.label}
  </div>
));

const renderList = (props = {}) =>
  render(
    <DragAndDropList
      items={mockItems}
      onReorder={jest.fn()}
      renderItem={renderItem}
      {...props}
    />
  );

describe("DragAndDropList", () => {
  beforeEach(() => {
    renderItem.mockClear();
  });

  describe("rendering", () => {
    it("renders all items via renderItem", () => {
      renderList();
      expect(screen.getByTestId("item-0")).toHaveTextContent("First");
      expect(screen.getByTestId("item-1")).toHaveTextContent("Second");
      expect(screen.getByTestId("item-2")).toHaveTextContent("Third");
    });

    it("passes isDragging and dragHandleProps to renderItem", () => {
      renderList();
      const [, , { isDragging, dragHandleProps }] = renderItem.mock.calls[0];
      expect(isDragging).toBe(false);
      expect(dragHandleProps).toHaveProperty("data-dnd-handle", true);
      expect(dragHandleProps).toHaveProperty("onPointerDown");
    });
  });

  describe("drag and drop", () => {
    it("calls onReorder with correctly reordered items and updated order keys", () => {
      const onReorder = jest.fn();
      renderList({ onReorder });

      // Drag item "1" (index 0) to position of item "3" (index 2)
      triggerDragEnd({ active: { id: "1" }, over: { id: "3" } });

      expect(onReorder).toHaveBeenCalledWith(
        [
          { id: 2, label: "Second", order: 1 },
          { id: 3, label: "Third", order: 2 },
          { id: 1, label: "First", order: 3 }
        ],
        expect.objectContaining({ active: { id: "1" }, over: { id: "3" } })
      );
    });

    it("does not call onReorder when there is no drop target", () => {
      const onReorder = jest.fn();
      renderList({ onReorder });

      triggerDragEnd({ active: { id: "1" }, over: null });

      expect(onReorder).not.toHaveBeenCalled();
    });

    it("does not call onReorder when dropped on the same item", () => {
      const onReorder = jest.fn();
      renderList({ onReorder });

      triggerDragEnd({ active: { id: "1" }, over: { id: "1" } });

      expect(onReorder).not.toHaveBeenCalled();
    });
  });

  describe("id resolution", () => {
    it("falls back to new-{index} for items without an id", () => {
      const onReorder = jest.fn();
      const items = [{ label: "A" }, { label: "B" }];
      render(
        <DragAndDropList
          items={items}
          onReorder={onReorder}
          renderItem={renderItem}
        />
      );

      triggerDragEnd({ active: { id: "new-0" }, over: { id: "new-1" } });

      expect(onReorder).toHaveBeenCalledWith(
        [
          { label: "B", order: 1 },
          { label: "A", order: 2 }
        ],
        expect.anything()
      );
    });

    it("uses a custom idKey to resolve item ids", () => {
      const onReorder = jest.fn();
      const items = [
        { slug: "a", label: "A", order: 1 },
        { slug: "b", label: "B", order: 2 }
      ];
      render(
        <DragAndDropList
          items={items}
          onReorder={onReorder}
          renderItem={renderItem}
          idKey="slug"
        />
      );

      triggerDragEnd({ active: { id: "a" }, over: { id: "b" } });

      expect(onReorder).toHaveBeenCalledWith(
        [
          { slug: "b", label: "B", order: 1 },
          { slug: "a", label: "A", order: 2 }
        ],
        expect.anything()
      );
    });
  });

  describe("updateOrderKey", () => {
    it("uses a custom updateOrderKey in reordered items", () => {
      const onReorder = jest.fn();
      renderList({ onReorder, updateOrderKey: "position" });

      triggerDragEnd({ active: { id: "1" }, over: { id: "2" } });

      const [reordered] = onReorder.mock.calls[0];
      expect(reordered[0]).toHaveProperty("position", 1);
      expect(reordered[1]).toHaveProperty("position", 2);
    });
  });
});
