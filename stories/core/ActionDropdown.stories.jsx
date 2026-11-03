import ActionDropdown from "../../src/components/inputs/action-dropdown";

export default {
  title: "Core/Inputs/ActionDropdown",
  component: ActionDropdown,
  argTypes: { onClick: { action: "action" } }
};

const options = [
  { value: "export_csv", label: "Export CSV" },
  { value: "send_email", label: "Send Email" },
  { value: "archive", label: "Archive" }
];

export const Default = { args: { options, actionLabel: "Go", placeholder: "Bulk action..." } };
export const Small = { args: { ...Default.args, small: true } };
