import ConfirmDeleteDialog from "../src/components/mui/ConfirmDeleteDialog";

export default {
  title: "MUI/Dialogs/ConfirmDeleteDialog",
  component: ConfirmDeleteDialog,
  argTypes: { onClose: { action: "closed" }, onConfirm: { action: "confirmed" } }
};

export const Default = {
  args: { open: true, message: "Delete the Diamond sponsorship package?" }
};

