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

import {
  getOrCreateUploadLedger,
  acknowledgeChunk,
  isChunkAcknowledged,
  markCorrectionAttempted,
  clearLedger,
} from '../upload-ledger';

describe('upload-ledger', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('creates a fresh random id with an empty ledger on first use', () => {
    const ledger = getOrCreateUploadLedger('ns', 'md5-a', 1000, 100, 10);

    expect(typeof ledger.uploadId).toBe('string');
    expect(ledger.uploadId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(ledger.ackedChunks).toEqual([]);
    expect(ledger.correctionAttempted).toBe(false);
  });

  test('a second call for the same file returns the same id and preserves acked chunks', () => {
    const first = getOrCreateUploadLedger('ns', 'md5-a', 1000, 100, 10);
    acknowledgeChunk(first, 0);
    acknowledgeChunk(first, 1);

    const second = getOrCreateUploadLedger('ns', 'md5-a', 1000, 100, 10);

    expect(second.uploadId).toBe(first.uploadId);
    expect(second.ackedChunks).toEqual([0, 1]);
  });

  test('acknowledging the same index twice does not duplicate it', () => {
    const ledger = getOrCreateUploadLedger('ns', 'md5-a', 1000, 100, 10);
    acknowledgeChunk(ledger, 3);
    acknowledgeChunk(ledger, 3);

    expect(ledger.ackedChunks).toEqual([3]);
    expect(isChunkAcknowledged(ledger, 3)).toBe(true);
    expect(isChunkAcknowledged(ledger, 4)).toBe(false);
  });

  test('isChunkAcknowledged is false for a null ledger', () => {
    expect(isChunkAcknowledged(null, 0)).toBe(false);
  });

  test('a ledger older than the TTL is discarded for a fresh one', () => {
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1000);
    const first = getOrCreateUploadLedger('ns', 'md5-a', 1000, 100, 10, 5000);
    acknowledgeChunk(first, 0);

    nowSpy.mockReturnValue(1000 + 5001);
    const second = getOrCreateUploadLedger('ns', 'md5-a', 1000, 100, 10, 5000);

    expect(second.uploadId).not.toBe(first.uploadId);
    expect(second.ackedChunks).toEqual([]);

    nowSpy.mockRestore();
  });

  test('a chunkSize change discards the ledger for a fresh one', () => {
    const first = getOrCreateUploadLedger('ns', 'md5-a', 1000, 100, 10);
    acknowledgeChunk(first, 0);

    const second = getOrCreateUploadLedger('ns', 'md5-a', 1000, 200, 5);

    expect(second.uploadId).not.toBe(first.uploadId);
    expect(second.ackedChunks).toEqual([]);
  });

  test('a totalChunks change discards the ledger for a fresh one', () => {
    const first = getOrCreateUploadLedger('ns', 'md5-a', 1000, 100, 10);
    acknowledgeChunk(first, 0);

    const second = getOrCreateUploadLedger('ns', 'md5-a', 1000, 100, 11);

    expect(second.uploadId).not.toBe(first.uploadId);
  });

  test('different namespaces for the same file do not collide', () => {
    const a = getOrCreateUploadLedger('slot-a', 'md5-a', 1000, 100, 10);
    const b = getOrCreateUploadLedger('slot-b', 'md5-a', 1000, 100, 10);

    expect(a.uploadId).not.toBe(b.uploadId);
  });

  test('markCorrectionAttempted clears ackedChunks and keeps the same id', () => {
    const ledger = getOrCreateUploadLedger('ns', 'md5-a', 1000, 100, 10);
    acknowledgeChunk(ledger, 0);
    acknowledgeChunk(ledger, 1);
    const uploadId = ledger.uploadId;

    const corrected = markCorrectionAttempted(ledger);

    expect(corrected.uploadId).toBe(uploadId);
    expect(corrected.ackedChunks).toEqual([]);
    expect(corrected.correctionAttempted).toBe(true);

    // and it's actually persisted, not just mutated in memory
    const reread = getOrCreateUploadLedger('ns', 'md5-a', 1000, 100, 10);
    expect(reread.correctionAttempted).toBe(true);
    expect(reread.ackedChunks).toEqual([]);
  });

  test('clearLedger removes the entry so the next call creates a brand new one', () => {
    const first = getOrCreateUploadLedger('ns', 'md5-a', 1000, 100, 10);
    acknowledgeChunk(first, 0);

    clearLedger('ns', 'md5-a', 1000);

    const second = getOrCreateUploadLedger('ns', 'md5-a', 1000, 100, 10);
    expect(second.uploadId).not.toBe(first.uploadId);
    expect(second.ackedChunks).toEqual([]);
  });
});
