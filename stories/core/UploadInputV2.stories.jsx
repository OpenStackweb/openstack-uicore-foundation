import UploadInputV2 from "../../src/components/inputs/upload-input-v2";
import { NEEDS_API } from "../_helpers";

export default {
  title: "Core/Inputs/UploadInputV2",
  component: UploadInputV2,
  parameters: { docs: { description: { component: `Dropzone posts to \`postUrl\`. ${NEEDS_API}` } } },
  argTypes: {
    onRemove: { action: "remove" },
    onUploadComplete: { action: "uploadComplete" }
  }
};

const mediaType = {
  max_size: 10240,
  max_uploads_qty: 1,
  type: { allowed_extensions: ["PNG", "JPG", "PDF"] }
};

export const Default = {
  args: { id: "media_upload", value: [], mediaType, postUrl: "http://localhost/nowhere" }
};
