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

import {
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";

// Shared dnd-kit wiring for reorderable lists/tables: sensors, collision
// detection, and the base order computation (orderOffset + idx + 1).
// orderOffset lets a paginated consumer add its page offset on top without
// duplicating the sensor/collision setup or the id-matching logic.
const useDndKitReorder = ({
  items,
  getItemId,
  onReorder,
  updateOrderKey = "order",
  orderOffset = 0
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item, i) => getItemId(item, i) === active.id);
    const newIndex = items.findIndex((item, i) => getItemId(item, i) === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(items, oldIndex, newIndex).map((item, idx) =>
      updateOrderKey
        ? { ...item, [updateOrderKey]: orderOffset + idx + 1 }
        : item
    );

    onReorder(reordered, { active, over, oldIndex, newIndex });
  };

  return { sensors, collisionDetection: closestCenter, handleDragEnd };
};

export default useDndKitReorder;
