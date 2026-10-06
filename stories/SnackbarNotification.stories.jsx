import React from "react";
import { useDispatch } from "react-redux";
import { Button } from "@mui/material";
import SnackbarNotification, { useSnackbarMessage } from "../src/components/mui/SnackbarNotification";
import { setSnackbarMessage } from "../src/utils/actions";

export default {
  title: "MUI/SnackbarNotification",
  component: SnackbarNotification,
  parameters: {
    docs: {
      description: {
        component:
          "Wrapper component — renders nothing until a message arrives. Two trigger paths: the useSnackbarMessage hook, or a snackbarMessage in the redux base reducer."
      }
    }
  }
};

// path 1: the useSnackbarMessage hook, for on-demand messaging
const HookTrigger = () => {
  const { successMessage, errorMessage } = useSnackbarMessage();
  return (
    <>
      <Button onClick={() => successMessage("Saved <b>3</b> records.")}>
        Trigger success
      </Button>
      <Button onClick={() => errorMessage("Could not reach the server.")}>
        Trigger warning
      </Button>
    </>
  );
};

export const ViaHook = {
  render: () => (
    <SnackbarNotification>
      <HookTrigger />
    </SnackbarNotification>
  )
};

// path 2: baseState.snackbarMessage, set by snackbarSuccessHandler/snackbarErrorHandler
const DispatchTrigger = () => {
  const dispatch = useDispatch();
  return (
    <Button
      onClick={() =>
        dispatch(
          setSnackbarMessage({ html: "Dispatched from the store.", type: "success" })
        )
      }
    >
      Dispatch to store
    </Button>
  );
};

export const ViaReduxState = {
  render: () => (
    <SnackbarNotification>
      <DispatchTrigger />
    </SnackbarNotification>
  )
};
