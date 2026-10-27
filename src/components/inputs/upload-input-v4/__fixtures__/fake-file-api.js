/**
 * A fake of file-upload-api's direct-upload endpoints and of the presigned PUT to
 * Spaces, matching the REAL transports: control-plane calls go through fetch, and
 * @uppy/aws-s3 sends every PUT through XMLHttpRequest (its uploadPartBytes), never
 * fetch. Both land in one ordered request log.
 *
 * Every upload-input-v4 test builds its network from here, so a test runs real
 * @uppy/core and @uppy/aws-s3 against a server, never a hand-written Uppy mock that
 * encodes the author's model of Uppy instead of Uppy.
 *
 * Lives in __fixtures__ (not __tests__) so jest doesn't collect it as a suite.
 */

export const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

export const waitUntil = async (predicate, message = 'condition', timeout = 2000) => {
  const started = Date.now();
  for (;;) {
    const value = predicate();
    if (value) return value;
    if (Date.now() - started > timeout) throw new Error(`Timed out waiting for ${message}`);
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
};

const NETWORK_ERROR = Symbol('network error');

export const createFakeFileApi = (baseUrl) => {
  const requests = [];
  const overrides = [];
  const tickets = new Map();
  const saved = {};
  let ticketSeq = 0;
  let etagSeq = 0;

  const reply = (status, body = null, headers = {}) => ({ status, body, headers });

  const ticket = (id) => tickets.get(id)
    || { id, filename: 'unknown', content_type: 'application/octet-stream', size: 0 };

  // file-upload-api's completion body (Contract A). The fake keeps the client's filename
  // as `name`; the real server renames, which nothing on the client depends on.
  const contractA = (id, extra = {}) => {
    const t = ticket(id);
    return {
      status: 'complete',
      path: `upload/2026-10-11/${id}/`,
      name: t.filename,
      mime_type: t.content_type,
      source_bucket: 'file-upload-api-production',
      md5: t.md5 ?? null,
      size: t.size,
      original_name: t.filename,
      ...extra,
    };
  };

  const openTicket = (body) => {
    ticketSeq += 1;
    const id = `t${ticketSeq}`;
    tickets.set(id, { id, ...body });
    return id;
  };

  const defaultRoutes = [
    ['POST', /^\/uploads\/single$/, (req) => {
      const id = openTicket(req.body);
      return reply(201, {
        ticket_id: id,
        method: 'PUT',
        url: `https://bucket.test/upload/${id}/${req.body.filename}`,
        headers: { 'Content-Type': req.body.content_type },
      });
    }],
    ['POST', /^\/uploads\/single\/([^/]+)\/complete$/, (_, [, id]) => reply(200, contractA(id))],
    ['POST', /^\/uploads\/multipart$/, (req) => {
      const id = openTicket(req.body);
      return reply(201, { ticket_id: id, upload_id: `upload-${id}`, key: `upload/2026-10-11/${id}/${req.body.filename}` });
    }],
    ['POST', /^\/uploads\/multipart\/([^/]+)\/sign-part$/, (req, [, id]) => reply(200, {
      url: `https://bucket.test/upload/${id}?partNumber=${req.body.part_number}`,
      headers: {},
    })],
    ['GET', /^\/uploads\/multipart\/([^/]+)\/parts$/, () => reply(200, { parts: [] })],
    ['POST', /^\/uploads\/multipart\/([^/]+)\/complete$/, (_, [, id]) => reply(200, contractA(id, {
      location: `https://bucket.test/upload/${id}`,
    }))],
    ['DELETE', /^\/uploads\/([^/]+)$/, () => reply(204)],
    ['PUT', /^https:\/\/bucket\.test\//, () => {
      etagSeq += 1;
      return reply(200, null, { etag: `"etag-${etagSeq}"` });
    }],
  ];

  const targetOf = (req) => (req.via === 'xhr' ? req.url : req.path);

  // Overrides are matched (and their `times` spent) synchronously, before the handler's
  // promise settles, so two concurrent requests can never both take a one-shot override.
  const route = (req) => {
    const target = targetOf(req);
    for (const o of overrides) {
      if (o.times <= 0 || o.method !== req.method) continue;
      const match = target.match(o.pattern);
      if (!match || !o.when(req, match)) continue;
      o.times -= 1;
      return Promise.resolve().then(() => o.handler(req, match));
    }
    for (const [method, pattern, handler] of defaultRoutes) {
      const match = method === req.method && target.match(pattern);
      if (match) return Promise.resolve().then(() => handler(req, match));
    }
    return Promise.resolve(reply(404, { message: `no fake route for ${req.method} ${target}` }));
  };

  const fakeFetch = async (url, options = {}) => {
    const req = {
      via: 'fetch',
      method: (options.method || 'GET').toUpperCase(),
      path: url.startsWith(baseUrl) ? url.slice(baseUrl.length) : url,
      headers: { ...(options.headers || {}) },
      body: options.body ? JSON.parse(options.body) : undefined,
      signalled: Boolean(options.signal),
      settled: false,
    };
    requests.push(req);
    const { signal } = options;
    const abortError = () => new DOMException('The operation was aborted.', 'AbortError');
    if (signal?.aborted) {
      req.settled = true;
      throw abortError();
    }
    let res;
    try {
      res = await new Promise((resolve, reject) => {
        signal?.addEventListener('abort', () => reject(abortError()), { once: true });
        route(req).then(resolve, reject);
      });
    } finally {
      req.settled = true;
    }
    if (res === NETWORK_ERROR) throw new TypeError('Failed to fetch');
    req.status = res.status;
    req.response = res.body;
    return {
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
      json: async () => {
        if (res.body == null) throw new SyntaxError('Unexpected end of JSON input');
        return res.body;
      },
    };
  };

  class FakeXMLHttpRequest {
    constructor() {
      this.listeners = {};
      this.requestHeaders = {};
      this.responseHeaders = {};
      this.status = 0;
      this.responseText = '';
      this.upload = {
        addEventListener: (type, listener) => {
          if (type === 'progress') this.onUploadProgress = listener;
        },
      };
    }

    open(method, url) {
      this.method = method;
      this.url = url;
    }

    setRequestHeader(name, value) {
      this.requestHeaders[name] = value;
    }

    addEventListener(type, listener) {
      this.listeners[type] = listener;
    }

    getAllResponseHeaders() {
      return Object.entries(this.responseHeaders).map(([name, value]) => `${name}: ${value}`).join('\r\n');
    }

    abort() {
      if (this.done) return;
      this.done = true;
      this.req.aborted = true;
      this.req.settled = true;
      this.listeners.abort?.();
    }

    send(body) {
      const req = {
        via: 'xhr',
        method: this.method,
        url: this.url,
        headers: { ...this.requestHeaders },
        size: body?.size ?? 0,
        settled: false,
      };
      this.req = req;
      requests.push(req);
      route(req).then((res) => {
        if (this.done) return;
        this.done = true;
        req.settled = true;
        if (res === NETWORK_ERROR) {
          this.listeners.error?.({ target: this });
          return;
        }
        req.status = res.status;
        this.onUploadProgress?.({ loaded: req.size, total: req.size, lengthComputable: true });
        this.status = res.status;
        this.responseHeaders = res.headers;
        this.listeners.load?.();
      });
    }
  }

  return {
    install() {
      saved.fetch = global.fetch;
      saved.XMLHttpRequest = global.XMLHttpRequest;
      global.fetch = jest.fn(fakeFetch);
      global.XMLHttpRequest = FakeXMLHttpRequest;
    },
    uninstall() {
      global.fetch = saved.fetch;
      global.XMLHttpRequest = saved.XMLHttpRequest;
    },
    reply,
    networkError: () => NETWORK_ERROR,
    contractA,
    ticket,
    // handler(req, match) returns reply(...), networkError(), or a promise of either.
    respond(method, pattern, handler, { times = Infinity, when = () => true } = {}) {
      overrides.push({ method, pattern, handler, times, when });
    },
    requests,
    fetches: () => requests.filter((r) => r.via === 'fetch'),
    puts: () => requests.filter((r) => r.via === 'xhr'),
    calls: (method, pattern) => requests.filter((r) => r.method === method && pattern.test(targetOf(r))),
    log: () => requests.map((r) => `${r.method} ${targetOf(r)}`),
  };
};
