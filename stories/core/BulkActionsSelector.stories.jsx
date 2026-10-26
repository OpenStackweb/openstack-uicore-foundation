import BulkActionsSelector from "../../src/components/bulk-actions-selector";

export default {
  title: "Core/Inputs/BulkActionsSelector",
  component: BulkActionsSelector,
  argTypes: {
    onSelectAll: { action: "selectAll" },
    onSelectedBulkAction: { action: "bulkAction" }
  }
};

export const Default = {
  args: {
    show: true,
    bulkOptions: [
      { value: "publish", label: "Publish" },
      { value: "unpublish", label: "Unpublish" }
    ]
  }
};
