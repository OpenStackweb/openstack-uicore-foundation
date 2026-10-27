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

export const MULTIPART_THRESHOLD = 100 * 2 ** 20;   // 100 MiB, Uppy's documented default
const MIN_PART_SIZE = 5 * 2 ** 20;                   // S3 minimum
const MAX_PARTS = 1000;                              // one ListParts page; S3 itself allows 10,000
export const RETRY_DELAYS = [0, 1000, 3000, 5000];

// Uppy evaluates getChunkSize in the MultipartUploader constructor, before
// createMultipartUpload runs, so the server cannot dictate the part size. The client
// fixes it here and tells the server, which bounds it and holds every part signature
// to it. Dividing by 1,000 keeps every upload inside a single ListParts page.
export const partSizeFor = (size) => Math.max(MIN_PART_SIZE, Math.ceil(size / MAX_PARTS));

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
    const err = new Error(`File API returned HTTP ${response.status}`);
    err.status = response.status;
    try {
      const body = await response.json();
      if (body.message || body.detail) {
        err.message = body.message || body.detail;
        err.fromServer = true;  // a message meant for the user, shown as is
      }
    } catch (e) {
      // not a JSON body: keep the status line
    }
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
  multipartThreshold = MULTIPART_THRESHOLD,
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
  // `code` names a failure the component shows as its own translated message.
  const failFile = (fileID, err, code) => {
    if (!uppy.getFile(fileID)) return;             // setFileState throws for a removed file
    const cause = toError(err);
    // An owned error: a caught one may not take a new property (a DOMException's code is
    // read-only).
    const error = code
      ? Object.assign(new Error(cause.message), { code, status: cause.status })
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
  // The hash in flight per file id. A file removed and added again keeps its id, so a
  // hash that settles after that belongs to the old attempt and must not touch the new one.
  const hashing = new Map();

  uppy.addPreProcessor(async (fileIDs) => {
    await Promise.all(fileIDs.map(async (fileID) => {
      const file = uppy.getFile(fileID);
      if (!file) return;
      const attempt = {};
      hashing.set(fileID, attempt);
      try {
        const md5 = await getMD5(file.data);
        if (hashing.get(fileID) === attempt) uppy.setFileMeta(fileID, { md5 });
      } catch (err) {
        // Per file: a rejection here would fail the batch with no file error set, and
        // retry would find nothing. An errored file is skipped by the uploader and
        // re-hashed on retry.
        if (hashing.get(fileID) === attempt) failFile(fileID, err, 'hash_failed');
      } finally {
        if (hashing.get(fileID) === attempt) hashing.delete(fileID);
      }
    }));
  });

  uppy.use(AwsS3, {
    shouldUseMultipart: (file) => file.size > multipartThreshold,
    // Called with the file's Blob, not the Uppy file; both carry .size.
    getChunkSize: (data) => partSizeFor(data.size),
    retryDelays,

    // An aborted single create leaves at most a Redis ticket with a TTL: no object exists
    // until the PUT, and the unused URL expires.
    async getUploadParameters(file, { signal }) {
      // A retry after a failed PUT: that PUT may have stored its object before the
      // connection dropped, and nothing else will purge it.
      const stale = tickets.get(file.id);
      if (stale && !stale.uploadId) {
        tickets.delete(file.id);
        apiFetch(baseUrl, `/uploads/${stale.ticketId}`, { method: 'DELETE' }).catch(() => {});
      }
      const r = await apiFetch(baseUrl, '/uploads/single', {
        method: 'POST', signal, body: JSON.stringify(describe(file)),
      });
      tickets.set(file.id, { ticketId: r.ticket_id });
      // r.headers is {'Content-Type': <declared>}, the value the PUT was presigned with.
      // Sending anything else is SignatureDoesNotMatch.
      return { method: 'PUT', url: r.url, fields: {}, headers: r.headers };
    },

    // NOT signalled, deliberately. If the file is removed while this is in flight, Uppy
    // clears its own cache entry and never calls abortMultipartUpload for it. Handing the
    // signal to fetch would reject this await while the server has already opened the S3
    // upload and written the ticket, and the cleanup below would never run. So the
    // request finishes and the hook deletes the ticket it just learned about.
    async createMultipartUpload(file, signal) {
      const r = await apiFetch(baseUrl, '/uploads/multipart', {
        method: 'POST',
        body: JSON.stringify({ ...describe(file), part_size: partSizeFor(file.size) }),
      });
      if (signal?.aborted) {
        await apiFetch(baseUrl, `/uploads/${r.ticket_id}`, { method: 'DELETE' }).catch(() => {});
        throw new DOMException('Upload cancelled', 'AbortError');
      }
      tickets.set(file.id, { ticketId: r.ticket_id, uploadId: r.upload_id });
      return { uploadId: r.upload_id, key: r.key };
    },

    // uploadId and key arrive from Uppy but are not forwarded: the server reads them
    // from the ticket.
    async signPart(file, { partNumber, signal }) {
      return apiFetch(baseUrl, `/uploads/multipart/${tickets.get(file.id)?.ticketId}/sign-part`, {
        method: 'POST', signal, body: JSON.stringify({ part_number: partNumber }),
      });
    },

    async listParts(file, { signal }) {
      const r = await apiFetch(baseUrl, `/uploads/multipart/${tickets.get(file.id)?.ticketId}/parts`, { signal });
      return r.parts;
    },

    async completeMultipartUpload(file, { parts, signal }) {
      const entry = tickets.get(file.id);
      if (!entry) throw new DOMException('Upload cancelled', 'AbortError');
      const { ticketId } = entry;                   // captured before the await
      const r = await completeWithRetry(() => apiFetch(baseUrl, `/uploads/multipart/${ticketId}/complete`, {
        method: 'POST',
        signal,
        body: JSON.stringify({ parts: parts.map(({ PartNumber, ETag }) => ({ PartNumber, ETag })) }),
      }), signal, retryDelays);
      settle(file.id, ticketId, r);
      return { location: r.location };
    },

    // Reached on removal and on any upload error (Uppy aborts rather than retries).
    // `uploadId` is Uppy's handle for the attempt being aborted, so a stale abort can
    // never take a newer attempt's ticket with it.
    async abortMultipartUpload(file, { uploadId }) {
      const t = tickets.get(file.id);
      if (!t || t.uploadId !== uploadId) return;
      tickets.delete(file.id);
      await apiFetch(baseUrl, `/uploads/${t.ticketId}`, { method: 'DELETE' }).catch(() => {});
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
