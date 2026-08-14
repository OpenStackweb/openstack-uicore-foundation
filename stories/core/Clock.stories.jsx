import Clock from "../../src/components/clock";
import { NEEDS_API } from "../_helpers";

export default {
  title: "Core/Display/Clock",
  component: Clock,
  parameters: {
    docs: { description: { component: `Syncs against the summit time service, falling back to local time. ${NEEDS_API}` } }
  },
  argTypes: { onTick: { action: "tick" } }
};

export const Default = { args: { display: true, timezone: "America/Vancouver" } };
