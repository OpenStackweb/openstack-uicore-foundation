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

jest.mock("@dnd-kit/core", () => ({
  closestCenter: "closestCenter",
  KeyboardSensor: function KeyboardSensor() {},
  PointerSensor: function PointerSensor() {},
  useSensor: jest.fn((sensor) => sensor),
  useSensors: jest.fn((...sensors) => sensors)
}));

jest.mock("@dnd-kit/sortable", () => ({
  sortableKeyboardCoordinates: jest.fn(),
  arrayMove: (arr, from, to) => {
    const result = [...arr];
    const [item] = result.splice(from, 1);
    result.splice(to, 0, item);
    return result;
  }
}));

import React from "react";
import { render } from "@testing-library/react";
import useDndKitReorder from "../useDndKitReorder";

// @testing-library/react in this repo predates renderHook, so exercise the
// hook through a throwaway host component instead.
const Harness = ({ onReady, ...hookArgs }) => {
  onReady(useDndKitReorder(hookArgs));
  return null;
};

const setup = (hookArgs) => {
  let result;
  render(<Harness {...hookArgs} onReady={(r) => { result = r; }} />);
  return result;
};

const items = [
  { id: 1, name: "A" },
  { id: 2, name: "B" },
  { id: 3, name: "C" }
];

describe("useDndKitReorder", () => {
  test("exposes sensors and the shared collision detection strategy", () => {
    const result = setup({ items, getItemId: (i) => String(i.id), onReorder: jest.fn() });

    expect(result.sensors).toBeDefined();
    expect(result.collisionDetection).toBe("closestCenter");
  });

  test("computes order as idx + 1 when no orderOffset is given", () => {
    const onReorder = jest.fn();
    const result = setup({ items, getItemId: (i) => String(i.id), onReorder });

    result.handleDragEnd({ active: { id: "1" }, over: { id: "3" } });

    expect(onReorder).toHaveBeenCalledWith(
      [
        { id: 2, name: "B", order: 1 },
        { id: 3, name: "C", order: 2 },
        { id: 1, name: "A", order: 3 }
      ],
      expect.objectContaining({ oldIndex: 0, newIndex: 2 })
    );
  });

  test("adds orderOffset on top of the base position for paginated consumers", () => {
    const onReorder = jest.fn();
    const result = setup({
      items,
      getItemId: (i) => String(i.id),
      onReorder,
      orderOffset: 10
    });

    result.handleDragEnd({ active: { id: "1" }, over: { id: "2" } });

    const [reordered] = onReorder.mock.calls[0];
    expect(reordered[0]).toHaveProperty("order", 11);
    expect(reordered[1]).toHaveProperty("order", 12);
  });

  test("does not call onReorder when there is no drop target", () => {
    const onReorder = jest.fn();
    const result = setup({ items, getItemId: (i) => String(i.id), onReorder });

    result.handleDragEnd({ active: { id: "1" }, over: null });

    expect(onReorder).not.toHaveBeenCalled();
  });

  test("does not call onReorder when dropped on the same item", () => {
    const onReorder = jest.fn();
    const result = setup({ items, getItemId: (i) => String(i.id), onReorder });

    result.handleDragEnd({ active: { id: "1" }, over: { id: "1" } });

    expect(onReorder).not.toHaveBeenCalled();
  });

  test("skips writing an order key when updateOrderKey is falsy", () => {
    const onReorder = jest.fn();
    const result = setup({
      items,
      getItemId: (i) => String(i.id),
      onReorder,
      updateOrderKey: null
    });

    result.handleDragEnd({ active: { id: "1" }, over: { id: "2" } });

    const [reordered] = onReorder.mock.calls[0];
    expect(reordered[0]).not.toHaveProperty("order");
  });
});
