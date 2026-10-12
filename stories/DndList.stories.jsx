import React from "react";
import DndList from "../src/components/mui/dnd-list";

export default {
  title: "MUI/Drag and drop/DndList",
  component: DndList,
  argTypes: { onReorder: { action: "reorder" } },
  parameters: {
    docs: { description: { component: "react-beautiful-dnd based (the older list). Prefer DragNDropList for new work." } }
  }
};

export const Default = {
  args: {
    droppableId: "story-dnd-list",
    items: [
      { id: 1, order: 1, name: "Keynote mention" },
      { id: 2, order: 2, name: "Booth 10x10" },
      { id: 3, order: 3, name: "Lanyard branding" }
    ],
    renderItem: (item) => <span>{item.name}</span>
  }
};

