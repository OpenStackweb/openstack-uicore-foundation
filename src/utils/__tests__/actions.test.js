import {authErrorHandler, snackbarErrorHandler, SET_SNACKBAR_MESSAGE, VALIDATE} from "../actions";
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
    });
});
