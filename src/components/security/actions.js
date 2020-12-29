/**
 * Copyright 2018 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
import Lock from 'browser-tabs-lock';
import T from "i18n-react/dist/i18n-react";
import {createAction, getRequest, startLoading, stopLoading, showMessage, authErrorHandler, postRequest} from "../../utils/actions";
import {
    buildAPIBaseUrl,
    getOAuth2ClientId,
    getOAuth2IDPBaseUrl,
    getOAuth2Scopes,
    getAuthCallback,
    putOnLocalStorage,
    getAllowedUserGroups,
    getCurrentLocation,
    getOrigin,
    getIdToken,
    getOAuth2Flow,
    base64URLEncode,
    sha256,
    getFromLocalStorage,
    retryPromise,
    getCurrentPathName, setSessionClearingState
} from '../../utils/methods';
import URI from "urijs";
import {randomBytes} from "crypto";
import request from 'superagent';
let http = request;


/**
 * @ignore
 */
const lock = new Lock();

/**
 * @ignore
 */
const GET_TOKEN_SILENTLY_LOCK_KEY = 'openstackuicore.lock.getTokenSilently';

export const ACCESS_TOKEN_SKEW_TIME = 20;
export const SET_LOGGED_USER = 'SET_LOGGED_USER';
export const UPDATE_ACCESS_TOKEN = 'UPDATE_ACCESS_TOKEN';
export const LOGOUT_USER = 'LOGOUT_USER';
export const REQUEST_USER_INFO = 'REQUEST_USER_INFO';
export const RECEIVE_USER_INFO = 'RECEIVE_USER_INFO';
export const CLEAR_SESSION_STATE = 'CLEAR_SESSION_STATE';
export const UPDATE_SESSION_STATE_STATUS = 'UPDATE_SESSION_STATE_STATUS';
const NONCE_LEN = 16;
export const SESSION_STATE_STATUS_UNCHANGED = 'unchanged';
export const SESSION_STATE_STATUS_CHANGED = 'changed';
export const SESSION_STATE_STATUS_ERROR = 'error';
export const RESPONSE_TYPE_IMPLICIT = "token id_token";
export const RESPONSE_TYPE_CODE = 'code';

export const getAuthUrl = (backUrl = null, prompt = null, tokenIdHint = null) => {

    let oauth2ClientId = getOAuth2ClientId();
    let redirectUri = getAuthCallback();
    let baseUrl = getOAuth2IDPBaseUrl();
    let scopes = getOAuth2Scopes();
    let flow = getOAuth2Flow();

    if (backUrl != null)
        redirectUri += `?BackUrl=${encodeURI(backUrl)}`;

    let nonce = createNonce(NONCE_LEN);
    console.log(`created nonce ${nonce}`);
    // store nonce to check it later
    putOnLocalStorage('nonce', nonce);
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
        putOnLocalStorage('pkce', JSON.stringify(pkce));
        query['code_challenge'] = pkce.codeChallenge;
        query['code_challenge_method'] = 'S256';
        query['access_type'] = 'offline';
        query['approval_prompt'] = 'force';
    }

    if (prompt) {
        query['prompt'] = prompt;
    }

    if (tokenIdHint) {
        query['id_token_hint'] = tokenIdHint;
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

export const doLogin = (backUrl = null) => {
    if (backUrl)
        console.log(`doLogin - backUrl ${backUrl} `);
    let url = getAuthUrl(backUrl);
    let location = getCurrentLocation()
    location.replace(url.toString());
}

export const onUserAuth = (accessToken, idToken, sessionState, expiresIn = 0, refreshToken = null) => (dispatch) => {
    dispatch({
        type: SET_LOGGED_USER,
        payload: {accessToken, expiresIn, idToken, sessionState, refreshToken}
    });
}

export const onUpdateAccessToken = (accessToken , expiresIn, refreshToken = null)=> (dispatch) => {
    dispatch({
        type: UPDATE_ACCESS_TOKEN,
        payload: {accessToken, expiresIn, refreshToken}
    });
}

export const initLogOut = () => {
    let location = getCurrentLocation();
    location.replace(getLogoutUrl(getIdToken()).toString());
}

export const doLogout = (backUrl) => (dispatch, getState) => {
    dispatch({
        type: LOGOUT_USER,
        payload: {backUrl: backUrl}
    });
}

export const getUserInfo =  (backUrl, history, errorHandler = null ) => async (dispatch, getState) => {

    let AllowedUserGroups = getAllowedUserGroups();
    AllowedUserGroups = AllowedUserGroups !== '' ? AllowedUserGroups.split(' ') : [];
    let {loggedUserState} = getState();
    let {member} = loggedUserState;

    let accessToken = await getAccessToken(dispatch, getState);

    if (member != null) {
        //console.log(`redirecting to ${backUrl}`);
        history.push(backUrl);
        return;
    }

    if(errorHandler == null)
        errorHandler = authErrorHandler;

    dispatch(startLoading());

    return getRequest(
        createAction(REQUEST_USER_INFO),
        createAction(RECEIVE_USER_INFO),
        buildAPIBaseUrl(`/api/v1/members/me?expand=groups&access_token=${accessToken}`),
        errorHandler
    )({})(dispatch, getState).then(() => {
            dispatch(stopLoading());

            let {member} = getState().loggedUserState;
            if (member == null) {
                let error_message = {
                    title: 'ERROR',
                    html: T.translate("errors.user_not_set"),
                    type: 'error'
                };

                dispatch(showMessage(error_message, initLogOut));

            }

            // check user groups ( if defined )
            if (AllowedUserGroups.length > 0) {

                let allowedGroups = member.groups.filter((group, idx) => {
                    return AllowedUserGroups.includes(group.code);
                });

                if (allowedGroups.length === 0) {

                    let error_message = {
                        title: 'ERROR',
                        html: T.translate("errors.user_not_authz"),
                        type: 'error'
                    };

                    dispatch(showMessage(error_message, initLogOut));
                    return;
                }
            }

            history.push(backUrl);
        }
    );
};

export const updateSessionStateStatus = (newStatus) => (dispatch, getState) => {
    dispatch({
        type: UPDATE_SESSION_STATE_STATUS,
        payload: {sessionStateStatus: newStatus}
    });
}

export const createPKCECodes = () => {
    const codeVerifier = base64URLEncode(randomBytes(64))
    const codeChallenge = base64URLEncode(sha256(Buffer.from(codeVerifier)))
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
    let pkce = JSON.parse(getFromLocalStorage('pkce', true));

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

export const getAccessToken = async (dispatch, getState) => {

    if (
        await retryPromise(
            () => lock.acquireLock(GET_TOKEN_SILENTLY_LOCK_KEY, 5000),
            10
        )
    ) {
        try {
            let {loggedUserState} = getState();

            let {accessToken, refreshToken, expiresIn, accessTokenUpdatedAt} = loggedUserState;

            // check life time
            let now = Math.floor(Date.now() / 1000);
            let timeElapsedSecs = (now - accessTokenUpdatedAt);
            expiresIn = (expiresIn - ACCESS_TOKEN_SKEW_TIME);
            //console.log(`getAccessToken now ${now} accessTokenUpdatedAt ${accessTokenUpdatedAt} timeElapsedSecs ${timeElapsedSecs} expiresIn ${expiresIn}.`);

            if (timeElapsedSecs > expiresIn) {
                //console.log('getAccessToken getting new access token, access token got void');
                if(!refreshToken){
                    throw Error("Refresh token is null.");
                }
                let response = await refreshAccessToken(refreshToken);
                let {access_token, expires_in, refresh_token} = response;
                //console.log(`getAccessToken access_token ${access_token} expires_in ${expires_in} refresh_token ${refresh_token}`);
                if (typeof refresh_token === 'undefined') {
                    refresh_token = null; // not using rotate policy
                }
                onUpdateAccessToken(access_token, expires_in, refresh_token)(dispatch);
                //console.log(`getAccessToken access_token ${access_token} [NEW]`);
                return access_token;
            }
            //console.log(`getAccessToken access_token ${accessToken} [CACHED]`);
            return accessToken;
        }
        finally {
            await lock.releaseLock(GET_TOKEN_SILENTLY_LOCK_KEY);
        }
    }
    throw Error("Lock acquire error.");
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
                //console.log('refreshAccessToken 400 - re login....');
                doLogin(currentLocation);
                throw Error(response.statusText);
            }
            return response;

        }).catch(function(error) {
            console.log('Request failed:', error.message);
        });

        const json = await response.json();
        let {access_token, refresh_token, expires_in} = json;
        return {access_token, refresh_token, expires_in}
    } catch (err) {
        console.log(err);
    }
}