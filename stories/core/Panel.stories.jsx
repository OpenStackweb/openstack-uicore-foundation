import Panel from "../../src/components/sections/panel";

export default {
  title: "Core/Layout/Panel",
  component: Panel,
  argTypes: { handleClick: { action: "toggled" } }
};

export const Open = {
  args: {
    title: "Venue Details",
    show: true,
    children: "Moscone Center — Halls A through C, plus the mezzanine breakout rooms."
  }
};

export const Collapsed = { args: { ...Open.args, show: false } };
