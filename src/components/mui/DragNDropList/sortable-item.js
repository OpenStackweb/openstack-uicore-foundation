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
  useSortable,
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
      style={{
        transform: CSS.Transform.toString(transform),
        transition: [transition, "background 0.2s ease"].filter(Boolean).join(", "),
        zIndex: isDragging ? 1 : "auto",
        position: "relative"
      }}
      sx={{ background: isDragging ? "#f0f0f0" : "inherit" }}
    >
      {renderItem(item, index, {
        isDragging,
        dragHandleProps: { ...listeners, ...attributes }
      })}
    </Box>
  );
};

SortableItem.propTypes = {
  id: PropTypes.string.isRequired,
  item: PropTypes.object.isRequired,
  index: PropTypes.number,
  renderItem: PropTypes.func.isRequired
};

export default SortableItem;
