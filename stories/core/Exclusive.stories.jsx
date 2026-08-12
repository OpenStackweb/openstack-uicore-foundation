import Exclusive from "../../src/components/exclusive-wrapper";

export default {
  title: "Core/Display/Exclusive",
  component: Exclusive,
  // gated by window.EXCLUSIVE_SECTIONS — simulate the host app setting it
  decorators: [
    (Story) => {
      window.EXCLUSIVE_SECTIONS = ["beta-feature"];
      return <Story />;
    }
  ]
};

export const Visible = {
  args: { name: "beta-feature", children: "Shown because 'beta-feature' is in window.EXCLUSIVE_SECTIONS." }
};
export const Hidden = {
  args: { name: "other-feature", children: "You should NOT see this." }
};
