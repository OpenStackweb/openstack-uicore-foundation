import SortableTable from "../src/components/mui/sortable-table/mui-table-sortable";
import { sampleRows, sampleColumns } from "./_helpers";

export default {
  title: "MUI/Tables/SortableTable",
  component: SortableTable,
  argTypes: {
    onSort: { action: "sort" },
    onReorder: { action: "reorder" },
    onEdit: { action: "edit" },
    onDelete: { action: "delete" }
  },
  parameters: {
    docs: { description: { component: "Drag-to-reorder table. Pulls react-beautiful-dnd as an optional peer." } }
  }
};

export const Default = {
  args: {
    columns: sampleColumns,
    data: sampleRows.map((r, i) => ({ ...r, order: i + 1 }))
  }
};

