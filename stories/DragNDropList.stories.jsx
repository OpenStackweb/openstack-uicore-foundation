import React from "react";
import DragNDropList from "../src/components/mui/DragNDropList";

export default {
  title: "MUI/Drag and drop/DragNDropList",
  component: DragNDropList,
  argTypes: { onReorder: { action: "reorder" } },
  parameters: {
    docs: { description: { component: "dnd-kit based. Optional peer deps: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities." } }
  }
};

export const Default = {
  args: {
    items: [
      { id: 1, order: 1, name: "Keynote mention" },
      { id: 2, order: 2, name: "Booth 10x10" },
      { id: 3, order: 3, name: "Lanyard branding" }
    ],
    renderItem: (item) => <span>{item.name}</span>
  }
};

