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

import Uppy from '@uppy/core';
import AwsS3 from '@uppy/aws-s3';
import { getAccessToken, initLogOut } from '../../security/methods';
import { AUTH_ERROR_REFRESH_TOKEN_NETWORK_ERROR } from '../../security/constants';
import { getMD5 } from '../../../utils/crypto';

export const RETRY_DELAYS = [0, 1000, 3000, 5000];

// getMD5 rejects with a bare string; everything downstream reads err.message.
const toError = (err) => (err instanceof Error ? err : new Error(String(err)));

// Token is fetched per request, never captured at construction: a multipart upload can
// outlive the access token that started it.
const apiFetch = async (baseUrl, path, options = {}) => {
  let accessToken;
  try {
    accessToken = await getAccessToken();
  } catch (e) {
    // Same rule as DropzoneJS.accept: a genuine auth failure ends the session, a
    // transient refresh-token network failure must not.
    if (!e.message || !e.message.startsWith(AUTH_ERROR_REFRESH_TOKEN_NETWORK_ERROR)) {
      initLogOut();
    }
    throw e;
  }
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  if (!response.ok) {
    let detail = `File API returned HTTP ${response.status}`;
    try {
      const body = await response.json();
      detail = body.message || body.detail || detail;
    } catch (e) {
      // not a JSON body: keep the status line
    }
    const err = new Error(detail);
    err.status = response.status;
    throw err;
  }
  return response.status === 204 ? null : response.json();
};

// Uppy never retries completion: any error goes straight to abort, and a user retry then
// starts a whole new upload. Both completion endpoints are idempotent, so transient
// failures are retried here first. A network failure (a TypeError from fetch) or a 5xx is
// retried; a 4xx, an AbortError or a token failure is not.
const completeWithRetry = async (call, signal, delays) => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await call();
    } catch (err) {
      const transient = err instanceof TypeError || err.status >= 500;
      if (!transient || signal?.aborted || attempt >= delays.length) throw err;
      await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
    }
  }
};

export const buildUppy = ({
  baseUrl,
  maxFileSize = null,
  allowedFileTypes = null,
  onTicket,
  retryDelays = RETRY_DELAYS,
}) => {
  // uppy fileID -> { ticketId, uploadId? } for the file's current attempt. Uppy's file id
  // is deterministic (name, type, size, lastModified), so a removed and re-added file
  // reuses it; the ticket id tells attempts apart. Every mutation after an await is
  // therefore compare-and-delete against the ticket id captured before it.
  const tickets = new Map();

  const uppy = new Uppy({
    autoProceed: true,
    restrictions: { maxFileSize, allowedFileTypes },
  });

  // Closes an attempt: forgets its ticket and hands Contract A on, but only while this
  // attempt still owns the file id. After removeFile() or destroy() the file-removed
  // handler has already taken the entry, so a completion that lands late delivers nothing.
  const settle = (fileID, ticketId, body) => {
    if (tickets.get(fileID)?.ticketId !== ticketId) return;
    tickets.delete(fileID);
    const live = uppy.getFile(fileID);
    if (live) onTicket(live, body);
  };

  // Per-file failure. Core sets no file error when a processor rejects, and retry selects
  // on file.error, so processors must set it themselves.
  const failFile = (fileID, err, prefix = '') => {
    if (!uppy.getFile(fileID)) return;             // setFileState throws for a removed file
    const cause = toError(err);
    const error = prefix
      ? Object.assign(new Error(`${prefix}${cause.message}`), { status: cause.status })
      : cause;
    uppy.setFileState(fileID, { error: error.message });
    uppy.emit('upload-error', uppy.getFile(fileID), error);
  };

  const describe = (file) => ({
    filename: file.name,
    content_type: file.type || 'application/octet-stream',
    size: file.size,
    md5: file.meta.md5,
  });

  // One cancellation path for both modes: removeFile, cancelAll and destroy all emit
  // file-removed. A settled attempt has already left the map, so a delivered ticket is
  // never DELETEd; anything still here is an upload nobody will finish, including a
  // single PUT that stored its object and was then abandoned.
  uppy.on('file-removed', (file) => {
    const t = tickets.get(file.id);
    if (!t) return;
    tickets.delete(file.id);
    apiFetch(baseUrl, `/uploads/${t.ticketId}`, { method: 'DELETE' }).catch(() => {});
  });

  // Runs to completion before any uploader starts (pre-processors, uploaders,
  // post-processors). A hash taken in `file-added` would lose to autoProceed's upload()
  // and the ticket would store md5: null.
  uppy.addPreProcessor(async (fileIDs) => {
    await Promise.all(fileIDs.map(async (fileID) => {
      const file = uppy.getFile(fileID);
      if (!file) return;
      try {
        uppy.setFileMeta(fileID, { md5: await getMD5(file.data) });
      } catch (err) {
        // Per file: a rejection here would fail the batch with no file error set, and
        // retry would find nothing. An errored file is skipped by the uploader and
        // re-hashed on retry.
        failFile(fileID, err, 'Could not hash file: ');
      }
    }));
  });

  uppy.use(AwsS3, {
    retryDelays,

    // An aborted single create leaves at most a Redis ticket with a TTL: no object exists
    // until the PUT, and the unused URL expires.
    async getUploadParameters(file, { signal }) {
      const r = await apiFetch(baseUrl, '/uploads/single', {
        method: 'POST', signal, body: JSON.stringify(describe(file)),
      });
      tickets.set(file.id, { ticketId: r.ticket_id });
      // r.headers is {'Content-Type': <declared>}, the value the PUT was presigned with.
      // Sending anything else is SignatureDoesNotMatch.
      return { method: 'PUT', url: r.url, fields: {}, headers: r.headers };
    },
  });

  // A presigned PUT talks only to Spaces, so the server is not in the loop when it
  // finishes: this closes the single-upload ticket. One completion per attempt at a time;
  // a second caller gets the one already in flight.
  const completeSingle = (fileID) => {
    const t = tickets.get(fileID);
    // Multipart attempts settle inside completeMultipartUpload.
    if (!t || t.uploadId) return undefined;
    if (!t.completion) {
      t.completion = (async () => {
        try {
          const r = await completeWithRetry(
            () => apiFetch(baseUrl, `/uploads/single/${t.ticketId}/complete`, { method: 'POST' }),
            undefined,
            retryDelays,
          );
          settle(fileID, t.ticketId, r);
        } catch (err) {
          // Removed, or replaced by a newer attempt with the same file id while this was
          // in flight: the failure is not the live attempt's, so it touches nothing.
          if (tickets.get(fileID)?.ticketId !== t.ticketId) return;
          // Only a server verdict resets. 412: the server rejected the object (size,
          // ceiling or checksum) and purged it. 403/404: it refused the ticket. Either way
          // the ticket can never complete, so drop it and clear uploadComplete: a retry
          // re-hashes, re-creates and re-uploads. setFileState merges shallowly, hence the
          // progress spread.
          if ([403, 404, 412].includes(err.status)) {
            tickets.delete(fileID);
            const live = uppy.getFile(fileID);
            if (live) {
              uppy.setFileState(fileID, {
                progress: { ...live.progress, uploadComplete: false, uploadStarted: null },
              });
            }
          }
          // Anything else (a token failure, a 401, a 5xx, a network error) keeps the
          // ticket: the stored object may still complete. Retry clears only `error`, the
          // file is still uploadComplete, so the uploader skips it and the post-processor
          // below completes it again; completion is idempotent server-side.
          failFile(fileID, err);
        } finally {
          t.completion = null;
        }
      })();
    }
    return t.completion;
  };

  // Each file completes as soon as its own PUT lands. Core runs post-processors once per
  // batch, after every file's transport, so completing only there would hold a small
  // file at 100% until the largest file in the same selection finished.
  uppy.on('upload-success', (file) => {
    if (file) completeSingle(file.id);
  });

  // On retry the uploader skips a file whose PUT already stored, so this is what
  // completes it then. In a first run it awaits the completion upload-success started.
  uppy.addPostProcessor(async (fileIDs) => {
    await Promise.all(fileIDs.map(async (fileID) => {
      const file = uppy.getFile(fileID);
      if (!file || file.error || !file.progress.uploadComplete) return;
      await completeSingle(fileID);
    }));
  });

  return uppy;
};
