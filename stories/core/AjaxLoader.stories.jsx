import AjaxLoader from "../../src/components/ajaxloader";

export default {
  title: "Core/Feedback/AjaxLoader",
  component: AjaxLoader,
  // fixed-position overlay; relative + a positioned box keeps it inside the story frame
  decorators: [
    (Story) => (
      <div style={{ position: "relative", height: 300 }}>
        <Story />
      </div>
    )
  ]
};

export const Default = { args: { show: true, relative: true, size: 40 } };
export const Hidden = { args: { show: false, relative: true, size: 40 } };
