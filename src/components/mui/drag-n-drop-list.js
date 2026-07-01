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
import PropTypes from "prop-types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box } from "@mui/material";

const SortableItem = ({ id, item, index, renderItem }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  return (
    <Box
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      sx={{
        background: isDragging ? "#f0f0f0" : "inherit",
        transition: "background 0.2s ease"
      }}
    >
      {renderItem(item, index, {
        isDragging,
        dragHandleProps: { ...listeners, ...attributes }
      })}
    </Box>
  );
};

const getItemId = (item, index, idKey) =>
  item[idKey] !== undefined && item[idKey] !== null
    ? String(item[idKey])
    : `new-${index}`;

const DragNDropList = ({
  items,
  onReorder,
  renderItem,
  idKey = "id",
  updateOrderKey = "order"
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex(
      (item, i) => getItemId(item, i, idKey) === active.id
    );
    const newIndex = items.findIndex(
      (item, i) => getItemId(item, i, idKey) === over.id
    );

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(items, oldIndex, newIndex).map((item, i) => ({
      ...item,
      [updateOrderKey]: i + 1
    }));

    onReorder(reordered, { active, over });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item, i) => getItemId(item, i, idKey))}
        strategy={verticalListSortingStrategy}
      >
        <Box sx={{ width: "100%" }}>
          {items.map((item, index) => (
            <SortableItem
              key={getItemId(item, index, idKey)}
              id={getItemId(item, index, idKey)}
              item={item}
              index={index}
              renderItem={renderItem}
            />
          ))}
        </Box>
      </SortableContext>
    </DndContext>
  );
};

DragNDropList.propTypes = {
  items: PropTypes.array.isRequired,
  onReorder: PropTypes.func.isRequired,
  renderItem: PropTypes.func.isRequired,
  idKey: PropTypes.string,
  updateOrderKey: PropTypes.string
};

export default DragNDropList;
