import ConfirmDialog from "../src/components/mui/confirm-dialog";

export default {
  title: "MUI/Dialogs/ConfirmDialog",
  component: ConfirmDialog,
  argTypes: { onConfirm: { action: "confirmed" }, onCancel: { action: "cancelled" } }
};

export const Default = {
  args: {
    open: true,
    title: "Publish this order?",
    text: "The sponsor will be emailed a copy of the invoice."
  }
};

export const Warning = {
  args: {
    ...Default.args,
    iconType: "warning",
    confirmButtonText: "Publish anyway",
    confirmButtonColor: "warning"
  }
};

