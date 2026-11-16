import {authErrorHandler, snackbarErrorHandler, getRequest, clearConsumedSnackbarMessage, CLEAR_SNACKBAR_MESSAGE, SET_SNACKBAR_MESSAGE, VALIDATE} from "../actions";
import {setAuthHandlers} from "../../components/security/methods";
import { CLEAR_SESSION_STATE } from "../../components/security/actions";
import configureMockStore from 'redux-mock-store';
import request from 'superagent/lib/client';
import URI from "urijs";
import Swal from 'sweetalert2';
import thunk from 'redux-thunk'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares);
const store = mockStore();
jest.mock("sweetalert2", () => ({
    fire: jest.fn().mockResolvedValue({ value: true }),
}));
let windowSpy = null;

const localStorageMock = (function () {
    let store = {};

    return {
        getItem(key) {
            return store[key];
        },

        setItem(key, value) {
            store[key] = value;
        },

        clear() {
            store = {};
        },

        removeItem(key) {
            delete store[key];
        },

        getAll() {
            return store;
        },
    };
})();


describe('Utils Actions', () => {

    beforeEach(() => {
        store.clearActions();
        windowSpy = jest.spyOn(window, "window", "get");
    });

    afterEach(() => {
        windowSpy.mockRestore();
    });

    describe('authErrorHandler', () => {
        test('Dispatches authErrorHandler 401', () => {

            console.log = jest.fn();
            windowSpy.mockImplementation(() => ({
                location: {
                    href: 'https://example.com',
                    pathname:'/',
                    replace: () => {}
                },
                localStorage: localStorageMock
            }));

            store.dispatch(authErrorHandler({ status:401 }));

            expect(console.log).toHaveBeenCalledTimes(1);
            expect(console.log).toHaveBeenCalledWith("authErrorHandler 401 - re login");
        });

        test('Dispatches authErrorHandler 403', () => {

            console.log = jest.fn();
            windowSpy.mockImplementation(() => ({
                location: {
                    href: 'https://example.com',
                    pathname:'/',
                    replace: () => {}
                },
                localStorage: localStorageMock
            }));

            store.dispatch(authErrorHandler({ status:403 }));
            expect(Swal.fire).toBeCalled();
        });

        describe('with injected auth handlers', () => {
            beforeEach(() => jest.clearAllMocks());
            afterEach(() => setAuthHandlers());

            test('401 calls the injected handler and does not start a login', () => {
                console.log = jest.fn();
                const injected = jest.fn();
                setAuthHandlers({ authErrorHandler: injected });

                store.dispatch(authErrorHandler({ status:401 }));

                expect(injected).toHaveBeenCalledWith({ status: 401 });
                expect(console.log).not.toHaveBeenCalledWith("authErrorHandler 401 - re login");
                expect(store.getActions()).toEqual([{ type: 'STOP_LOADING' }]);
            });

            test('403 calls the injected handler and does not show the logout dialog', () => {
                const injected = jest.fn();
                setAuthHandlers({ authErrorHandler: injected });

                store.dispatch(authErrorHandler({ status:403 }));

                expect(injected).toHaveBeenCalledWith({ status: 403 });
                expect(injected).toHaveBeenCalledTimes(1);
                expect(Swal.fire).not.toBeCalled();
                expect(store.getActions()).toEqual([{ type: 'STOP_LOADING' }]);
            });

            test('401 with a custom notifier still goes to the injected handler, not the notifier', () => {
                const injected = jest.fn();
                const notifier = jest.fn(() => () => {});
                setAuthHandlers({ authErrorHandler: injected });

                store.dispatch(authErrorHandler({ status:401 }, {}, notifier));

                expect(injected).toHaveBeenCalledWith({ status: 401 });
                expect(notifier).not.toHaveBeenCalled();
            });

            test('other status codes keep the built-in path while handlers are set', () => {
                const injected = jest.fn();
                setAuthHandlers({ authErrorHandler: injected, initLogOut: jest.fn() });

                store.dispatch(authErrorHandler({ status:404, response: { body: { message: 'gone' } } }));
                store.dispatch(authErrorHandler({ status:500, response: {} }));

                expect(injected).not.toHaveBeenCalled();
                expect(Swal.fire).toHaveBeenCalledTimes(2);
            });

            test('403 with only initLogOut injected shows the built-in dialog, then calls the injected logout', async () => {
                const injectedLogout = jest.fn();
                setAuthHandlers({ initLogOut: injectedLogout });
                windowSpy.mockImplementation(() => ({
                    location: { href: 'https://example.com', pathname:'/', replace: () => {} },
                    localStorage: localStorageMock
                }));

                store.dispatch(authErrorHandler({ status:403 }));
                await Promise.resolve();

                expect(Swal.fire).toHaveBeenCalledTimes(1);
                expect(injectedLogout).toHaveBeenCalledTimes(1);
            });

            test('setAuthHandlers() restores the built-in 403 dialog', () => {
                setAuthHandlers({ authErrorHandler: jest.fn() });
                setAuthHandlers();
                windowSpy.mockImplementation(() => ({
                    location: { href: 'https://example.com', pathname:'/', replace: () => {} },
                    localStorage: localStorageMock
                }));

                store.dispatch(authErrorHandler({ status:403 }));
                expect(Swal.fire).toBeCalled();
            });
        });

        test('412 with field-keyed errors shows messages without keys, one per line', () => {
            const errors = {
                start_date: ["The start date field is required."],
                end_date: ["The end date does not match the format U.", "The end date field must be a date after or equal to start date."]
            };
            const notify = jest.fn(() => ({ type: "NOTIFY" }));

            store.dispatch(authErrorHandler({ status: 412, response: { body: { errors } } }, null, notify));

            expect(notify.mock.calls[0][0].html).toBe(
                "The start date field is required.<br>" +
                "The end date does not match the format U.<br>The end date field must be a date after or equal to start date.<br>"
            );
            expect(store.getActions()).toContainEqual({ type: VALIDATE, payload: { errors } });
        });

        test('412 with an array of errors shows one message per line', () => {
            const errors = ["cart id is null", "file param not set!"];
            const notify = jest.fn(() => ({ type: "NOTIFY" }));

            store.dispatch(authErrorHandler({ status: 412, response: { body: { errors } } }, null, notify));

            expect(notify.mock.calls[0][0].html).toBe("cart id is null<br>file param not set!<br>");
        });
    });

    describe('snackbarErrorHandler', () => {
        const copiedDetails = (err) => {
            store.dispatch(snackbarErrorHandler(err));
            return store.getActions().find((a) => a.type === SET_SNACKBAR_MESSAGE).payload.details;
        };

        test('401 shows the snackbar and still runs the re-login', () => {
            windowSpy.mockImplementation(() => ({
                location: {
                    href: 'https://example.com',
                    pathname:'/',
                    replace: () => {}
                },
                localStorage: localStorageMock
            }));

            store.dispatch(snackbarErrorHandler({ status:401 }));

            const types = store.getActions().map((a) => a.type);
            expect(types).toContain(SET_SNACKBAR_MESSAGE);
            // CLEAR_SESSION_STATE is only dispatched by initLogin
            expect(types).toContain(CLEAR_SESSION_STATE);
        });

        test('adds request details without the query string', () => {
            const err = {
                status: 404,
                response: {
                    body: { message: "Entity Not Found" },
                    req: { method: "PUT", url: "https://api.example.com/api/v1/summits/1?access_token=secret&expand=x" }
                }
            };

            const details = copiedDetails(err);

            expect(details).toContain("Request: PUT https://api.example.com/api/v1/summits/1 (404)");
            expect(details).not.toContain("secret");
        });

        test('copies the request and 4xx response bodies with sensitive fields redacted', () => {
            const req = request.put("https://api.example.com/api/v1/summits/1/attendees/2").send({
                ticket_type_id: 7,
                send_speaker_email: true,
                owner: { email: "jane@example.com", first_name: "Jane", phone_number: "555-0100", billing_address_1: "1 Main St" },
                payment: { payment_info_details: { brand: "visa", last4: "4242" }, live_secret_key: "sk_live_123" },
                extra_questions: [{ question_id: 3, answer: "1990-01-01" }],
                client: { contact_name: "Ann Lee" },
                qr_code: "BDG|123|jane@example.com|Jane Doe",
                access_token: "abc"
            });
            const body = { message: "Validation Failed", errors: { start_date: ["The start date field is required."] }, user_password: "password2" };

            const details = copiedDetails({ status: 412, response: { body, req } });

            expect(details).toContain('"ticket_type_id": 7');
            expect(details).toContain('"send_speaker_email": true');
            expect(details).toContain("The start date field is required.");
            ["jane@example.com", "Jane", "555-0100", "1 Main St", "visa", "4242", "sk_live_123", "1990-01-01", "Ann Lee", "BDG|123", '"abc"', "password2"]
                .forEach((value) => expect(details).not.toContain(value));
        });

        test('skips 5xx response bodies and truncates long payloads', () => {
            const req = request.post("https://api.example.com/api/v1/summits").send({ notes: "x".repeat(5000) });

            const details = copiedDetails({ status: 500, response: { body: { trace: "debug output" }, req } });

            expect(details).toContain("… (truncated)");
            expect(details).not.toContain("x".repeat(2001));
            expect(details).not.toContain("debug output");
        });

        test('still notifies and re-logs in when the details cannot be built', () => {
            windowSpy.mockImplementation(() => ({
                location: {
                    href: 'https://example.com',
                    pathname:'/',
                    replace: () => {}
                },
                localStorage: localStorageMock
            }));
            const err = { status: 401, get response() { throw new Error("unreadable"); } };

            expect(copiedDetails(err)).toBe("");
            expect(store.getActions().map((a) => a.type)).toContain(CLEAR_SESSION_STATE);
        });

        test('flags a missing response when the browser is offline', () => {
            const onLineSpy = jest.spyOn(navigator, "onLine", "get").mockReturnValue(false);

            const details = copiedDetails({ method: "GET", url: "https://api.example.com/api/v1/summits" });
            onLineSpy.mockRestore();

            expect(details).toContain("Request: GET https://api.example.com/api/v1/summits (no response, offline)");
        });

        test('builds details for a post request made with a URI object', () => {
            // postRequest, deleteRequest, postFile and putFile hand superagent a URI, not a string
            const req = request.post(URI("https://api.example.com/api/v1/summits").query({ access_token: "secret" })).send({ name: "Summit" });

            const details = copiedDetails({ status: 412, response: { body: { errors: ["Name taken."] }, req } });

            expect(details).toContain("Request: POST https://api.example.com/api/v1/summits (412)");
            expect(details).toContain('"name": "Summit"');
            expect(details).not.toContain("secret");
        });

        test('names a GET that timed out', async () => {
            // superagent's timeout error carries only timeout, code and errno
            const timeoutErr = Object.assign(new Error("Timeout of 60000ms exceeded"), { timeout: 60000, code: "ECONNABORTED" });
            const req = { method: "GET", timeout: () => req, end: (callback) => callback(timeoutErr) };
            const getSpy = jest.spyOn(request, "get").mockReturnValue(req);

            await store.dispatch(getRequest(null, null, "https://api.example.com/api/v1/summits", snackbarErrorHandler)({ page: 2, access_token: "secret" })).catch(() => {});
            getSpy.mockRestore();

            const { payload } = store.getActions().find((a) => a.type === SET_SNACKBAR_MESSAGE);
            expect(payload.details).toContain("Request: GET https://api.example.com/api/v1/summits (timed out)");
            expect(payload.details).not.toContain("secret");
        });
    });

    describe('clearConsumedSnackbarMessage', () => {
        const msg = { html: 'Saved', type: 'success' };

        test('clears the slot when it still holds the message', () => {
            const slotStore = mockStore({ baseState: { snackbarMessage: msg } });
            slotStore.dispatch(clearConsumedSnackbarMessage(msg));
            expect(slotStore.getActions()).toEqual([{ type: CLEAR_SNACKBAR_MESSAGE, payload: {} }]);
        });

        test('keeps a newer message in the slot', () => {
            const slotStore = mockStore({ baseState: { snackbarMessage: { ...msg } } });
            slotStore.dispatch(clearConsumedSnackbarMessage(msg));
            expect(slotStore.getActions()).toEqual([]);
        });
    });
});
