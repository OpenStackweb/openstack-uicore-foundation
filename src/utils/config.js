/**
 * App settings handed to uicore by the consumer via setConfig. Each getter
 * below returns the configured value when one is set and otherwise falls
 * back to the window global uicore has always read.
 *
 * A key set to undefined or an empty string is UNSET: the fallback applies.
 * null, false and 0 are values and win over the global (a configured
 * `oauth2UseRefreshToken: false` is the way to turn the refresh flow off).
 * setConfig replaces the whole object; setConfig({}) or setConfig() clears it.
 *
 * useOAuth2RefreshToken: the window fallback keeps its historical shape
 * (always truthy), so a configured `oauth2UseRefreshToken: false` is the
 * way to turn the refresh-token flow off.
 *
 * The state lives on globalThis under a Symbol.for key so every copy of
 * this module shares it.
 */
const CONFIG_KEY = Symbol.for('openstack-uicore-foundation.config');

const readConfig = () => globalThis[CONFIG_KEY] || {};

export const setConfig = (next) => {
    const source = next && typeof next === 'object' && !Array.isArray(next) ? next : {};
    globalThis[CONFIG_KEY] = Object.fromEntries(
        Object.entries(source).filter(([, value]) => value !== undefined && value !== ''),
    );
};

export const getConfig = () => ({ ...readConfig() });

const hasWindow = () => typeof window !== 'undefined';

const configuredOr = (key, ambient) => {
    const value = readConfig()[key];
    return value !== undefined ? value : ambient();
};

const getApiBaseUrl = () =>
    configuredOr('apiBaseUrl', () => (hasWindow() ? window.API_BASE_URL : null));

export const buildAPIBaseUrl = (relativeUrl) => {
    const base = getApiBaseUrl();
    if (base === null) return null;
    return `${base}${relativeUrl}`;
};

export const getTimeServiceUrl = () =>
    configuredOr('timeApiUrl', () =>
        (hasWindow() ? window.TIMEINTERVALSINCE1970_API_URL || process.env.TIMEINTERVALSINCE1970_API_URL : null));

export const getAllowedUserGroups = () =>
    configuredOr('allowedUserGroups', () => (hasWindow() ? window.ALLOWED_USER_GROUPS || '' : null));

export const getOAuth2ClientId = () =>
    configuredOr('oauth2ClientId', () => (hasWindow() ? window.OAUTH2_CLIENT_ID : null));

export const getOAuth2Flow = () =>
    configuredOr('oauth2Flow', () => (hasWindow() ? window.OAUTH2_FLOW || 'token id_token' : 'token id_token'));

export const useOAuth2RefreshToken = () =>
    configuredOr('oauth2UseRefreshToken', () =>
        (hasWindow() ? new Boolean(window.OAUTH2_USE_REFRESH_TOKEN || true) : true));

export const getOAuth2IDPBaseUrl = () =>
    configuredOr('idpBaseUrl', () => (hasWindow() ? window.IDP_BASE_URL : null));

export const getOAuth2Scopes = () =>
    configuredOr('scopes', () => (hasWindow() ? window.SCOPES : null));

export const getExclusiveSections = () =>
    configuredOr('exclusiveSections', () => (hasWindow() ? window.EXCLUSIVE_SECTIONS : undefined));
