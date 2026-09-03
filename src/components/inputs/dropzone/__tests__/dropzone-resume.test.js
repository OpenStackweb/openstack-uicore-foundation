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

import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { DropzoneJS } from '../index';
import { getOrCreateUploadLedger, acknowledgeChunk, isChunkAcknowledged } from '../upload-ledger';

jest.mock('../../../security/methods', () => ({
  getAccessToken: jest.fn(() => Promise.resolve('mock-token')),
  initLogOut: jest.fn()
}));

jest.mock('../../../../utils/crypto', () => ({
  getMD5: jest.fn(() => Promise.resolve('mock-md5-hash'))
}));

// A separate mock module instance from dropzone.test.js's - each test file gets its own
// jest module registry, so extending this shape (vs. the other suite's) carries no risk
// of changing behavior other tests already rely on.
let mockCapturedOptions = {};
// _originalUploadData ends up as a bound-native-function (not a jest mock, since
// Function.prototype.bind on a jest.fn() drops its .mock tracking) - assertions use
// this captured reference to the pre-bind mock instead.
let mockUploadDataFn;

jest.mock('dropzone', () => {
  return jest.fn().mockImplementation((element, options) => {
    mockCapturedOptions = options;
    mockUploadDataFn = jest.fn();
    const dz = {
      options,
      _uploadData: mockUploadDataFn,
      _getChunk: jest.fn((file, xhr) =>
        (file.upload?.chunks || []).find((c) => c && c.xhr === xhr)
      ),
      uploadFiles: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      destroy: jest.fn(() => null),
      getActiveFiles: jest.fn(() => [])
    };
    dz.emit = jest.fn((event, ...args) => {
      dz.on.mock.calls
        .filter(([evt]) => evt === event)
        .forEach(([, handler]) => handler(...args));
    });
    return dz;
  });
});

const getEventHandler = (instance, eventName) => {
  const call = instance.dropzone.on.mock.calls
    .slice()
    .reverse()
    .find(([evt]) => evt === eventName);
  return call ? call[1] : null;
};

describe('DropzoneJS - Resumable Chunked Uploads', () => {
  const defaultProps = {
    id: 'test-namespace',
    config: { postUrl: 'https://example.com/upload' },
    djsConfig: { chunking: true, chunkSize: 1000, maxFilesize: 100 },
    eventHandlers: {},
    data: {},
    uploadCount: 0
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCapturedOptions = {};
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  const mountInstance = (props = {}) => {
    const ref = React.createRef();
    render(<DropzoneJS {...defaultProps} {...props} ref={ref} onUploadComplete={jest.fn()} onError={jest.fn()} />);
    return ref.current;
  };

  test('accept() reassigns dzuuid to the ledger id and seeds progress from acked chunks', async () => {
    const seeded = getOrCreateUploadLedger('test-namespace', 'mock-md5-hash', 5000, 1000, 5);
    acknowledgeChunk(seeded, 0);
    acknowledgeChunk(seeded, 1);

    const instance = mountInstance();
    const file = { name: 'video.mp4', size: 5000, upload: { uuid: 'dropzone-own-random-uuid' } };

    await mockCapturedOptions.accept(file, jest.fn());

    expect(file.upload.uuid).toBe(seeded.uploadId);
    expect(file._resumeLedger.ackedChunks).toEqual([0, 1]);
    expect(file._completedBytes).toBe(2000);
    expect(instance.dropzone.emit).toHaveBeenCalledWith('uploadprogress', file, 40, 2000);
  });

  test('a fresh file (no prior ledger) gets a new random id and no progress seed', async () => {
    const instance = mountInstance();
    const file = { name: 'video.mp4', size: 5000, upload: { uuid: 'dropzone-own-random-uuid' } };

    await mockCapturedOptions.accept(file, jest.fn());

    expect(file.upload.uuid).not.toBe('dropzone-own-random-uuid');
    expect(file._resumeLedger.ackedChunks).toEqual([]);
    expect(file._completedBytes).toBeUndefined();
    expect(instance.dropzone.emit).not.toHaveBeenCalledWith('uploadprogress', expect.anything(), expect.anything(), expect.anything());
  });

  test('a chunk already acknowledged is skipped: never dispatched, never occupies a slot', () => {
    const ledger = getOrCreateUploadLedger('test-namespace', 'mock-md5-hash', 5000, 1000, 5);
    acknowledgeChunk(ledger, 0);

    const instance = mountInstance();
    const chunk0 = { index: 0 };
    const chunk1 = { index: 1 };
    const file = {
      name: 'video.mp4',
      size: 5000,
      _resumeLedger: ledger,
      upload: { chunks: [chunk0, chunk1], finishedChunkUpload: jest.fn() }
    };
    instance.chunksInFlight = 3;

    instance.dropzone._uploadData([file], [{ chunkIndex: 0 }]);

    expect(mockUploadDataFn).not.toHaveBeenCalled();
    expect(file.upload.finishedChunkUpload).toHaveBeenCalledWith(chunk0);
    expect(file._completedBytes).toBe(1000);
    // never took a concurrency slot, so there is none to release
    expect(instance.chunksInFlight).toBe(3);
  });

  test('a chunk not yet acknowledged is queued and dispatched for real', () => {
    const ledger = getOrCreateUploadLedger('test-namespace', 'mock-md5-hash', 5000, 1000, 5);
    acknowledgeChunk(ledger, 0);

    const instance = mountInstance();
    const file = {
      name: 'video.mp4',
      size: 5000,
      _resumeLedger: ledger,
      upload: { chunks: [{ index: 0 }, { index: 1 }], finishedChunkUpload: jest.fn() }
    };

    instance.dropzone._uploadData([file], [{ chunkIndex: 1 }]);

    expect(mockUploadDataFn).toHaveBeenCalledWith([file], [{ chunkIndex: 1 }]);
    expect(file.upload.finishedChunkUpload).not.toHaveBeenCalled();
  });

  test('a chunk response with status 0 (connection drop) is not acknowledged', () => {
    const ledger = getOrCreateUploadLedger('test-namespace', 'mock-md5-hash', 5000, 1000, 5);
    const instance = mountInstance();
    const mockXhr = {
      readyState: XMLHttpRequest.DONE,
      status: 0,
      responseText: '',
      setRequestHeader: jest.fn(),
      onload: jest.fn(),
      onerror: jest.fn(),
      abort: jest.fn()
    };
    const file = {
      name: 'video.mp4',
      size: 5000,
      _resumeLedger: ledger,
      upload: { chunked: true, chunks: [{ index: 0, xhr: mockXhr }] }
    };

    getEventHandler(instance, 'sending')(file, mockXhr, { append: jest.fn() });
    mockXhr.onload({});

    expect(isChunkAcknowledged(ledger, 0)).toBe(false);
  });

  test.each([200, 202])('a chunk response with status %i is acknowledged', (status) => {
    const ledger = getOrCreateUploadLedger('test-namespace', 'mock-md5-hash', 5000, 1000, 5);
    const instance = mountInstance();
    const mockXhr = {
      readyState: XMLHttpRequest.DONE,
      status,
      responseText: JSON.stringify({ done: 40, status: true }),
      setRequestHeader: jest.fn(),
      onload: jest.fn(),
      onerror: jest.fn(),
      abort: jest.fn()
    };
    const file = {
      name: 'video.mp4',
      size: 5000,
      _resumeLedger: ledger,
      upload: { chunked: true, chunks: [{ index: 2, xhr: mockXhr }] }
    };

    getEventHandler(instance, 'sending')(file, mockXhr, { append: jest.fn() });
    mockXhr.onload({});

    expect(isChunkAcknowledged(ledger, 2)).toBe(true);
  });

  test('an over-claiming ledger self-corrects once under the same id, then gives up cleanly with no error', () => {
    const instance = mountInstance();
    const ledger = getOrCreateUploadLedger('test-namespace', 'mock-md5-hash', 5000, 1000, 5);
    const originalId = ledger.uploadId;
    const file = {
      name: 'video.mp4',
      size: 5000,
      md5: 'mock-md5-hash',
      _resumeLedger: ledger,
      _resumeSkippedThisAttempt: true,
      _asyncProcessing: false,
      upload: { uuid: originalId }
    };
    const done = jest.fn();

    // First occurrence: same id, ackedChunks cleared, one clean re-drive.
    mockCapturedOptions.chunksUploaded(file, done);

    expect(instance.dropzone.uploadFiles).toHaveBeenCalledWith([file]);
    expect(file.upload.uuid).toBe(originalId);
    expect(file._resumeLedger.correctionAttempted).toBe(true);
    expect(file._resumeLedger.ackedChunks).toEqual([]);
    expect(file._completedBytes).toBe(0);
    expect(done).not.toHaveBeenCalled();
    expect(instance.dropzone.emit).not.toHaveBeenCalledWith('error', expect.anything(), expect.anything());

    // Second occurrence: the corrected pass ALSO came up short - discard the id,
    // start a clean full upload under a fresh one, still no error surfaced.
    file._resumeSkippedThisAttempt = true;
    instance.dropzone.uploadFiles.mockClear();

    mockCapturedOptions.chunksUploaded(file, done);

    expect(instance.dropzone.uploadFiles).toHaveBeenCalledWith([file]);
    expect(file.upload.uuid).not.toBe(originalId);
    expect(file._resumeLedger.ackedChunks).toEqual([]);
    expect(done).not.toHaveBeenCalled();
    expect(instance.dropzone.emit).not.toHaveBeenCalledWith('error', expect.anything(), expect.anything());
  });

  test('a genuinely completed resume (async 202) never enters the correction path', () => {
    const instance = mountInstance();
    const ledger = getOrCreateUploadLedger('test-namespace', 'mock-md5-hash', 5000, 1000, 5);
    const file = {
      name: 'video.mp4',
      size: 5000,
      _resumeLedger: ledger,
      _resumeSkippedThisAttempt: true,
      _asyncProcessing: true, // the last real chunk got a 202
      upload: { uuid: ledger.uploadId }
    };
    const done = jest.fn();

    mockCapturedOptions.chunksUploaded(file, done);

    expect(instance.dropzone.uploadFiles).not.toHaveBeenCalled();
    expect(file._chunksUploadedDone).toBe(done);
    expect(done).not.toHaveBeenCalled();
  });

  test('a chunkSize change starts a fresh upload id instead of reusing the old one', async () => {
    const instance = mountInstance();
    const file = { name: 'video.mp4', size: 5000, upload: {} };

    await mockCapturedOptions.accept(file, jest.fn());
    const firstId = file.upload.uuid;

    instance.dropzone.options.chunkSize = 2000;
    const file2 = { name: 'video.mp4', size: 5000, upload: {} };
    await mockCapturedOptions.accept(file2, jest.fn());

    expect(file2.upload.uuid).not.toBe(firstId);
  });

  test('a retried File keeps its md5 across accept() calls, so the same ledger is found', async () => {
    const instance = mountInstance();
    const file = { name: 'video.mp4', size: 5000, upload: {} };

    await mockCapturedOptions.accept(file, jest.fn());
    const firstId = file.upload.uuid;

    // Simulate removeFile + addFile reusing the same object: dropzone's native addFile
    // resets file.upload, but never touches file.md5.
    file.upload = { uuid: 'brand-new-native-random-uuid' };
    await mockCapturedOptions.accept(file, jest.fn());

    expect(file.upload.uuid).toBe(firstId);
  });
});
