import NotesModal from "../src/components/mui/NotesModal";
import { withFormik } from "./_helpers";

export default {
  title: "MUI/Dialogs/NotesModal",
  component: NotesModal,
  argTypes: { onClose: { action: "closed" } },
  decorators: [withFormik({ notes: "" })]
};

export const Default = {
  args: {
    open: true,
    id: 42,
    title: "Internal notes",
    label: "Note",
    placeholder: "Add a note for the ops team..."
  }
};

