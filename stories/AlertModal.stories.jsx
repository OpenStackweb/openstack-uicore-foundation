import AlertModal from "../src/components/mui/AlertModal";

export default {
  title: "MUI/Dialogs/AlertModal",
  component: AlertModal,
  argTypes: { onClose: { action: "closed" } }
};

export const Default = {
  args: {
    open: true,
    title: "Payment declined",
    message: "The card ending 4242 was declined. Try another payment method."
  }
};

