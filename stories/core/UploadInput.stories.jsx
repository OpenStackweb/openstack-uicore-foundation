import UploadInput from "../../src/components/inputs/upload-input";

export default {
  title: "Core/Inputs/UploadInput",
  component: UploadInput,
  argTypes: {
    handleUpload: { action: "upload" },
    handleRemove: { action: "remove" },
    handleError: { action: "error" }
  }
};

export const Empty = { args: { value: "" } };
export const WithFile = {
  args: { value: "https://via.placeholder.com/150.png" }
};
