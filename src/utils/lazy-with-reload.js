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
 **/

import React from "react";
import * as Sentry from "@sentry/react";
import { isSentryInitialized } from "./methods";

const RELOAD_STATE_KEY = "uicore.chunk-load-error-reload-state";
const PENDING_CONFIRMATION_KEY = "uicore.chunk-load-error-pending-confirmation";

// webpack's own JSONP chunk-loading runtime hardcodes error.name = "ChunkLoadError"
// on every chunk-load failure it detects through the import() promise - both a
// genuine network 404 AND the "script tag loaded (200 OK) but the expected chunk
// never registered" case, e.g. a stale content-hashed chunk URL falling through to
// an SPA's index.html fallback. This is webpack's own intentional, stable
// convention (see webpack/lib/web/JsonpChunkLoadingRuntimeModule.js), not a guess.
const isWebpackChunkLoadError = (error) =>
  Boolean(error) && error.name === "ChunkLoadError";

// A stale chunk URL can 200 with the SPA's index.html instead of real JS,
// which the browser throws as a SyntaxError parsing it as a script. We match
// on error TYPE (stable across engines) plus a chunk-shaped filename, not
// the message wording (e.g. "Unexpected token '<'" is V8-specific).
const DEFAULT_CHUNK_FILENAME_PATTERN = /[._-][0-9a-f]{8,}\.js(\?.*)?$/i;

const isHtmlParsedAsScriptError = (
  error,
  filename,
  chunkFilenamePattern = DEFAULT_CHUNK_FILENAME_PATTERN
) => {
  const message = (error && error.message) || (typeof error === "string" ? error : "");
  // error.name is set when available; otherwise fall back to the word
  // "SyntaxError" in the flat message string (window.onerror without event.error).
  const looksLikeSyntaxError =
    (error && error.name === "SyntaxError") || /SyntaxError/i.test(message);
  if (!looksLikeSyntaxError) return false;
  return Boolean(filename) && chunkFilenamePattern.test(filename);
};

export const isChunkLoadError = (error, filename, chunkFilenamePattern) =>
  isWebpackChunkLoadError(error) ||
  isHtmlParsedAsScriptError(error, filename, chunkFilenamePattern);

// Fingerprints the statically-loaded <script> tags present the first time
// this module runs on a given page load - i.e. before any lazy chunk has
// been requested. This identifies "which build is currently running"
// without requiring the consuming app to expose a dedicated build-version
// global. Computed once and cached: document.scripts grows over time as
// webpack's runtime appends a <script> tag for every lazy chunk that loads,
// so reading it lazily-but-uncached would make the fingerprint drift within
// a single build, not just across a real deploy.
const cachedBuildFingerprint =
  typeof document !== "undefined"
    ? Array.from(document.scripts)
        .map((s) => s.src)
        .filter(Boolean)
        .sort()
        .join(",")
    : "";
const getBuildFingerprint = () => cachedBuildFingerprint;

const readReloadState = () => {
  try {
    const raw = window.sessionStorage.getItem(RELOAD_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeReloadState = (state) => {
  try {
    window.sessionStorage.setItem(RELOAD_STATE_KEY, JSON.stringify(state));
  } catch {
    // ignore - sessionStorage can throw in some privacy modes
  }
};

const reportRecoveryFailed = (error, filename) => {
  const context = {
    level: "error",
    tags: { chunkErrorRecovery: "failed" },
    extra: { originalMessage: error?.message, filename }
  };
  if (isSentryInitialized()) {
    Sentry.captureMessage("Chunk load error persisted after auto-reload", context);
  } else {
    console.error("Chunk load error persisted after auto-reload", context);
  }
};

// Reloads the page once per *build* when a lazy chunk fails to load
// (typically a stale content-hashed filename after a deploy). Returns true
// only when it actually triggers a *new* reload; false if this isn't a chunk
// error, if a reload was already triggered earlier in this same page
// lifecycle (see reloadTriggeredThisPage below - concurrent lazy chunks can
// each reject in the same microtask drain, and window.location.reload()
// doesn't halt JS, so a later same-tick failure must not re-run the
// persisted-state check or file a false "recovery failed" report while the
// first reload is still in flight), or if we already tried reloading once
// for this same build on a *prior* page load - in the latter case a
// distinct Sentry report is filed (see reportRecoveryFailed) and the caller
// should let the error propagate normally instead of looping. Scoping the
// persisted guard to the build (not just "once this session") means that if
// a second deploy lands later in the same long-lived tab, a fresh failure
// on that new build still gets its own reload attempt instead of being
// silently blocked by an unrelated earlier recovery.
let reloadTriggeredThisPage = false;
export const reloadOnChunkError = (error, filename, chunkFilenamePattern) => {
  if (!isChunkLoadError(error, filename, chunkFilenamePattern)) return false;

  if (reloadTriggeredThisPage) return false;

  const currentBuild = getBuildFingerprint();
  const state = readReloadState();

  if (state && state.build === currentBuild) {
    reportRecoveryFailed(error, filename);
    return false;
  }

  reloadTriggeredThisPage = true;
  writeReloadState({ build: currentBuild });
  try {
    window.sessionStorage.setItem(PENDING_CONFIRMATION_KEY, "1");
  } catch {
    // ignore - see readReloadState/writeReloadState
  }
  window.location.reload();
  return true;
};

// Logs (once) that a prior chunk-load-error reload actually took effect, so
// it's easy to confirm in the console that this recovery path fired.
const confirmReloadIfPending = () => {
  try {
    if (window.sessionStorage.getItem(PENDING_CONFIRMATION_KEY) === "1") {
      window.sessionStorage.removeItem(PENDING_CONFIRMATION_KEY);
      // eslint-disable-next-line no-console
      console.log(
        "[lazy-with-reload] Recovered from a chunk load error via automatic reload"
      );
    }
  } catch {
    // ignore
  }
};

// Drop-in replacement for React.lazy(() => import(...)) that auto-recovers
// from a stale-chunk failure by reloading the page once. On any other error,
// or a repeat chunk failure after the reload already happened once for this
// build, the error is rethrown so it still reaches the app's own error
// boundary/fallback UI.
export const lazyWithReload = (importer, chunkFilenamePattern) =>
  React.lazy(() =>
    importer().catch((error) => {
      if (reloadOnChunkError(error, undefined, chunkFilenamePattern)) {
        // reload is in flight - never resolve so nothing renders (e.g. an
        // error boundary flash) before it takes effect
        return new Promise(() => {});
      }
      throw error;
    })
  );

// Fallback safety net for chunk-load failures that don't flow through
// lazyWithReload (e.g. a bare React.lazy()/dynamic import() call, or the raw
// SyntaxError case, which is never a promise rejection at all - see
// isHtmlParsedAsScriptError above). Call once at app bootstrap. Also
// confirms (via console.log) whether a prior chunk-load-error reload
// actually took effect, since this is the app's one designated bootstrap
// entry point for this recovery mechanism.
export const initChunkErrorRecovery = (chunkFilenamePattern) => {
  confirmReloadIfPending();

  const onUnhandledRejection = (event) => {
    if (reloadOnChunkError(event.reason, undefined, chunkFilenamePattern)) {
      event.preventDefault();
    }
  };

  const onError = (event) => {
    const error = event.error || { message: event.message };
    if (reloadOnChunkError(error, event.filename, chunkFilenamePattern)) {
      event.preventDefault();
    }
  };

  window.addEventListener("unhandledrejection", onUnhandledRejection);
  window.addEventListener("error", onError);

  return () => {
    window.removeEventListener("unhandledrejection", onUnhandledRejection);
    window.removeEventListener("error", onError);
  };
};

// Sentry beforeSend hook: drops chunk-load-error events from being reported,
// since a first-time occurrence is expected to self-heal via the reload
// above. A repeat failure (reload didn't help) is reported separately and
// explicitly via reportRecoveryFailed's Sentry.captureMessage call, which is
// a message-type event (no .exception), so it is unaffected by this filter.
// Sentry stack frames are ordered oldest-first; the last one is where the
// exception was actually thrown - the only frame worth checking against
// chunkFilenamePattern.
const getExceptionFilename = (exceptionValue) => {
  const frames = exceptionValue.stacktrace?.frames;
  return frames?.length ? frames[frames.length - 1]?.filename : undefined;
};

export const chunkErrorSentryBeforeSend = (event) => {
  const exceptionValues = event.exception?.values || [];
  const matchesChunkError = exceptionValues.some((exceptionValue) =>
    isChunkLoadError(
      { name: exceptionValue.type, message: exceptionValue.value },
      getExceptionFilename(exceptionValue)
    )
  );
  return matchesChunkError ? null : event;
};
