import {
    base64URLEncode,
    getAuthCallback,
    getCurrentLocation,
    getCurrentPathName,
    getFromLocalStorage,
    removeFromLocalStorage,
    getOrigin,
    putOnLocalStorage,
    retryPromise,
    setSessionClearingState,
} from "../../utils/methods";
import request from 'superagent';
import Lock from 'browser-tabs-lock';
let http = request;

/**
 * @ignore
 */
const lock = new Lock();

const GET_TOKEN_SILENTLY_LOCK_KEY = 'openstackuicore.lock.getTokenSilently';
const NONCE_LEN = 16;
export const ACCESS_TOKEN_SKEW_TIME = 20;
export const RESPONSE_TYPE_IMPLICIT = "token id_token";
export const RESPONSE_TYPE_CODE = 'code';
const AUTH_INFO = 'authInfo';
const NONCE = 'nonce';
const PKCE = 'pkce';

import URI from "urijs";
import IdTokenVerifier from "idtoken-verifier";
import {SET_LOGGED_USER} from "./actions";
import {getRandomBytes, getSHA256} from "../../utils/crypto";

import {
    AUTH_ERROR_ACCESS_TOKEN_EXPIRED,
    AUTH_ERROR_MISSING_AUTH_INFO,
    AUTH_ERROR_MISSING_REFRESH_TOKEN,
    AUTH_ERROR_LOCK_ACQUIRE_ERROR,
    AUTH_ERROR_REFRESH_TOKEN_REQUEST_ERROR, AUTH_ERROR_ID_TOKEN_INVALID, AUTH_ERROR_MISSING_OTP_PARAM,
} from "./constants";

export const getAuthUrl = (backUrl = null, prompt = null, tokenIdHint = null, provider = null) => {

    let oauth2ClientId = getOAuth2ClientId();
    let redirectUri = getAuthCallback();
    let baseUrl = getOAuth2IDPBaseUrl();
    let scopes = getOAuth2Scopes();
    let flow = getOAuth2Flow();

    if (backUrl != null)
        redirectUri += `?BackUrl=${encodeURI(backUrl)}`;

    let nonce = createNonce(NONCE_LEN);

    // store nonce to check it later
    putOnLocalStorage(NONCE, nonce);
    let url = URI(`${baseUrl}/oauth2/auth`);

    let query = {
        "response_type": encodeURI(flow),
        "scope": encodeURI(scopes),
        "nonce": nonce,
        "response_mode" : 'fragment',
        "client_id": encodeURI(oauth2ClientId),
        "redirect_uri": encodeURI(redirectUri)
    };

    if(flow === RESPONSE_TYPE_CODE){
        const pkce = createPKCECodes()
        putOnLocalStorage(PKCE, JSON.stringify(pkce));
        query['code_challenge'] = pkce.codeChallenge;
        query['code_challenge_method'] = 'S256';
        query['approval_prompt'] = 'force';
    }

    if (prompt) {
        query['prompt'] = prompt;
    }

    if(scopes && scopes.includes('offline_access')){
        // then we need to force prompt=consent bc we are requesting an offline access
        // and we need to let the user know
        query['prompt'] = 'consent';
    }

    if (tokenIdHint) {
        query['id_token_hint'] = tokenIdHint;
    }

    if (provider) {
        query['provider'] = provider;
    }

    url = url.query(query);
    //console.log(`getAuthUrl ${url.toString()}`);
    return url;
}

export const getLogoutUrl = (idToken) => {
    let baseUrl = getOAuth2IDPBaseUrl();
    let oauth2ClientId = getOAuth2ClientId();
    let url = URI(`${baseUrl}/oauth2/end-session`);
    let state = createNonce(NONCE_LEN);
    let postLogOutUri = getOrigin() + '/auth/logout';
    // store nonce to check it later
    putOnLocalStorage('post_logout_state', state);
    /**
     * post_logout_redirect_uri should be listed on oauth2 client settings
     * on IDP
     * "Security Settings" Tab -> Logout Options -> Post Logout Uris
     */
    return url.query({
        "id_token_hint": idToken,
        "post_logout_redirect_uri": encodeURI(postLogOutUri),
        "client_id": encodeURI(oauth2ClientId),
        "state": state,
    });
}

const createNonce = (len) => {
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let nonce = '';
    for (let i = 0; i < len; i++) {
        nonce += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return nonce;
}

export const doLogin = (backUrl = null, provider = null, prompt = null) => {
    let url = getAuthUrl(backUrl, prompt ,null, provider);
    let location = getCurrentLocation()
    location.replace(url.toString());
}

export const doLoginBasicLogin = (backUrl = null) => {
    doLogin(backUrl, null, null);
}

const createPKCECodes = () => {
    const codeVerifier = base64URLEncode(getRandomBytes(64))
    const codeChallenge = getSHA256(codeVerifier, 'Base64url')
    const createdAt = new Date()
    const codePair = {
        codeVerifier,
        codeChallenge,
        createdAt
    }
    return codePair
}

export const emitAccessToken = async (code, backUrl = null) => {

    let baseUrl = getOAuth2IDPBaseUrl();
    let oauth2ClientId = getOAuth2ClientId();
    let redirectUri = getAuthCallback();
    let pkce = JSON.parse(getFromLocalStorage(PKCE, true));

    if (backUrl != null)
        redirectUri += `?BackUrl=${encodeURI(backUrl)}`;

    const payload = {
        'code' :  code,
        'grant_type' : 'authorization_code',
        'code_verifier' : pkce.codeVerifier,
        "client_id": encodeURI(oauth2ClientId),
        "redirect_uri": encodeURI(redirectUri)
    };

    try {
        //const response = await http.post(`${baseUrl}/oauth2/token`, payload);
        //const {body: {access_token, refresh_token, id_token, expires_in}} = response;
        const response = await fetch(`${baseUrl}/oauth2/token`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }).catch(function(error) {
            console.log('Request failed:', error.message);
        });
        const json = await response.json();
        let {access_token, refresh_token, id_token, expires_in, error, error_description} = json;
        return {access_token, refresh_token, id_token, expires_in, error, error_description}
    } catch (err) {
        console.log(err);
    }
};

export const clearAccessToken = async () => {
    if (
        await retryPromise(
            () => lock.acquireLock(GET_TOKEN_SILENTLY_LOCK_KEY, 5000),
            10
        )
    ) {
        try {

            let authInfo =  getAuthInfo();

            if( !authInfo ) {
                throw Error(AUTH_ERROR_MISSING_AUTH_INFO);
            }

            let { accessToken, expiresIn, accessTokenUpdatedAt, refreshToken } = authInfo;

            storeAuthInfo(null, 0 , refreshToken )

        }
        finally {
            await lock.releaseLock(GET_TOKEN_SILENTLY_LOCK_KEY);
        }
    }
}

export const getAccessToken = async () => {

    if (
        await retryPromise(
            () => lock.acquireLock(GET_TOKEN_SILENTLY_LOCK_KEY, 5000),
            10
        )
    ) {
        try {

            let authInfo =  getAuthInfo();

            if( !authInfo ) {
                throw Error(AUTH_ERROR_MISSING_AUTH_INFO);
            }

            let { accessToken, expiresIn, accessTokenUpdatedAt, refreshToken } = authInfo;
            let flow = getOAuth2Flow();
            // check life time
            let now = Math.floor(Date.now() / 1000);
            let timeElapsedSecs = (now - accessTokenUpdatedAt);
            expiresIn = (expiresIn - ACCESS_TOKEN_SKEW_TIME);
            //console.log(`getAccessToken now ${now} accessTokenUpdatedAt ${accessTokenUpdatedAt} timeElapsedSecs ${timeElapsedSecs} expiresIn ${expiresIn}.`);

            if (timeElapsedSecs > expiresIn || accessToken == null) {
                console.log(`getAccessToken access token expired`)
                if(flow === RESPONSE_TYPE_CODE && useOAuth2RefreshToken()) {
                    //console.log('getAccessToken getting new access token, access token got void');
                    if (!refreshToken) {
                        clearAuthInfo();
                        throw Error(AUTH_ERROR_MISSING_REFRESH_TOKEN);
                    }
                    let response = await refreshAccessToken(refreshToken);
                    let {access_token, expires_in, refresh_token} = response;
                    //console.log(`getAccessToken access_token ${access_token} expires_in ${expires_in} refresh_token ${refresh_token}`);
                    if (typeof refresh_token === 'undefined') {
                        refresh_token = null; // not using rotate policy
                    }
                    storeAuthInfo(access_token, expires_in, refresh_token);
                    //console.log(`getAccessToken access_token ${access_token} [NEW]`);
                    return access_token;
                }
                clearAuthInfo();
                throw Error(AUTH_ERROR_ACCESS_TOKEN_EXPIRED);
            }
            //console.log(`getAccessToken access_token ${accessToken} [CACHED]`);
            return accessToken;
        }
        finally {
            await lock.releaseLock(GET_TOKEN_SILENTLY_LOCK_KEY);
        }
    }
    throw Error(AUTH_ERROR_LOCK_ACQUIRE_ERROR);
}

export const refreshAccessToken = async (refresh_token) => {

    let baseUrl = getOAuth2IDPBaseUrl();
    let oauth2ClientId = getOAuth2ClientId();

    const payload = {
        'grant_type' : 'refresh_token',
        "client_id": encodeURI(oauth2ClientId),
        "refresh_token": refresh_token
    };

    try {
        const response = await fetch(`${baseUrl}/oauth2/token`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }).then((response) => {
            if (response.status === 400){
                let currentLocation = getCurrentPathName();
                setSessionClearingState(true);
                throw Error(`${AUTH_ERROR_REFRESH_TOKEN_REQUEST_ERROR}: ${response.status} - ${response.statusText}`);
            }
            return response;

        }).catch(function(error) {
            throw Error(`${AUTH_ERROR_REFRESH_TOKEN_REQUEST_ERROR}: ${error.message}`);
        });

        const json = await response.json();
        let {access_token, refresh_token, expires_in} = json;
        return {access_token, refresh_token, expires_in}
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export const storeAuthInfo = (accessToken, expiresIn, refreshToken = null, idToken = null) => {

    let formerAuthInfo = getAuthInfo();

    let authInfo = {
        accessToken : accessToken,
        expiresIn: expiresIn,
        accessTokenUpdatedAt : Math.floor(Date.now() / 1000),
    };

    if(refreshToken === null && formerAuthInfo){
        refreshToken = formerAuthInfo.refreshToken;
    }

    if(idToken === null && formerAuthInfo){
        idToken = formerAuthInfo.idToken;
    }

    if(refreshToken){
        authInfo['refreshToken'] = refreshToken;
    }

    if(idToken){
        authInfo['idToken'] = idToken;
    }

    putOnLocalStorage(AUTH_INFO, JSON.stringify(authInfo));
}

export const getAuthInfo = () => {
    try{
        let res = getFromLocalStorage(AUTH_INFO, false)
        if(!res) return null;
        return JSON.parse(res);
    }
    catch (err){
        return null;
    }
}

export const clearAuthInfo = () => {
    if(typeof window !== 'undefined'){
        removeFromLocalStorage(AUTH_INFO);
        removeFromLocalStorage(NONCE);
        removeFromLocalStorage(PKCE);
        return;
    }
};

export const getIdToken = () => {
    if(typeof window !== 'undefined') {
        const authInfo = getAuthInfo();
        if(authInfo){
            return authInfo.idToken;
        }
        return null;
    }
    return null;
};

export const getOAuth2ClientId = () => {
    if(typeof window !== 'undefined') {
        return window.OAUTH2_CLIENT_ID;
    }
    return null;
};

export const getOAuth2Flow = () => {
    if(typeof window !== 'undefined') {
        return window.OAUTH2_FLOW || "token id_token";
    }
    return "token id_token";
}

export const useOAuth2RefreshToken = () => {
    if(typeof window !== 'undefined') {
        return new Boolean(window.OAUTH2_USE_REFRESH_TOKEN || true);
    }
    return true;
}

export const getOAuth2IDPBaseUrl = () => {
    if(typeof window !== 'undefined') {
        return window.IDP_BASE_URL;
    }
    return null;
};

export const getOAuth2Scopes = () => {
    if(typeof window !== 'undefined') {
        return window.SCOPES;
    }
    return null;
};

export const initLogOut = () => {
    let location = getCurrentLocation();
    location.replace(getLogoutUrl(getIdToken()).toString());
}

export const validateIdToken = (idToken, issuer, audience) => {

    let verifier = new IdTokenVerifier({
        issuer: issuer,
        audience: audience
    });

    let storedNonce = getFromLocalStorage(NONCE, true);
    let jwt = verifier.decode(idToken);
    let alg = jwt.header.alg;
    let kid = jwt.header.kid;
    let aud = jwt.payload.aud;
    let iss = jwt.payload.iss;
    let exp = jwt.payload.exp;
    let nbf = jwt.payload.nbf;
    let tnonce = jwt.payload.nonce || null;

    return tnonce == storedNonce && aud == audience && iss == issuer;
}

export const passwordlessStart = (params) => {

    let oauth2ClientId = getOAuth2ClientId();
    let scopes = getOAuth2Scopes();
    let nonce = createNonce(NONCE_LEN);
    // store nonce to check it later
    putOnLocalStorage(NONCE, nonce);
    let baseUrl = getOAuth2IDPBaseUrl();
    let url = URI(`${baseUrl}/oauth2/auth`);

    let payload = {
        "response_type": "otp",
        "scope": encodeURI(scopes),
        "nonce": nonce,
        "client_id": encodeURI(oauth2ClientId),
        "connection": params.connection || "email",
        "send": params.send || "code",
    };

    if(params.hasOwnProperty('email')){
        payload["email"] = encodeURIComponent(params.email);
    }

    if(params.hasOwnProperty('phone_number')){
        payload["phone_number"] = encodeURIComponent(params.phone_number);
    }

    if(params.hasOwnProperty('redirect_uri')){
        payload["redirect_uri"] = encodeURIComponent(params.redirect_uri);
    }

    let req = http.post(url.toString());

    return req.send(payload).then((res) => {
        let json = res.body;
        return Promise.resolve({response:json});
    }).catch((err) => {
        return Promise.reject(err);
    });

}

export const passwordlessLogin = (params) => (dispatch) => {

    let oauth2ClientId = getOAuth2ClientId();
    let scopes = getOAuth2Scopes();
    let baseUrl = getOAuth2IDPBaseUrl();
    let url = URI(`${baseUrl}/oauth2/token`);

    if(!params.hasOwnProperty("otp")){
        throw Error(AUTH_ERROR_MISSING_OTP_PARAM);
    }

    let payload = {
        "grant_type": "passwordless",
        "connection": params.connection || "email",
        "scope": encodeURI(scopes),
        "client_id": encodeURI(oauth2ClientId),
        "otp": params.otp
    };

    if(params.hasOwnProperty('email')){
        payload["email"] = encodeURIComponent(params.email);
    }

    if(params.hasOwnProperty('phone_number')){
        payload["phone_number"] = encodeURIComponent(params.phone_number);
    }

    let req = http.post(url.toString());

    return req.send(payload).then((res) => {
        try {
            // now we got token
            let json = res.body;
            let {access_token, expires_in, refresh_token, id_token} = json;

            if (typeof refresh_token === 'undefined') {
                refresh_token = null; // not using rotate policy
            }

            if (typeof id_token === 'undefined') {
                id_token = null; // not using rotate policy
            }

            // verify id token

            if (id_token) {
                if (!validateIdToken(id_token, baseUrl, oauth2ClientId)) {
                    throw Error(AUTH_ERROR_ID_TOKEN_INVALID);
                }
            }

            storeAuthInfo(access_token, expires_in, refresh_token, id_token);

            if (dispatch) {
                dispatch({
                    type: SET_LOGGED_USER,
                    payload: {sessionState: null}
                });
            }

            return Promise.resolve({response: json});
        }
        catch(e){
            console.log(e);
            return Promise.reject(e);
        }
    }).catch((err) => {
        return Promise.reject(err);
    });
}
