import { useEffect, useState } from "react";
import Exclusive from "../../src/components/exclusive-wrapper";

// Exclusive reads window.EXCLUSIVE_SECTIONS during render, so the value is set
// before the first render (not in an effect) and restored on unmount so it does
// not leak into other stories.
const WithExclusiveSections = ({ sections, children }) => {
  const [previous] = useState(() => {
    const value = window.EXCLUSIVE_SECTIONS;
    window.EXCLUSIVE_SECTIONS = sections;
    return value;
  });
  useEffect(() => () => {
    window.EXCLUSIVE_SECTIONS = previous;
  }, [previous]);
  return children;
};

export default {
  title: "Core/Display/Exclusive",
  component: Exclusive,
  // gated by window.EXCLUSIVE_SECTIONS — simulate the host app setting it
  decorators: [
    (Story) => (
      <WithExclusiveSections sections={["beta-feature"]}>
        <Story />
      </WithExclusiveSections>
    )
  ]
};

export const Visible = {
  args: { name: "beta-feature", children: "Shown because 'beta-feature' is in window.EXCLUSIVE_SECTIONS." }
};
export const Hidden = {
  args: { name: "other-feature", children: "You should NOT see this." }
};
