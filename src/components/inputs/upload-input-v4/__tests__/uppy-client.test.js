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

import '../__fixtures__/jsdom-polyfills';
import { getAccessToken, initLogOut } from '../../../security/methods';
import { AUTH_ERROR_REFRESH_TOKEN_NETWORK_ERROR } from '../../../security/constants';
import { getMD5 } from '../../../../utils/crypto';
import { createFakeFileApi, deferred, waitUntil } from '../__fixtures__/fake-file-api';
import { buildUppy } from '../uppy-client';

jest.mock('../../../security/methods', () => ({
  getAccessToken: jest.fn(),
  initLogOut: jest.fn(),
}));

jest.mock('../../../../utils/crypto', () => ({
  getMD5: jest.fn(),
}));

const BASE = 'https://files.test/api/v1/files';
const MiB = 2 ** 20;

const fileOf = (name, size, type = 'image/png') => new File([new Uint8Array(size)], name, { type, lastModified: 1 });
const add = (instance, file) => instance.addFile({ name: file.name, type: file.type, data: file, source: 'local' });
const tick = () => new Promise((resolve) => setTimeout(resolve, 20));

let api;
let uppy;
let onTicket;
let errors;

const start = (options = {}) => {
  onTicket = jest.fn();
  errors = [];
  uppy = buildUppy({ baseUrl: BASE, onTicket, retryDelays: [0, 0, 0, 0], ...options });
  uppy.on('upload-error', (file, err) => errors.push({ id: file.id, message: err.message }));
  return uppy;
};

const delivered = (count = 1) => waitUntil(() => onTicket.mock.calls.length === count, `${count} delivery(ies)`);
const failed = (count = 1) => waitUntil(() => errors.length === count, `${count} upload error(s)`);
const deletes = () => api.calls('DELETE', /.*/).map((r) => r.path);

beforeEach(() => {
  api = createFakeFileApi(BASE);
  api.install();
  getAccessToken.mockReset().mockResolvedValue('token');
  initLogOut.mockReset();
  getMD5.mockReset().mockImplementation(async (file) => `md5-${file.name}`);
});

afterEach(() => {
  uppy?.destroy();
  uppy = undefined;
  api.uninstall();
});

describe('buildUppy, single uploads', () => {
  test('creates, PUTs and completes, then delivers the Contract A body unmodified', async () => {
    start();
    const id = add(uppy, fileOf('photo.png', 1024));
    await delivered();

    expect(api.log()).toEqual([
      'POST /uploads/single',
      'PUT https://bucket.test/upload/t1/photo.png',
      'POST /uploads/single/t1/complete',
    ]);
    expect(api.calls('POST', /^\/uploads\/single$/)[0].body).toEqual({
      filename: 'photo.png', content_type: 'image/png', size: 1024, md5: 'md5-photo.png',
    });
    const [file, body] = onTicket.mock.calls[0];
    expect(file.id).toBe(id);
    expect(body).toBe(api.calls('POST', /\/complete$/)[0].response);
  });

  test('each file completes as soon as its own PUT lands, and only once', async () => {
    const held = deferred();
    api.respond('PUT', /\/slow\.png$/, () => held.promise);
    start();
    const fast = add(uppy, fileOf('fast.png', 10));
    add(uppy, fileOf('slow.png', 20));
    await delivered();

    expect(onTicket.mock.calls[0][0].id).toBe(fast);
    held.resolve(api.reply(200, null, { etag: '"etag-slow"' }));
    await delivered(2);
    await tick();
    expect(api.calls('POST', /\/complete$/)).toHaveLength(2);
  });

  test('sends no OAuth header to the presigned URL and a Bearer token on every file API call', async () => {
    start();
    add(uppy, fileOf('a.png', 10));
    await delivered();

    expect(api.puts()).toHaveLength(1);
    api.puts().forEach((put) => {
      expect(Object.keys(put.headers).map((h) => h.toLowerCase())).not.toContain('authorization');
    });
    api.fetches().forEach((req) => expect(req.headers.Authorization).toBe('Bearer token'));
  });

  test('refetches the token for each file API call', async () => {
    getAccessToken.mockResolvedValueOnce('tok-1').mockResolvedValueOnce('tok-2');
    start();
    add(uppy, fileOf('a.png', 10));
    await delivered();

    expect(api.fetches().map((r) => r.headers.Authorization)).toEqual(['Bearer tok-1', 'Bearer tok-2']);
    expect(getAccessToken).toHaveBeenCalledTimes(2);
  });

  test('the PUT sends exactly the Content-Type the file API signed, even for an untyped file', async () => {
    api.respond('POST', /^\/uploads\/single$/, () => api.reply(201, {
      ticket_id: 't9', method: 'PUT', url: 'https://bucket.test/upload/t9/notes', headers: { 'Content-Type': 'application/x-signed' },
    }));
    start();
    add(uppy, fileOf('notes', 10, ''));
    await waitUntil(() => api.puts().length === 1, 'the PUT');

    expect(api.calls('POST', /^\/uploads\/single$/)[0].body.content_type).toBe('application/octet-stream');
    expect(api.puts()[0].headers).toEqual({ 'Content-Type': 'application/x-signed' });
  });

  test('md5 is on the create request even when hashing is slow', async () => {
    getMD5.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve('slow-md5'), 30)));
    start();
    add(uppy, fileOf('a.png', 10));
    await waitUntil(() => api.calls('POST', /^\/uploads\/single$/).length === 1, 'the create');

    expect(api.calls('POST', /^\/uploads\/single$/)[0].body.md5).toBe('slow-md5');
  });

  test('a transient token failure is an upload error, not a logout', async () => {
    getAccessToken.mockRejectedValueOnce(new Error(AUTH_ERROR_REFRESH_TOKEN_NETWORK_ERROR));
    start();
    const id = add(uppy, fileOf('a.png', 10));
    await failed();

    expect(errors[0]).toEqual({ id, message: AUTH_ERROR_REFRESH_TOKEN_NETWORK_ERROR });
    expect(initLogOut).not.toHaveBeenCalled();
    expect(api.requests).toHaveLength(0);
  });

  test('a genuine token failure logs out once', async () => {
    getAccessToken.mockRejectedValueOnce(new Error('AUTH_ERROR_MISSING_REFRESH_TOKEN'));
    start();
    add(uppy, fileOf('a.png', 10));
    await failed();

    expect(initLogOut).toHaveBeenCalledTimes(1);
  });

  test('an HTTP 401 from the file API is an upload error, not a logout', async () => {
    api.respond('POST', /^\/uploads\/single$/, () => api.reply(401, { message: 'invalid token scope' }));
    start();
    add(uppy, fileOf('a.png', 10));
    await failed();

    expect(errors[0].message).toBe('invalid token scope');
    expect(initLogOut).not.toHaveBeenCalled();
    expect(api.puts()).toHaveLength(0);
  });

  test('a 412 on one single completion fails that file only', async () => {
    api.respond('POST', /^\/uploads\/single\/([^/]+)\/complete$/, () => api.reply(412, { message: 'checksum mismatch' }), {
      when: (_, [, ticketId]) => api.ticket(ticketId).filename === 'a.png',
    });
    start();
    const a = add(uppy, fileOf('a.png', 10));
    const b = add(uppy, fileOf('b.png', 20));
    await waitUntil(() => errors.length === 1 && onTicket.mock.calls.length === 1, 'one failure and one delivery');

    expect(errors[0]).toEqual({ id: a, message: 'checksum mismatch' });
    expect(uppy.getFile(a).error).toBe('checksum mismatch');
    expect(onTicket.mock.calls[0][0].id).toBe(b);
  });

  test('a completion that keeps failing is retried, and a user retry finishes it without a second PUT', async () => {
    api.respond('POST', /^\/uploads\/single\/t1\/complete$/, () => api.reply(500, { message: 'boom' }), { times: 5 });
    start();
    const id = add(uppy, fileOf('a.png', 10));
    await failed();
    expect(api.calls('POST', /\/complete$/)).toHaveLength(5);   // one try and four retries

    await uppy.retryAll();

    expect(api.calls('POST', /^\/uploads\/single$/)).toHaveLength(1);
    expect(api.puts()).toHaveLength(1);
    expect(api.calls('POST', /\/complete$/)).toHaveLength(6);
    expect(onTicket).toHaveBeenCalledTimes(1);
    expect(uppy.getFile(id).error).toBeFalsy();
  });

  test('a rejected single completion restarts the whole upload on retry', async () => {
    api.respond('POST', /^\/uploads\/single\/t1\/complete$/, () => api.reply(412, { message: 'size mismatch' }), { times: 1 });
    start();
    const id = add(uppy, fileOf('a.png', 10));
    await failed();
    expect(uppy.getFile(id).progress.uploadComplete).toBe(false);

    await uppy.retryAll();

    expect(getMD5).toHaveBeenCalledTimes(2);
    expect(api.calls('POST', /^\/uploads\/single$/)).toHaveLength(2);
    expect(api.puts()).toHaveLength(2);
    expect(onTicket).toHaveBeenCalledTimes(1);
    expect(onTicket.mock.calls[0][1].path).toBe('upload/2026-10-11/t2/');
  });

  test.each([
    ['a 503', () => api.respond('POST', /^\/uploads\/single\/t1\/complete$/, () => api.reply(503, { message: 'busy' }), { times: 1 })],
    ['a token network failure', () => getAccessToken
      .mockResolvedValueOnce('token')
      .mockRejectedValueOnce(new Error(AUTH_ERROR_REFRESH_TOKEN_NETWORK_ERROR))],
  ])('%s at completion keeps the ticket, and retry only completes', async (_, arrange) => {
    arrange();
    start({ retryDelays: [] });
    const id = add(uppy, fileOf('a.png', 10));
    await failed();
    expect(uppy.getFile(id).progress.uploadComplete).toBe(true);

    await uppy.retryAll();

    expect(api.calls('POST', /^\/uploads\/single$/)).toHaveLength(1);
    expect(api.puts()).toHaveLength(1);
    expect(onTicket).toHaveBeenCalledTimes(1);
    expect(initLogOut).not.toHaveBeenCalled();
  });

  test.each([200, 412])('a stale %i completion after remove and re-add leaves the new attempt alone', async (staleStatus) => {
    const stale = deferred();
    api.respond('POST', /^\/uploads\/single\/t1\/complete$/, () => stale.promise, { times: 1 });
    start();
    const file = fileOf('a.png', 10);
    const id = add(uppy, file);
    await waitUntil(() => api.calls('POST', /t1\/complete$/).length === 1, 'the first completion in flight');

    uppy.removeFile(id);
    expect(add(uppy, file)).toBe(id);      // same id: only the ticket tells the attempts apart
    await delivered();
    stale.resolve(staleStatus === 200 ? api.reply(200, api.contractA('t1')) : api.reply(412, { message: 'gone' }));
    await waitUntil(() => api.calls('POST', /t1\/complete$/)[0].settled, 'the stale completion');
    await tick();

    expect(onTicket).toHaveBeenCalledTimes(1);
    expect(onTicket.mock.calls[0][1].path).toBe('upload/2026-10-11/t2/');
    expect(deletes()).toEqual(['/uploads/t1']);
    expect(uppy.getFile(id).error).toBeFalsy();
    expect(uppy.getFile(id).progress.uploadComplete).toBe(true);
    expect(errors).toHaveLength(0);
  });

  test('removing a file after its PUT stored, while completion is in flight, purges it and delivers nothing', async () => {
    const pending = deferred();
    api.respond('POST', /^\/uploads\/single\/t1\/complete$/, () => pending.promise, { times: 1 });
    start();
    const id = add(uppy, fileOf('a.png', 10));
    await waitUntil(() => api.calls('POST', /t1\/complete$/).length === 1, 'the completion in flight');

    uppy.removeFile(id);
    await waitUntil(() => deletes().length === 1, 'the purge');
    pending.resolve(api.reply(200, api.contractA('t1')));
    await waitUntil(() => api.calls('POST', /t1\/complete$/)[0].settled, 'the late completion');
    await tick();

    expect(onTicket).not.toHaveBeenCalled();
    expect(deletes()).toEqual(['/uploads/t1']);
  });

  test('a delivered ticket is never DELETEd, by removeFile or by destroy', async () => {
    start();
    const id = add(uppy, fileOf('a.png', 10));
    await delivered();

    uppy.removeFile(id);
    uppy.destroy();
    uppy = undefined;
    await tick();

    expect(deletes()).toEqual([]);
  });

  test('a completion that resolves after destroy delivers nothing', async () => {
    const pending = deferred();
    api.respond('POST', /^\/uploads\/single\/t1\/complete$/, () => pending.promise, { times: 1 });
    start();
    add(uppy, fileOf('a.png', 10));
    await waitUntil(() => api.calls('POST', /t1\/complete$/).length === 1, 'the completion in flight');

    uppy.destroy();
    uppy = undefined;
    pending.resolve(api.reply(200, api.contractA('t1')));
    await waitUntil(() => api.calls('POST', /t1\/complete$/)[0].settled, 'the late completion');
    await tick();

    expect(onTicket).not.toHaveBeenCalled();
    expect(deletes()).toEqual(['/uploads/t1']);
  });

  test('one unreadable file does not block the batch, and retry re-hashes it', async () => {
    // getMD5 rejects with a bare string when FileReader fails (src/utils/crypto.js).
    getMD5.mockImplementation(async (file) => {
      if (file.name === 'bad.png') throw 'Error reading the file';  // eslint-disable-line no-throw-literal
      return `md5-${file.name}`;
    });
    start();
    const bad = add(uppy, fileOf('bad.png', 10));
    const good = add(uppy, fileOf('good.png', 20));
    await waitUntil(() => errors.length === 1 && onTicket.mock.calls.length === 1, 'one failure and one delivery');

    expect(onTicket.mock.calls[0][0].id).toBe(good);
    expect(errors[0]).toEqual({ id: bad, message: 'Could not hash file: Error reading the file' });

    getMD5.mockImplementation(async (file) => `md5-${file.name}`);
    await uppy.retryAll();

    expect(onTicket).toHaveBeenCalledTimes(2);
    expect(onTicket.mock.calls[1][0].id).toBe(bad);
  });
});

describe('buildUppy, multipart uploads', () => {
  // 11 MiB over a 10 MiB threshold: three parts of 5, 5 and 1 MiB.
  const big = (name = 'talk.mp4') => fileOf(name, 11 * MiB, 'video/mp4');
  const startMultipart = (options = {}) => start({ multipartThreshold: 10 * MiB, ...options });

  test('signs, PUTs and completes each part at the declared part size, then delivers', async () => {
    startMultipart();
    const id = add(uppy, big());
    await delivered();

    const create = api.calls('POST', /^\/uploads\/multipart$/)[0].body;
    expect(create).toEqual({
      filename: 'talk.mp4', content_type: 'video/mp4', size: 11 * MiB, md5: 'md5-talk.mp4', part_size: 5 * MiB,
    });
    const sizes = api.puts().map((put) => put.size);
    expect(sizes).toEqual([5 * MiB, 5 * MiB, MiB]);
    sizes.slice(0, -1).forEach((size) => expect(size).toBe(create.part_size));
    expect(api.calls('POST', /sign-part$/).map((r) => r.body).sort((x, y) => x.part_number - y.part_number))
      .toEqual([{ part_number: 1 }, { part_number: 2 }, { part_number: 3 }]);
    const complete = api.calls('POST', /^\/uploads\/multipart\/t1\/complete$/);
    expect(complete).toHaveLength(1);
    expect(complete[0].body.parts.map((p) => p.PartNumber)).toEqual([1, 2, 3]);
    complete[0].body.parts.forEach((part) => expect(Object.keys(part).sort()).toEqual(['ETag', 'PartNumber']));
    const [file, body] = onTicket.mock.calls[0];
    expect(file.id).toBe(id);
    expect(body).toBe(complete[0].response);
  });

  test('a failed part PUT retries only that part', async () => {
    api.respond('PUT', /partNumber=2$/, () => api.reply(500), { times: 1 });
    startMultipart();
    add(uppy, big());
    await delivered();

    expect(api.calls('POST', /^\/uploads\/multipart$/)).toHaveLength(1);
    expect(api.puts().map((put) => put.url.split('=').pop()).sort()).toEqual(['1', '2', '2', '3']);
  });

  test('removing a file while its create is in flight lets the create finish, then DELETEs that ticket', async () => {
    const create = deferred();
    api.respond('POST', /^\/uploads\/multipart$/, (req) => create.promise.then(() => api.reply(201, {
      ticket_id: 't1', upload_id: 'upload-t1', key: `upload/2026-10-11/t1/${req.body.filename}`,
    })), { times: 1 });
    startMultipart();
    const id = add(uppy, big());
    await waitUntil(() => api.calls('POST', /^\/uploads\/multipart$/).length === 1, 'the create in flight');

    uppy.removeFile(id);
    create.resolve();
    await waitUntil(() => deletes().length === 1, 'the cleanup');
    await tick();

    expect(api.calls('POST', /^\/uploads\/multipart$/)[0].signalled).toBe(false);
    expect(deletes()).toEqual(['/uploads/t1']);
    expect(api.calls('POST', /sign-part$/)).toHaveLength(0);
    expect(onTicket).not.toHaveBeenCalled();
  });

  test('a transient completion failure is retried without re-uploading', async () => {
    api.respond('POST', /^\/uploads\/multipart\/t1\/complete$/, () => api.reply(503, { message: 'busy' }), { times: 1 });
    startMultipart();
    add(uppy, big());
    await delivered();

    expect(api.calls('POST', /^\/uploads\/multipart$/)).toHaveLength(1);
    expect(api.puts()).toHaveLength(3);
    expect(api.calls('POST', /\/complete$/)).toHaveLength(2);
    expect(onTicket).toHaveBeenCalledTimes(1);
  });

  test('a 412 on completion is not retried; the file errors and its upload is aborted', async () => {
    api.respond('POST', /^\/uploads\/multipart\/t1\/complete$/, () => api.reply(412, { message: 'invalid part' }), { times: 1 });
    startMultipart();
    const id = add(uppy, big());
    await failed();
    await waitUntil(() => deletes().length === 1, 'the abort');

    expect(api.calls('POST', /\/complete$/)).toHaveLength(1);
    expect(errors[0]).toEqual({ id, message: 'invalid part' });
    expect(deletes()).toEqual(['/uploads/t1']);
    expect(onTicket).not.toHaveBeenCalled();
  });

  test('a delivered multipart ticket is never DELETEd, by removeFile or by destroy', async () => {
    startMultipart();
    const id = add(uppy, big());
    await delivered();

    uppy.removeFile(id);
    uppy.destroy();
    uppy = undefined;
    await tick();

    expect(deletes()).toEqual([]);
  });

  test('removing a file while its completion is in flight DELETEs once and delivers nothing', async () => {
    const pending = deferred();
    api.respond('POST', /^\/uploads\/multipart\/t1\/complete$/, () => pending.promise, { times: 1 });
    startMultipart();
    const id = add(uppy, big());
    await waitUntil(() => api.calls('POST', /t1\/complete$/).length === 1, 'the completion in flight');

    uppy.removeFile(id);
    pending.resolve(api.reply(200, api.contractA('t1')));
    await waitUntil(() => deletes().length === 1, 'the cleanup');
    await tick();

    expect(deletes()).toEqual(['/uploads/t1']);
    expect(onTicket).not.toHaveBeenCalled();
  });

  test('resuming a paused upload lists the stored parts and does not PUT them again', async () => {
    const parts23 = deferred();
    api.respond('PUT', /partNumber=[23]$/, () => parts23.promise, { times: 2 });
    api.respond('GET', /^\/uploads\/multipart\/t1\/parts$/, () => api.reply(200, {
      parts: [{ PartNumber: 1, Size: 5 * MiB, ETag: '"etag-1"' }],
    }));
    startMultipart();
    const id = add(uppy, big());
    await waitUntil(() => api.puts().length === 3 && api.puts().find((put) => put.url.endsWith('partNumber=1')).settled, 'part 1 stored and parts 2-3 in flight');

    uppy.pauseResume(id);
    uppy.pauseResume(id);
    await delivered();

    expect(api.calls('GET', /\/parts$/)).toHaveLength(1);
    expect(api.puts().filter((put) => put.url.endsWith('partNumber=1'))).toHaveLength(1);
    const { parts } = api.calls('POST', /t1\/complete$/)[0].body;
    expect(parts[0]).toEqual({ PartNumber: 1, ETag: '"etag-1"' });
  });
});
