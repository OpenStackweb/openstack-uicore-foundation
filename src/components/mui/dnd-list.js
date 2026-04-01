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
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Box } from "@mui/material";

const reorder = (list, startIndex, endIndex, updateOrderKey) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result.map((item, index) => ({
    ...item,
    [updateOrderKey]: index + 1
  }));
};

const DragAndDropList = ({
  items,
  onReorder,
  renderItem,
  idKey,
  updateOrderKey,
  droppableId
}) => {
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const newItems = reorder(
      items,
      result.source.index,
      result.destination.index,
      updateOrderKey
    );
    onReorder(newItems, result);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={droppableId}>
        {(provided) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{ width: "100%" }}
          >
            {items.map((item, index) => (
              <Draggable
                key={String(item[idKey] || `new-${index}`)}
                draggableId={String(item[idKey] || `new-${index}`)}
                index={index}
              >
                {(provided, snapshot) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    sx={{
                      background: snapshot.isDragging ? "#f0f0f0" : "inherit",
                      transition: "background 0.2s ease"
                    }}
                  >
                    {renderItem(item, index, provided, snapshot)}
                  </Box>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
};

DragAndDropList.propTypes = {
  items: PropTypes.array.isRequired,
  onReorder: PropTypes.func.isRequired,
  renderItem: PropTypes.func.isRequired,
  idKey: PropTypes.string,
  updateOrderKey: PropTypes.string,
  droppableId: PropTypes.string
};

DragAndDropList.defaultProps = {
  idKey: "id",
  updateOrderKey: "order",
  droppableId: "droppable"
};

export default DragAndDropList;
