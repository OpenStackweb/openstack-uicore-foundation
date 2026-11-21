/**
 * Stand-ins for fetch(). A response offers arrayBuffer() and blob() the way a
 * browser's does. jsdom's Blob has no arrayBuffer(), so blob() gives a plain
 * object with one. Its type is generic, as servers often send it.
 */
const response = (bytes, { ok = true, status = 200 } = {}) => {
  const data = Uint8Array.from(bytes);
  return {
    ok,
    status,
    arrayBuffer: () => Promise.resolve(data.buffer),
    blob: () => Promise.resolve({
      type: 'application/octet-stream',
      arrayBuffer: () => Promise.resolve(data.buffer),
    }),
  };
};

// Answer every URL with these bytes.
export const serveBytes = (bytes, options) =>
  jest.fn(() => Promise.resolve(response(bytes, options)));

// Answer each URL with its bytes, and with a 404 for a URL not listed.
export const serveFiles = (filesByUrl) =>
  jest.fn((url) => Promise.resolve(
    filesByUrl[url] ? response(filesByUrl[url]) : response([], { ok: false, status: 404 }),
  ));

// A server that never answers: the fetch rejects only when it is aborted.
export const neverAnswers = () =>
  jest.fn((url, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new Error('aborted')));
  }));
