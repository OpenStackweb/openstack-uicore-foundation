import InfoTooltip from "../src/components/mui/InfoTooltip";

export default { title: "MUI/Data display/InfoTooltip", component: InfoTooltip };

export const Default = { args: { title: "Additional information about this field" } };

export const Customized = {
  args: {
    title: "Additional information about this field",
    color: "primary.main",
    fontSize: "0.625rem",
    placement: "top"
  }
};
