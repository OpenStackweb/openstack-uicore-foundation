import {authErrorHandler, snackbarErrorHandler, SET_SNACKBAR_MESSAGE} from "../actions";
import { CLEAR_SESSION_STATE } from "../../components/security/actions";
import configureMockStore from 'redux-mock-store';
import request from 'superagent/lib/client';
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
    });

    describe('snackbarErrorHandler', () => {
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

            store.dispatch(snackbarErrorHandler(err));

            const { payload } = store.getActions().find((a) => a.type === SET_SNACKBAR_MESSAGE);
            expect(payload.details).toContain("Request: PUT https://api.example.com/api/v1/summits/1 (404)");
            expect(payload.details).not.toContain("secret");
        });

        test('copies the request and 4xx response bodies with sensitive fields redacted', () => {
            const req = request.put("https://api.example.com/api/v1/summits/1/attendees/2").send({
                ticket_type_id: 7,
                send_speaker_email: true,
                owner: { email: "jane@example.com", first_name: "Jane", phone_number: "555-0100", billing_address_1: "1 Main St" },
                payment: { payment_info_details: { brand: "visa", last4: "4242" }, live_secret_key: "sk_live_123" },
                access_token: "abc"
            });
            const body = { message: "Validation Failed", errors: { start_date: ["The start date field is required."] }, user_password: "password2" };

            store.dispatch(snackbarErrorHandler({ status: 412, response: { body, req } }));

            const { payload } = store.getActions().find((a) => a.type === SET_SNACKBAR_MESSAGE);
            expect(payload.details).toContain('"ticket_type_id": 7');
            expect(payload.details).toContain('"send_speaker_email": true');
            expect(payload.details).toContain("The start date field is required.");
            ["jane@example.com", "Jane", "555-0100", "1 Main St", "visa", "4242", "sk_live_123", '"abc"', "password2"]
                .forEach((value) => expect(payload.details).not.toContain(value));
        });

        test('skips 5xx response bodies and truncates long payloads', () => {
            const req = request.post("https://api.example.com/api/v1/summits").send({ notes: "x".repeat(5000) });

            store.dispatch(snackbarErrorHandler({ status: 500, response: { body: { trace: "debug output" }, req } }));

            const { payload } = store.getActions().find((a) => a.type === SET_SNACKBAR_MESSAGE);
            expect(payload.details).toContain("… (truncated)");
            expect(payload.details).not.toContain("x".repeat(2001));
            expect(payload.details).not.toContain("debug output");
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

            store.dispatch(snackbarErrorHandler(err));

            const actions = store.getActions();
            const { payload } = actions.find((a) => a.type === SET_SNACKBAR_MESSAGE);
            expect(payload.details).toBe("");
            expect(actions.map((a) => a.type)).toContain(CLEAR_SESSION_STATE);
        });

        test('flags a missing response when the browser is offline', () => {
            const onLineSpy = jest.spyOn(navigator, "onLine", "get").mockReturnValue(false);

            store.dispatch(snackbarErrorHandler({ method: "GET", url: "https://api.example.com/api/v1/summits" }));

            const { payload } = store.getActions().find((a) => a.type === SET_SNACKBAR_MESSAGE);
            expect(payload.details).toContain("Request: GET https://api.example.com/api/v1/summits (no response, offline)");
            onLineSpy.mockRestore();
        });
    });
});
