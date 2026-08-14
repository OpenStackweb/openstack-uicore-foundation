import React from "react";
import { Button } from "@mui/material";
import showConfirmDialog, { GlobalConfirmDialog } from "../src/components/mui/showConfirmDialog";

export default {
  title: "MUI/Dialogs/ShowConfirmDialog",
  component: GlobalConfirmDialog,
  parameters: {
    docs: {
      description: {
        component:
          "Imperative API. Mount GlobalConfirmDialog once at the app root, then call showConfirmDialog() from anywhere; it resolves with the user's choice."
      }
    }
  }
};

export const Imperative = {
  render: () => (
    <>
      <GlobalConfirmDialog />
      <Button
        onClick={() =>
          showConfirmDialog({
            title: "Discard draft?",
            text: "Unsaved changes will be lost.",
            confirmButtonText: "Discard",
            confirmButtonColor: "error"
          })
        }
      >
        Open confirm dialog
      </Button>
    </>
  )
};

