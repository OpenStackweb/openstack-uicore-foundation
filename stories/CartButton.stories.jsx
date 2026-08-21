import CartButton from "../src/components/mui/CartButton";

export default {
  title: "MUI/Buttons/CartButton",
  component: CartButton,
  argTypes: { onClick: { action: "clicked" } }
};

export const Empty = { args: { itemCount: 0 } };
export const WithItems = { args: { itemCount: 3 } };
export const Disabled = { args: { itemCount: 3, disabled: true } };

