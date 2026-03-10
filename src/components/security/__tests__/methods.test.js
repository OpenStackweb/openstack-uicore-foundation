import {
    AUTH_ERROR_REFRESH_TOKEN_REQUEST_ERROR,
    AUTH_ERROR_REFRESH_TOKEN_NETWORK_ERROR,
} from '../constants';

import { refreshAccessToken } from '../methods';

// Mock utils/methods imports used by security/methods
jest.mock('../../../utils/methods', () => ({
    base64URLEncode: jest.fn(),
    getAuthCallback: jest.fn(),
    getCurrentLocation: jest.fn(() => ({ replace: jest.fn() })),
    getCurrentPathName: jest.fn(() => '/'),
    getFromLocalStorage: jest.fn(),
    removeFromLocalStorage: jest.fn(),
    getOrigin: jest.fn(() => 'http://localhost'),
    putOnLocalStorage: jest.fn(),
    retryPromise: jest.fn(),
    setSessionClearingState: jest.fn(),
}));

jest.mock('../../../utils/crypto', () => ({
    getRandomBytes: jest.fn(),
    getSHA256: jest.fn(),
}));

jest.mock('moment-timezone', () => {
    const m = jest.fn(() => ({ unix: () => 1000 }));
    m.unix = jest.fn(() => 1000);
    return { __esModule: true, default: m };
});

jest.mock('browser-tabs-lock', () => {
    return jest.fn().mockImplementation(() => ({
        acquireLock: jest.fn(),
        releaseLock: jest.fn(),
    }));
});

jest.mock('js-cookie', () => ({
    set: jest.fn(),
    remove: jest.fn(),
    get: jest.fn(),
}));

jest.mock('idtoken-verifier', () => {
    return jest.fn().mockImplementation(() => ({
        decode: jest.fn(),
    }));
});

jest.mock('../actions', () => ({
    SET_LOGGED_USER: 'SET_LOGGED_USER',
}));

const { setSessionClearingState } = require('../../../utils/methods');

// Helper to set window globals needed by methods.js
const setupWindowGlobals = () => {
    global.window = global.window || {};
    global.window.IDP_BASE_URL = 'https://idp.example.com';
    global.window.OAUTH2_CLIENT_ID = 'test-client-id';
    global.window.OAUTH2_FLOW = 'code';
    global.window.SCOPES = 'openid offline_access';
    global.window.OAUTH2_USE_REFRESH_TOKEN = true;
};

beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    setupWindowGlobals();
});

afterEach(() => {
    jest.useRealTimers();
});

describe('refreshAccessToken', () => {

    it('should return tokens on successful response', async () => {
        const mockResponse = {
            status: 200,
            json: jest.fn().mockResolvedValue({
                access_token: 'new-access-token',
                refresh_token: 'new-refresh-token',
                expires_in: 3600,
                id_token: 'new-id-token',
            }),
        };
        global.fetch = jest.fn().mockResolvedValue(mockResponse);

        const result = await refreshAccessToken('old-refresh-token');

        expect(result).toEqual({
            access_token: 'new-access-token',
            refresh_token: 'new-refresh-token',
            expires_in: 3600,
            id_token: 'new-id-token',
        });
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw AUTH_ERROR_REFRESH_TOKEN_REQUEST_ERROR on HTTP 400', async () => {
        const mockResponse = {
            status: 400,
            statusText: 'Bad Request',
        };
        global.fetch = jest.fn().mockResolvedValue(mockResponse);

        await expect(refreshAccessToken('revoked-token'))
            .rejects
            .toThrow(AUTH_ERROR_REFRESH_TOKEN_REQUEST_ERROR);

        expect(setSessionClearingState).toHaveBeenCalledWith(true);
    });

    it('should throw AUTH_ERROR_REFRESH_TOKEN_NETWORK_ERROR on HTTP 500', async () => {
        const mockResponse = {
            status: 500,
            statusText: 'Internal Server Error',
        };
        global.fetch = jest.fn().mockResolvedValue(mockResponse);

        await expect(refreshAccessToken('valid-token'))
            .rejects
            .toThrow(AUTH_ERROR_REFRESH_TOKEN_NETWORK_ERROR);

        expect(setSessionClearingState).not.toHaveBeenCalled();
    });

    it('should throw AUTH_ERROR_REFRESH_TOKEN_NETWORK_ERROR on HTTP 502', async () => {
        const mockResponse = {
            status: 502,
            statusText: 'Bad Gateway',
        };
        global.fetch = jest.fn().mockResolvedValue(mockResponse);

        await expect(refreshAccessToken('valid-token'))
            .rejects
            .toThrow(AUTH_ERROR_REFRESH_TOKEN_NETWORK_ERROR);
    });

    it('should throw AUTH_ERROR_REFRESH_TOKEN_NETWORK_ERROR on HTTP 503', async () => {
        const mockResponse = {
            status: 503,
            statusText: 'Service Unavailable',
        };
        global.fetch = jest.fn().mockResolvedValue(mockResponse);

        await expect(refreshAccessToken('valid-token'))
            .rejects
            .toThrow(AUTH_ERROR_REFRESH_TOKEN_NETWORK_ERROR);
    });

    it('should throw AUTH_ERROR_REFRESH_TOKEN_NETWORK_ERROR on network failure', async () => {
        global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));

        await expect(refreshAccessToken('valid-token'))
            .rejects
            .toThrow(AUTH_ERROR_REFRESH_TOKEN_NETWORK_ERROR);

        expect(setSessionClearingState).not.toHaveBeenCalled();
    });

    it('should throw AUTH_ERROR_REFRESH_TOKEN_NETWORK_ERROR on DNS error', async () => {
        global.fetch = jest.fn().mockRejectedValue(new TypeError('getaddrinfo ENOTFOUND idp.example.com'));

        await expect(refreshAccessToken('valid-token'))
            .rejects
            .toThrow(AUTH_ERROR_REFRESH_TOKEN_NETWORK_ERROR);
    });

    it('should not call setSessionClearingState on network error', async () => {
        global.fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed'));

        try {
            await refreshAccessToken('valid-token');
        } catch (e) {
            // expected
        }

        expect(setSessionClearingState).not.toHaveBeenCalled();
    });

    it('should call setSessionClearingState(true) only on HTTP 400', async () => {
        const mockResponse = {
            status: 400,
            statusText: 'Bad Request',
        };
        global.fetch = jest.fn().mockResolvedValue(mockResponse);

        try {
            await refreshAccessToken('revoked-token');
        } catch (e) {
            // expected
        }

        expect(setSessionClearingState).toHaveBeenCalledWith(true);
        expect(setSessionClearingState).toHaveBeenCalledTimes(1);
    });

    it('should include status in error message for 5xx', async () => {
        const mockResponse = {
            status: 503,
            statusText: 'Service Unavailable',
        };
        global.fetch = jest.fn().mockResolvedValue(mockResponse);

        await expect(refreshAccessToken('valid-token'))
            .rejects
            .toThrow(`${AUTH_ERROR_REFRESH_TOKEN_NETWORK_ERROR}: 503 - Service Unavailable`);
    });

    it('should include original message in error for network failure', async () => {
        global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));

        await expect(refreshAccessToken('valid-token'))
            .rejects
            .toThrow(`${AUTH_ERROR_REFRESH_TOKEN_NETWORK_ERROR}: Failed to fetch`);
    });
});
