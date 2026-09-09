import UploadInputV3 from "../../src/components/inputs/upload-input-v3";
import { NEEDS_API } from "../_helpers";

export default {
  title: "Core/Inputs/UploadInputV3",
  component: UploadInputV3,
  parameters: { docs: { description: { component: `Chunked dropzone posts to \`postUrl\`. ${NEEDS_API}` } } },
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
  args: { id: "media_upload_v3", value: [], mediaType, postUrl: "http://localhost/nowhere", maxFiles: 2 }
};
