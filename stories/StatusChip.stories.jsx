import StatusChip from "../src/components/mui/StatusChip";

export default { title: "MUI/Data display/StatusChip", component: StatusChip };

export const Paid = { args: { status: "Paid" } };
export const Pending = { args: { status: "Pending" } };
export const Cancelled = { args: { status: "Cancelled" } };
export const Refunded = { args: { status: "Refunded" } };

