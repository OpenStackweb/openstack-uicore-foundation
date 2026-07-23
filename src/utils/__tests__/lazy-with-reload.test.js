jest.mock("react", () => ({
    ...jest.requireActual("react"),
    lazy: jest.fn((loader) => loader),
}));

const mockCaptureMessage = jest.fn();
jest.mock("@sentry/react", () => ({
    captureMessage: (...args) => mockCaptureMessage(...args),
}));

import {
    isChunkLoadError,
    reloadOnChunkError,
    lazyWithReload,
    initChunkErrorRecovery,
    chunkErrorSentryBeforeSend,
} from "../lazy-with-reload";

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
});

describe("isChunkLoadError", () => {
    test("matches webpack's ChunkLoadError by name, regardless of message", () => {
        expect(isChunkLoadError(chunkLoadError())).toBe(true);
    });

    test("matches a SyntaxError for 'Unexpected token <' with no filename", () => {
        expect(isChunkLoadError(htmlParsedAsScriptError())).toBe(true);
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

    test("does not reload again on a second chunk error on the same build, and reports it instead", () => {
        reloadOnChunkError(chunkLoadError());
        window.location.reload.mockClear();

        const handled = reloadOnChunkError(chunkLoadError());

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
        reloadOnChunkError(chunkLoadError());
        window.location.reload.mockClear();

        reloadOnChunkError(chunkLoadError());

        expect(mockCaptureMessage).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(
            "Chunk load error persisted after auto-reload",
            expect.objectContaining({
                tags: { chunkErrorRecovery: "failed" },
            })
        );
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
    test("drops an event whose exception is a ChunkLoadError", () => {
        const event = {
            exception: { values: [{ type: "ChunkLoadError", value: "Loading chunk 3 failed" }] },
        };
        expect(chunkErrorSentryBeforeSend(event)).toBeNull();
    });

    test("drops an event whose exception is the HTML-as-script SyntaxError", () => {
        const event = {
            exception: { values: [{ type: "SyntaxError", value: "Unexpected token '<'" }] },
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
