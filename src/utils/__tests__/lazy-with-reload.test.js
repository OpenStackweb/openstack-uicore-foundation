jest.mock("react", () => ({
    ...jest.requireActual("react"),
    lazy: jest.fn((loader) => loader),
}));

const mockCaptureMessage = jest.fn();
jest.mock("@sentry/react", () => ({
    captureMessage: (...args) => mockCaptureMessage(...args),
}));

// reloadOnChunkError's "once per page" guard is module-level state, so each
// test needs its own fresh module instance (see beforeEach below) - a static
// import would leak that guard across tests in file-declaration order.
let isChunkLoadError;
let reloadOnChunkError;
let lazyWithReload;
let initChunkErrorRecovery;
let chunkErrorSentryBeforeSend;

const chunkLoadError = () => Object.assign(new Error("Loading chunk 3 failed.\n(missing: https://app.test/foo_abc123.js)"), {
    name: "ChunkLoadError",
});

const htmlParsedAsScriptError = (filename) => Object.assign(
    new Error("Unexpected token '<'"),
    { name: "SyntaxError", filename }
);

// Replaces document's <script> tags so getBuildFingerprint() (cached per
// module instance) reads a specific, known set the next time a fresh
// module instance computes it.
const setDocumentScripts = (srcs) => {
    document.querySelectorAll("script[data-test-build]").forEach((el) => el.remove());
    srcs.forEach((src) => {
        const script = document.createElement("script");
        script.src = src;
        script.setAttribute("data-test-build", "1");
        document.body.appendChild(script);
    });
};

beforeEach(() => {
    window.sessionStorage.clear();
    window.SENTRY_DSN = "https://test.example/dsn";
    mockCaptureMessage.mockClear();
    console.error = jest.fn(); // eslint-disable-line no-console
    console.log = jest.fn(); // eslint-disable-line no-console
    delete window.location;
    window.location = { reload: jest.fn() };
    setDocumentScripts([]);

    jest.resetModules();
    // eslint-disable-next-line global-require
    ({
        isChunkLoadError,
        reloadOnChunkError,
        lazyWithReload,
        initChunkErrorRecovery,
        chunkErrorSentryBeforeSend,
    } = require("../lazy-with-reload"));
});

describe("isChunkLoadError", () => {
    test("matches webpack's ChunkLoadError by name, regardless of message", () => {
        expect(isChunkLoadError(chunkLoadError())).toBe(true);
    });

    test("does not match a SyntaxError with no filename (e.g. an unrelated JSON.parse failure)", () => {
        expect(isChunkLoadError(htmlParsedAsScriptError())).toBe(false);
    });

    test("matches a SyntaxError regardless of message wording, as long as the filename looks like a content-hashed chunk (cross-browser/locale independence)", () => {
        const error = Object.assign(new Error("expected expression, got '<'"), { name: "SyntaxError" });
        expect(
            isChunkLoadError(error, "https://app.test/static/dashboard_a1b2c3d4e5f6.js")
        ).toBe(true);
    });

    test("matches a SyntaxError for 'Unexpected token <' when the filename looks like a content-hashed chunk", () => {
        expect(
            isChunkLoadError(
                htmlParsedAsScriptError(),
                "https://app.test/static/dashboard_a1b2c3d4e5f6.js"
            )
        ).toBe(true);
    });

    test("does not match a SyntaxError for 'Unexpected token <' when the filename does not look like a chunk", () => {
        expect(
            isChunkLoadError(
                htmlParsedAsScriptError(),
                "https://app.test/static/vendor.min.js"
            )
        ).toBe(false);
    });

    test("does not match an unrelated error", () => {
        expect(isChunkLoadError(new TypeError("x is not a function"))).toBe(false);
    });

    test("does not match null/undefined", () => {
        expect(isChunkLoadError(null)).toBe(false);
        expect(isChunkLoadError(undefined)).toBe(false);
    });

    test("accepts a custom chunk filename pattern", () => {
        const customPattern = /^\/legacy-chunks\//;
        expect(
            isChunkLoadError(
                htmlParsedAsScriptError(),
                "/legacy-chunks/dashboard.js",
                customPattern
            )
        ).toBe(true);
        expect(
            isChunkLoadError(
                htmlParsedAsScriptError(),
                "/static/dashboard_a1b2c3d4.js",
                customPattern
            )
        ).toBe(false);
    });
});

describe("reloadOnChunkError", () => {
    test("reloads once and returns true for a first-time chunk error", () => {
        const handled = reloadOnChunkError(chunkLoadError());

        expect(handled).toBe(true);
        expect(window.location.reload).toHaveBeenCalledTimes(1);
        expect(mockCaptureMessage).not.toHaveBeenCalled();
    });

    test("does not reload again on a second chunk error on the same build (after navigation), and reports it instead", () => {
        setDocumentScripts(["https://app.test/main_stableBuild.js"]);
        jest.resetModules();
        // eslint-disable-next-line global-require
        let mod = require("../lazy-with-reload");
        mod.reloadOnChunkError(chunkLoadError());
        window.location.reload.mockClear();

        // simulate the reload landing back on the same, still-stale build
        jest.resetModules();
        // eslint-disable-next-line global-require
        mod = require("../lazy-with-reload");
        const handled = mod.reloadOnChunkError(chunkLoadError());

        expect(handled).toBe(false);
        expect(window.location.reload).not.toHaveBeenCalled();
        expect(mockCaptureMessage).toHaveBeenCalledWith(
            "Chunk load error persisted after auto-reload",
            expect.objectContaining({
                tags: { chunkErrorRecovery: "failed" },
            })
        );
    });

    test("falls back to console.error when Sentry is not initialized", () => {
        delete window.SENTRY_DSN;
        setDocumentScripts(["https://app.test/main_stableBuild.js"]);
        jest.resetModules();
        // eslint-disable-next-line global-require
        let mod = require("../lazy-with-reload");
        mod.reloadOnChunkError(chunkLoadError());
        window.location.reload.mockClear();

        jest.resetModules();
        // eslint-disable-next-line global-require
        mod = require("../lazy-with-reload");
        mod.reloadOnChunkError(chunkLoadError());

        expect(mockCaptureMessage).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(
            "Chunk load error persisted after auto-reload",
            expect.objectContaining({
                tags: { chunkErrorRecovery: "failed" },
            })
        );
    });

    test("does not report a false recovery failure when two chunks fail in the same tick", () => {
        const first = reloadOnChunkError(chunkLoadError());
        const second = reloadOnChunkError(chunkLoadError());

        expect(first).toBe(true);
        expect(second).toBe(false);
        expect(window.location.reload).toHaveBeenCalledTimes(1);
        expect(mockCaptureMessage).not.toHaveBeenCalled();
        expect(console.error).not.toHaveBeenCalled();
    });

    test("does nothing for a non-chunk error", () => {
        const handled = reloadOnChunkError(new TypeError("boom"));

        expect(handled).toBe(false);
        expect(window.location.reload).not.toHaveBeenCalled();
        expect(mockCaptureMessage).not.toHaveBeenCalled();
    });

    // Reproduces the "two deploys in the same long-lived tab" scenario: a
    // reload already happened once for build A, and now build B (a distinct
    // set of statically-loaded <script> tags) has its own, unrelated chunk
    // failure - it should get its own fresh reload attempt rather than
    // being silently blocked by the earlier, unrelated recovery.
    test("allows a fresh reload when a chunk error occurs on a different build than the one already reloaded for", () => {
        jest.resetModules();
        setDocumentScripts(["https://app.test/main_buildA111111.js"]);
        // eslint-disable-next-line global-require
        const buildA = require("../lazy-with-reload");
        expect(buildA.reloadOnChunkError(chunkLoadError())).toBe(true);
        expect(window.location.reload).toHaveBeenCalledTimes(1);
        window.location.reload.mockClear();

        // still build A: same fingerprint, must not reload again
        expect(buildA.reloadOnChunkError(chunkLoadError())).toBe(false);
        expect(window.location.reload).not.toHaveBeenCalled();
        mockCaptureMessage.mockClear();

        // simulate the reload having carried the tab onto a new build
        jest.resetModules();
        setDocumentScripts(["https://app.test/main_buildB222222.js"]);
        // eslint-disable-next-line global-require
        const buildB = require("../lazy-with-reload");

        expect(buildB.reloadOnChunkError(chunkLoadError())).toBe(true);
        expect(window.location.reload).toHaveBeenCalledTimes(1);
        expect(mockCaptureMessage).not.toHaveBeenCalled();
    });
});

describe("lazyWithReload", () => {
    test("on a chunk-load failure, reloads and returns a promise that never resolves", async () => {
        const importer = () => Promise.reject(chunkLoadError());
        const loader = lazyWithReload(importer);

        let settled = false;
        loader().then(() => { settled = true; }, () => { settled = true; });
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(window.location.reload).toHaveBeenCalledTimes(1);
        expect(settled).toBe(false);
    });

    test("on an unrelated failure, rethrows so the error boundary still sees it", async () => {
        const originalError = new TypeError("boom");
        const importer = () => Promise.reject(originalError);
        const loader = lazyWithReload(importer);

        await expect(loader()).rejects.toBe(originalError);
        expect(window.location.reload).not.toHaveBeenCalled();
    });

    test("on success, resolves normally", async () => {
        const module = { default: () => null };
        const importer = () => Promise.resolve(module);
        const loader = lazyWithReload(importer);

        await expect(loader()).resolves.toBe(module);
    });

    test("neither promise rejects when two lazyWithReload chunks fail in the same tick, even though only the first triggers the reload", async () => {
        const loaderA = lazyWithReload(() => Promise.reject(chunkLoadError()));
        const loaderB = lazyWithReload(() => Promise.reject(chunkLoadError()));

        let settledA = false;
        let settledB = false;
        loaderA().then(() => { settledA = true; }, () => { settledA = true; });
        loaderB().then(() => { settledB = true; }, () => { settledB = true; });
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(window.location.reload).toHaveBeenCalledTimes(1);
        expect(settledA).toBe(false);
        expect(settledB).toBe(false);
    });
});

describe("initChunkErrorRecovery", () => {
    // tracked so afterEach can always remove the listeners, even if a test's
    // own assertions throw first - otherwise a failing test would leak
    // listeners onto window and contaminate later tests in this file
    let cleanup;

    afterEach(() => {
        cleanup?.();
        cleanup = undefined;
    });

    test("reloads and prevents default on an unhandledrejection carrying a chunk error", () => {
        cleanup = initChunkErrorRecovery();
        const preventDefault = jest.fn();

        window.dispatchEvent(
            Object.assign(new Event("unhandledrejection"), {
                reason: chunkLoadError(),
                preventDefault,
            })
        );

        expect(window.location.reload).toHaveBeenCalledTimes(1);
        expect(preventDefault).toHaveBeenCalledTimes(1);
    });

    test("does not reload on an unhandledrejection carrying an unrelated JSON.parse SyntaxError (e.g. Response.json() on an HTML error page)", () => {
        cleanup = initChunkErrorRecovery();
        const preventDefault = jest.fn();
        const jsonParseError = Object.assign(
            new Error("Unexpected token '<', \"<html>502</html>\" is not valid JSON"),
            { name: "SyntaxError" }
        );

        window.dispatchEvent(
            Object.assign(new Event("unhandledrejection"), {
                reason: jsonParseError,
                preventDefault,
            })
        );

        expect(window.location.reload).not.toHaveBeenCalled();
        expect(preventDefault).not.toHaveBeenCalled();
    });

    test("reloads and prevents default on a global error event for the HTML-as-script SyntaxError", () => {
        cleanup = initChunkErrorRecovery();
        const preventDefault = jest.fn();

        window.dispatchEvent(
            Object.assign(new Event("error"), {
                error: htmlParsedAsScriptError(),
                filename: "https://app.test/static/dashboard_a1b2c3d4e5f6.js",
                preventDefault,
            })
        );

        expect(window.location.reload).toHaveBeenCalledTimes(1);
        expect(preventDefault).toHaveBeenCalledTimes(1);
    });

    test("reloads on a global error event for an HTML-as-script SyntaxError with non-Chromium wording, as long as the filename matches", () => {
        cleanup = initChunkErrorRecovery();
        const preventDefault = jest.fn();

        window.dispatchEvent(
            Object.assign(new Event("error"), {
                error: Object.assign(new Error("expected expression, got '<'"), { name: "SyntaxError" }),
                filename: "https://app.test/static/dashboard_a1b2c3d4e5f6.js",
                preventDefault,
            })
        );

        expect(window.location.reload).toHaveBeenCalledTimes(1);
        expect(preventDefault).toHaveBeenCalledTimes(1);
    });

    test("does not touch unrelated errors", () => {
        cleanup = initChunkErrorRecovery();
        const preventDefault = jest.fn();

        window.dispatchEvent(
            Object.assign(new Event("error"), {
                error: new TypeError("boom"),
                preventDefault,
            })
        );

        expect(window.location.reload).not.toHaveBeenCalled();
        expect(preventDefault).not.toHaveBeenCalled();
    });

    test("cleanup removes the listeners", () => {
        cleanup = initChunkErrorRecovery();
        cleanup();
        cleanup = undefined;
        const preventDefault = jest.fn();

        window.dispatchEvent(
            Object.assign(new Event("unhandledrejection"), {
                reason: chunkLoadError(),
                preventDefault,
            })
        );

        expect(window.location.reload).not.toHaveBeenCalled();
    });

    test("logs a confirmation once when a prior reload was pending, and clears the marker", () => {
        window.sessionStorage.setItem("uicore.chunk-load-error-pending-confirmation", "1");

        cleanup = initChunkErrorRecovery();

        expect(console.log).toHaveBeenCalledWith(
            "[lazy-with-reload] Recovered from a chunk load error via automatic reload"
        );
        expect(
            window.sessionStorage.getItem("uicore.chunk-load-error-pending-confirmation")
        ).toBeNull();
    });

    test("does not log a confirmation when no reload was pending", () => {
        cleanup = initChunkErrorRecovery();

        expect(console.log).not.toHaveBeenCalled();
    });

    test("a real reload-then-init cycle logs exactly one confirmation", () => {
        // first "page load": a chunk error triggers the reload, which sets
        // the pending marker (sessionStorage survives a real reload)
        reloadOnChunkError(chunkLoadError());
        expect(window.location.reload).toHaveBeenCalledTimes(1);

        // "post-reload" bootstrap calls initChunkErrorRecovery once, as the
        // app does in app.js
        cleanup = initChunkErrorRecovery();

        expect(console.log).toHaveBeenCalledWith(
            "[lazy-with-reload] Recovered from a chunk load error via automatic reload"
        );
        expect(console.log).toHaveBeenCalledTimes(1);
    });
});

describe("chunkErrorSentryBeforeSend", () => {
    test("drops an event whose exception is a ChunkLoadError, when a reload was triggered for it", () => {
        reloadOnChunkError(chunkLoadError());
        const event = {
            exception: { values: [{ type: "ChunkLoadError", value: "Loading chunk 3 failed" }] },
        };
        expect(chunkErrorSentryBeforeSend(event)).toBeNull();
    });

    test("does not drop a ChunkLoadError event when no reload was triggered for it (e.g. a bare React.lazy failing behind an error boundary)", () => {
        const event = {
            exception: { values: [{ type: "ChunkLoadError", value: "Loading chunk 3 failed" }] },
        };
        expect(chunkErrorSentryBeforeSend(event)).toBe(event);
    });

    test("does not drop a SyntaxError 'Unexpected token <' when no stack frame filename is available", () => {
        const event = {
            exception: { values: [{ type: "SyntaxError", value: "Unexpected token '<'" }] },
        };
        expect(chunkErrorSentryBeforeSend(event)).toBe(event);
    });

    test("does not drop a SyntaxError 'Unexpected token <' whose stack frame filename doesn't look like a chunk (e.g. Response.json() on an HTML error page)", () => {
        const event = {
            exception: {
                values: [{
                    type: "SyntaxError",
                    value: "Unexpected token '<', \"<html>...\" is not valid JSON",
                    stacktrace: { frames: [{ filename: "https://app.test/static/vendor.min.js" }] },
                }],
            },
        };
        expect(chunkErrorSentryBeforeSend(event)).toBe(event);
    });

    test("drops a SyntaxError 'Unexpected token <' whose stack frame filename looks like a content-hashed chunk, when a reload was triggered for it", () => {
        reloadOnChunkError(chunkLoadError());
        const event = {
            exception: {
                values: [{
                    type: "SyntaxError",
                    value: "Unexpected token '<'",
                    stacktrace: { frames: [{ filename: "https://app.test/static/dashboard_a1b2c3d4e5f6.js" }] },
                }],
            },
        };
        expect(chunkErrorSentryBeforeSend(event)).toBeNull();
    });

    test("passes through an unrelated exception unchanged", () => {
        const event = {
            exception: { values: [{ type: "TypeError", value: "x is not a function" }] },
        };
        expect(chunkErrorSentryBeforeSend(event)).toBe(event);
    });

    test("passes through a message-type event with no exception unchanged", () => {
        const event = { message: "Chunk load error persisted after auto-reload" };
        expect(chunkErrorSentryBeforeSend(event)).toBe(event);
    });
});
