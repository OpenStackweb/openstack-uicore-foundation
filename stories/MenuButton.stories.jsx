import MenuButton from "../src/components/mui/menu-button";

export default { title: "MUI/Buttons/MenuButton", component: MenuButton };

export const Default = {
  args: {
    buttonId: "story-menu-button",
    menuId: "story-menu",
    children: "Actions",
    menuItems: [
      { label: "Edit", onClick: () => {} },
      { label: "Duplicate", onClick: () => {} },
      { label: "Delete", onClick: () => {} }
    ]
  }
};

export const WithBadge = { args: { ...Default.args, hasBadge: true } };

