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
import { DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Box } from "@mui/material";

import SortableItem from "./sortable-item";
import useDndKitReorder from "./hooks/useDndKitReorder";

// Items without an idKey value fall back to a positional id (new-${index}).
// Because that id is recomputed from the current index every render, after a
// reorder it identifies whatever item now occupies that slot, not the item it
// originally pointed to - React will reuse that item's fiber instead of
// remounting it. Harmless if renderItem is stateless/positional (e.g. Formik
// fields bound by values[index]), but consumers relying on local/uncontrolled
// state inside renderItem should assign a stable id (e.g. crypto.randomUUID())
// to new items instead of leaving idKey undefined.
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
  const { sensors, collisionDetection, handleDragEnd } = useDndKitReorder({
    items,
    getItemId: (item, i) => getItemId(item, i, idKey),
    updateOrderKey,
    onReorder: (reordered, { active, over }) => onReorder(reordered, { active, over })
  });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
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
