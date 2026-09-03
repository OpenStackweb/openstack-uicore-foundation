/**
 * Copyright 2018 OpenStack Foundation
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

import { putOnLocalStorage, getFromLocalStorage, removeFromLocalStorage } from '../../../utils/methods';

const LEDGER_KEY_PREFIX = 'dz_resume_ledger_v1';

// Must stay shorter than file-upload-api's ABANDONED_UPLOAD_RETENTION_SECONDS
// (1hr default) so the client never resumes against chunks the server's reaper
// already deleted.
export const UPLOAD_LEDGER_TTL_MS = 30 * 60 * 1000;

// Mirrors Dropzone.uuidv4() byte-for-byte without importing the 'dropzone' package
// here - a plain uuid4 is what file-upload-api's sanitize_upload_id (Django slugify)
// passes through unchanged.
const uuidv4 = () =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });

const buildKey = (namespace, fileMd5, fileSize) =>
    `${LEDGER_KEY_PREFIX}:${namespace || 'default'}:${fileMd5}:${fileSize}`;

const readLedger = (key) => {
    const raw = getFromLocalStorage(key);
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (e) {
        return null;
    }
};

const writeLedger = (ledger) => {
    const { _key, ...persisted } = ledger;
    putOnLocalStorage(_key, JSON.stringify(persisted));
};

/**
 * Loads the persisted ledger for a physical file (identified by content, not name,
 * so a retry resumes even if the file is re-selected under a different name) within
 * a caller-supplied namespace, or creates a fresh one. A stored ledger is discarded
 * (fresh random id, empty ackedChunks) when it is older than UPLOAD_LEDGER_TTL_MS, or
 * when chunkSize/totalChunks no longer match - reusing an id under a different chunk
 * size is what triggers the server's `dztotalchunkcount changed` 412.
 */
export const getOrCreateUploadLedger = (namespace, fileMd5, fileSize, chunkSize, totalChunks, ttlMs = UPLOAD_LEDGER_TTL_MS) => {
    const key = buildKey(namespace, fileMd5, fileSize);
    const existing = readLedger(key);
    const now = Date.now();

    const isFresh =
        !!existing &&
        now - existing.createdAt < ttlMs &&
        existing.chunkSize === chunkSize &&
        existing.totalChunks === totalChunks;

    if (isFresh) return { ...existing, _key: key };

    const ledger = {
        uploadId: uuidv4(),
        chunkSize,
        totalChunks,
        ackedChunks: [],
        createdAt: now,
        correctionAttempted: false,
        _key: key,
    };
    writeLedger(ledger);
    return ledger;
};

export const acknowledgeChunk = (ledger, chunkIndex) => {
    if (!ledger || ledger.ackedChunks.includes(chunkIndex)) return ledger;
    ledger.ackedChunks.push(chunkIndex);
    writeLedger(ledger);
    return ledger;
};

export const isChunkAcknowledged = (ledger, chunkIndex) =>
    !!ledger && ledger.ackedChunks.includes(chunkIndex);

/**
 * One bounded self-correction pass: the client believed every acked index was held
 * by the server, but it wasn't. Clears that belief without discarding the upload id,
 * so the next pass re-sends exactly the previously-skipped chunks under the same id.
 */
export const markCorrectionAttempted = (ledger) => {
    if (!ledger) return ledger;
    ledger.correctionAttempted = true;
    ledger.ackedChunks = [];
    writeLedger(ledger);
    return ledger;
};

export const clearLedger = (namespace, fileMd5, fileSize) => {
    removeFromLocalStorage(buildKey(namespace, fileMd5, fileSize));
};
