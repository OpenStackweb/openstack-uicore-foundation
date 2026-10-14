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

        test('lists 412 field names without their values', () => {
            const errors = { start_date: ["The start date field is required."], end_date: ["The end date is invalid."] };

            store.dispatch(snackbarErrorHandler({ status: 412, response: { body: { errors }, req: {} } }));

            const { payload } = store.getActions().find((a) => a.type === SET_SNACKBAR_MESSAGE);
            expect(payload.details).toContain("Fields: start_date, end_date");
            expect(payload.details).not.toContain("required");
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
