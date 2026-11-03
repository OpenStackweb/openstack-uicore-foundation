import UploadDialog from "../src/components/mui/UploadDialog";

export default {
  title: "MUI/Dialogs/UploadDialog",
  component: UploadDialog,
  argTypes: { onClose: { action: "closed" }, onUpload: { action: "uploaded" } }
};

export const Default = {
  args: {
    open: true,
    name: "logo",
    value: [],
    maxFiles: 1,
    fileMeta: {
      name: "Sponsor logo",
      description: "PNG or SVG, 5 MB max.",
      max_file_size: 5242880,
      allowed_extensions: "png,jpg,svg"
    }
  }
};

