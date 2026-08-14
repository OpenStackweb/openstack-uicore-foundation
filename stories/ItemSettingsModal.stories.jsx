import ItemSettingsModal from "../src/components/mui/ItemSettingsModal";

export default {
  title: "MUI/Dialogs/ItemSettingsModal",
  component: ItemSettingsModal,
  argTypes: { onClose: { action: "closed" } }
};

export const Default = {
  args: {
    open: true,
    timeZone: "America/Chicago",
    item: { id: 1, name: "Booth 10x10", quantity: 1, price: 8000, meta_fields: [] }
  }
};

