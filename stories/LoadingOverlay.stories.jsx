import React from "react";
import LoadingOverlay from "../src/components/mui/LoadingOverlay";

export default { title: "MUI/Feedback/LoadingOverlay", component: LoadingOverlay };

export const Loading = {
  render: (args) => (
    <div style={{ position: "relative", height: 200, border: "1px dashed #ccc" }}>
      <LoadingOverlay {...args} />
    </div>
  ),
  args: { loading: true }
};

export const Idle = { ...Loading, args: { loading: false } };

