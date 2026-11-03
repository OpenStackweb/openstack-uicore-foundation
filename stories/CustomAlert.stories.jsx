import CustomAlert from "../src/components/mui/CustomAlert";

export default { title: "MUI/Feedback/CustomAlert", component: CustomAlert };

export const Info = { args: { severity: "info", message: "Rates refresh nightly." } };
export const Warning = { args: { severity: "warning", message: "This show closes in 2 days." } };
export const Error = { args: { severity: "error", message: "Could not reach the payment provider." } };
export const NoIcon = { args: { severity: "info", message: "Compact variant.", hideIcon: true } };

