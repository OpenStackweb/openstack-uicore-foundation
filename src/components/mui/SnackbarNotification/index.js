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
import T from "i18n-react/dist/i18n-react";
import {
  Alert,
  Box,
  Collapse,
  IconButton,
  Link,
  Snackbar,
  Tooltip,
  Typography
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ErrorIcon from "@mui/icons-material/Error";
import SnackbarNotificationContext from "./Context";
export { useSnackbarMessage } from "./Context";
import {
  MILLISECONDS_IN_SECOND,
  NOTIFICATION_DEDUPE_WINDOW,
  NOTIFICATION_TIMEOUT
} from "../../../utils/constants";
import { empty, formatEpoch } from "../../../utils/methods";
import { clearConsumedSnackbarMessage } from "../../../utils/actions";

/*
 This component works in two ways:
 - useSnackbarMessage hook that returns successMessage and errorMessage methods to trigger the snackbar.
 - snackbarErrorHandler and snackbarSuccessHandler actions from base-actions that change the base reducer
 */

const formatSentAt = (msg) =>
  formatEpoch(msg.receivedAt / MILLISECONDS_IN_SECOND, "h:mm:ss a");

const toCopyText = (msg) => {
  const html = String(msg.html).replace(/<br\s*\/?>/gi, "\n");
  const text = new DOMParser().parseFromString(html, "text/html").body
    .textContent;
  return [text.trim(), msg.details].filter(Boolean).join("\n\n");
};

// a queue shows its first message, a group shows all of them at once
const useMessages = ({ grouped = false } = {}) => {
  const [messages, setMessages] = useState([]);
  // the messages fading out stay on screen until they are gone
  const [closing, setClosing] = useState(null);
  const shown = closing || (grouped ? messages : messages.slice(0, 1));
  const current = shown[shown.length - 1];
  const open = !closing && shown.length > 0;
  // the history listener only sees the first render, so it reads refs
  const shownRef = useRef(shown);
  useEffect(() => {
    shownRef.current = shown;
  });
  // a copy of closing for callbacks that only see the first render
  const closingRef = useRef([]);
  const add = (msg) =>
    setMessages((prev) => {
      // a blank message never opens, since it would block the queue
      if (empty(msg.html)) return prev;
      const now = Date.now();
      // skip a repeat unless the first is fading out; errors only within the dedupe window
      const isRepeat = prev.some(
        (m) =>
          !closingRef.current.includes(m) &&
          m.html === msg.html &&
          m.type === msg.type &&
          (!grouped || now - m.receivedAt < NOTIFICATION_DEDUPE_WINDOW)
      );
      if (isRepeat) return prev;
      const next = { ...msg, receivedAt: now };
      return [...prev, next];
    });

  // closes what is on screen; anything newer shows once it has faded out
  const close = () => {
    if (!shownRef.current.length) return;
    closingRef.current = shownRef.current;
    setClosing(shownRef.current);
  };

  const onExited = () => {
    const closed = closingRef.current;
    closingRef.current = [];
    setMessages((prev) => prev.filter((m) => !closed.includes(m)));
    setClosing(null);
  };

  return { open, current, shown, add, close, onExited };
};

const NotificationSnackbar = ({ queue, vertical }) => {
  const msgData = queue.current || {};
  const isSuccess = msgData.type === "success";
  const count = queue.shown.length;
  const newestFirst = [...queue.shown].reverse();
  const [expanded, setExpanded] = useState(false);
  const detailsLabel = T.translate(
    expanded
      ? "snackbar_notification.hide_details"
      : "snackbar_notification.view_details",
    { count }
  );

  const onClose = (event, reason) => {
    // messages ignore clickaways
    if (reason === "clickaway") return;
    // one Escape press closes one snackbar
    if (reason === "escapeKeyDown") event.preventDefault();
    queue.close();
  };

  const onExited = () => {
    setExpanded(false);
    queue.onExited();
  };

  // clipboard results for an earlier message are ignored
  const [copyResult, setCopyResult] = useState(null);
  const copyStatus = copyResult?.message === msgData ? copyResult.status : null;
  // clipboard callbacks only see their own render, so they read a ref
  const msgRef = useRef(msgData);
  useEffect(() => {
    msgRef.current = msgData;
  });
  const copyStatusKey = {
    copied: "general.copied",
    failed: "general.copy_failed"
  }[copyStatus];
  const copyLabel =
    count > 1 ? "general.copy_all_errors" : "general.copy_error";
  const handleCopy = () => {
    // a late result for a message no longer on screen is dropped
    const finish = (status) =>
      msgRef.current === msgData && setCopyResult({ message: msgData, status });
    // a group copies oldest first, each error under its position and sent time
    const copyText =
      count > 1
        ? queue.shown
            .map(
              (m, i) =>
                `[${i + 1}/${count}] ${formatSentAt(m)}\n${toCopyText(m)}`
            )
            .join("\n\n")
        : toCopyText(msgData);
    // the clipboard can be missing (non-https page) or blocked by the browser
    try {
      navigator.clipboard.writeText(copyText).then(
        () => finish("copied"),
        () => finish("failed")
      );
    } catch (e) {
      finish("failed");
    }
  };

  return (
    <Snackbar
      open={queue.open}
      onClose={onClose}
      slotProps={{ transition: { onExited } }}
      anchorOrigin={{ vertical, horizontal: "center" }}
      autoHideDuration={isSuccess ? NOTIFICATION_TIMEOUT : null}
    >
      <Alert
        onClose={onClose}
        // a custom action replaces Alert's close button, so errors re-add it
        action={
          isSuccess ? undefined : (
            <>
              <Tooltip title={T.translate(copyStatusKey || copyLabel)}>
                <IconButton
                  size="small"
                  color="inherit"
                  aria-label={T.translate(copyLabel)}
                  onClick={handleCopy}
                >
                  {copyStatus === "copied" ? (
                    <CheckIcon fontSize="small" />
                  ) : (
                    <ContentCopyIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
              {/* a live region, since screen readers skip the tooltip change */}
              <Box component="span" role="status" sx={visuallyHidden}>
                {copyStatusKey && T.translate(copyStatusKey)}
              </Box>
              <IconButton
                size="small"
                color="inherit"
                aria-label={T.translate("general.close")}
                onClick={onClose}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </>
          )
        }
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
        {count > 1 && (
          <>
            <Link
              component="button"
              type="button"
              variant="body2"
              color="inherit"
              underline="hover"
              aria-expanded={expanded}
              onClick={() => setExpanded((isOpen) => !isOpen)}
              sx={{ fontWeight: "medium" }}
            >
              {detailsLabel}
            </Link>
            <Collapse in={expanded}>
              <Box
                component="ul"
                sx={{
                  m: 0,
                  p: 0,
                  listStyle: "none",
                  maxHeight: "40vh",
                  overflowY: "auto"
                }}
              >
                {newestFirst.map((m) => (
                  <Box
                    component="li"
                    key={`${m.receivedAt}-${m.html}`}
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="caption" component="div">
                      {formatSentAt(m)}
                    </Typography>
                    <Typography
                      variant="body2"
                      component="div"
                      dangerouslySetInnerHTML={{ __html: m.html }}
                    />
                  </Box>
                ))}
              </Box>
            </Collapse>
          </>
        )}
      </Alert>
    </Snackbar>
  );
};

const SnackbarNotification = ({
  children,
  snackbarMessage,
  clearConsumedSnackbarMessage,
  history
}) => {
  // separate lists, so a success never waits behind an error
  const errors = useMessages({ grouped: true });
  const successes = useMessages();
  const addMessage = (msg) =>
    (msg.type === "success" ? successes : errors).add(msg);
  // this two methods are for on-demand messaging
  const successMessage = (msg) => addMessage({ html: msg, type: "success" });
  const errorMessage = (msg) => addMessage({ html: msg, type: "warning" });
  const messageContext = useMemo(() => ({ successMessage, errorMessage }), []);

  // leaving a page closes its errors, successes keep their timer
  useEffect(() => {
    if (!history) return;
    let path = history.location.pathname;
    return history.listen(() => {
      if (history.location.pathname === path) return;
      path = history.location.pathname;
      errors.close();
    });
  }, [history]);

  // when snackbarMessage changes in base-reducer, we trigger the snackbar
  useEffect(() => {
    if (!empty(snackbarMessage?.html)) {
      addMessage(snackbarMessage);
      // the list owns it now, so a persisted store won't replay it on reload
      clearConsumedSnackbarMessage(snackbarMessage);
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

export default connect(mapStateToProps, { clearConsumedSnackbarMessage })(
  SnackbarNotification
);
