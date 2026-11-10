/**
 * Copyright 2026 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Alert, Snackbar, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import SnackbarNotificationContext from "./Context";
export { useSnackbarMessage } from "./Context";
import {
  NOTIFICATION_DEDUPE_WINDOW,
  NOTIFICATION_TIMEOUT
} from "../../../utils/constants";
import { empty } from "../../../utils/methods";
import { clearSnackbarMessage } from "../../../utils/actions";

/*
 This component works in two ways:
 - useSnackbarMessage hook that returns successMessage and errorMessage methods to trigger the snackbar.
 - snackbarErrorHandler and snackbarSuccessHandler actions from base-actions that change the base reducer
 */

// one queue: the message on screen, then the ones waiting their turn
const useMessageQueue = (clearSnackbarMessage) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [current] = messages;
  // the message fading out, so a repeat of it still shows
  const closingRef = useRef(null);
  const add = (msg) =>
    setMessages((prev) => {
      // a blank message never opens, since it would block the queue
      if (empty(msg.html)) return prev;
      const now = Date.now();
      // skip a repeat that arrived within the dedupe window
      const isRepeat = prev.some(
        (m) =>
          m !== closingRef.current &&
          m.html === msg.html &&
          m.type === msg.type &&
          now - m.receivedAt < NOTIFICATION_DEDUPE_WINDOW
      );
      if (isRepeat) return prev;
      const next = { ...msg, receivedAt: now };
      return [...prev, next];
    });

  const close = () => {
    closingRef.current = current;
    setOpen(false);
  };

  const onExited = () => {
    clearSnackbarMessage();
    setMessages(([, ...rest]) => rest);
  };

  useEffect(() => {
    if (!empty(current?.html)) {
      setOpen(true);
    }
  }, [current]);

  return { open, current, add, close, onExited, setMessages };
};

const NotificationSnackbar = ({ queue, vertical }) => {
  const msgData = queue.current || {};
  const isSuccess = msgData.type === "success";

  const onClose = (_, reason) => {
    // errors stay until dismissed
    if (reason === "clickaway") return;
    queue.close();
  };

  return (
    <Snackbar
      open={queue.open}
      onClose={onClose}
      slotProps={{ transition: { onExited: queue.onExited } }}
      anchorOrigin={{ vertical, horizontal: "center" }}
      autoHideDuration={isSuccess ? NOTIFICATION_TIMEOUT : null}
    >
      <Alert
        onClose={onClose}
        severity={msgData.type}
        variant="filled"
        sx={{ width: "100%", backgroundColor: `${msgData.type}.light` }}
        iconMapping={{
          success: <CheckCircleIcon fontSize="inherit" />,
          error: <ErrorIcon fontSize="inherit" />
        }}
      >
        <Typography
          variant="body1"
          component="div"
          dangerouslySetInnerHTML={{ __html: msgData.html }}
        />
      </Alert>
    </Snackbar>
  );
};

const SnackbarNotification = ({
  children,
  snackbarMessage,
  clearSnackbarMessage,
  history
}) => {
  // separate queues, so a success never waits behind an error
  const errors = useMessageQueue(clearSnackbarMessage);
  const successes = useMessageQueue(clearSnackbarMessage);
  // bumped when the page path changes
  const [pageChanges, setPageChanges] = useState(0);
  const addMessage = (msg) =>
    (msg.type === "success" ? successes : errors).add(msg);
  // this two methods are for on-demand messaging
  const successMessage = (msg) => addMessage({ html: msg, type: "success" });
  const errorMessage = (msg) => addMessage({ html: msg, type: "warning" });
  const messageContext = useMemo(() => ({ successMessage, errorMessage }), []);

  // drop waiting errors on a path change, before the new page adds its own
  useEffect(() => {
    if (!history) return;
    let path = history.location.pathname;
    return history.listen(() => {
      if (history.location.pathname === path) return;
      path = history.location.pathname;
      errors.setMessages(([head]) => (head ? [head] : []));
      setPageChanges((n) => n + 1);
    });
  }, [history]);

  // leaving a page closes its error, successes keep their timer
  useEffect(() => {
    if (!pageChanges) return;
    if (errors.open) {
      errors.close();
    }
  }, [pageChanges]);

  // when snackbarMessage changes in base-reducer, we trigger the snackbar
  useEffect(() => {
    if (!empty(snackbarMessage?.html)) {
      addMessage(snackbarMessage);
    }
  }, [snackbarMessage]);

  return (
    <SnackbarNotificationContext.Provider value={messageContext}>
      <NotificationSnackbar queue={successes} vertical="top" />
      <NotificationSnackbar queue={errors} vertical="bottom" />
      {children}
    </SnackbarNotificationContext.Provider>
  );
};

SnackbarNotification.propTypes = {
  children: PropTypes.node,
  snackbarMessage: PropTypes.object,
  history: PropTypes.shape({
    listen: PropTypes.func,
    location: PropTypes.object
  })
};

const mapStateToProps = ({ baseState }) => ({
  snackbarMessage: baseState.snackbarMessage
});

export default connect(mapStateToProps, { clearSnackbarMessage })(
  SnackbarNotification
);
