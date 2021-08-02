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

import T from "i18n-react/dist/i18n-react";
import {createAction, getRequest, startLoading, stopLoading, showMessage, authErrorHandler} from "../../utils/actions";
import {
    buildAPIBaseUrl, getOAuth2ClientId, getOAuth2IDPBaseUrl,
    getOAuth2Scopes, getAuthCallback, putOnLocalStorage, getAllowedUserGroups,
    getCurrentLocation, getOrigin, getIdToken
} from '../../utils/methods';
import URI from "urijs";

export const SET_LOGGED_USER = 'SET_LOGGED_USER';
export const LOGOUT_USER = 'LOGOUT_USER';
export const REQUEST_USER_INFO = 'REQUEST_USER_INFO';
export const RECEIVE_USER_INFO = 'RECEIVE_USER_INFO';
export const CLEAR_SESSION_STATE = 'CLEAR_SESSION_STATE';
export const UPDATE_SESSION_STATE_STATUS = 'UPDATE_SESSION_STATE_STATUS';
const NONCE_LEN = 16;
export const SESSION_STATE_STATUS_UNCHANGED = 'unchanged';
export const SESSION_STATE_STATUS_CHANGED = 'changed';
export const SESSION_STATE_STATUS_ERROR = 'error';

export const getAuthUrl = (backUrl = null, prompt = null, tokenIdHint = null, provider = null) => {

    let oauth2ClientId = getOAuth2ClientId();
    let baseUrl = getOAuth2IDPBaseUrl();
    let scopes = getOAuth2Scopes();
    let redirectUri = getAuthCallback();

    if (backUrl != null)
        redirectUri += `?BackUrl=${encodeURI(backUrl)}`;

    let nonce = createNonce(NONCE_LEN);
    console.log(`created nonce ${nonce}`);
    // store nonce to check it later
    putOnLocalStorage('nonce', nonce);
    let url = URI(`${baseUrl}/oauth2/auth`);

    let query = {
        "response_type": encodeURI("token id_token"),
        "scope": encodeURI(scopes),
        "nonce": nonce,
        "client_id": encodeURI(oauth2ClientId),
        "redirect_uri": encodeURI(redirectUri)
    };

    if (prompt) {
        query['prompt'] = prompt;
    }

    if (provider) {
        query['provider'] = provider;
    }

    if (tokenIdHint) {
        query['id_token_hint'] = tokenIdHint;
    }

    url = url.query(query);
    console.log(`getAuthUrl ${url.toString()}`);
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

export const doLogin = (backUrl = null, provider = null, prompt = 'consent') => {
    let url = getAuthUrl(backUrl,prompt, null,  provider);
    let location = getCurrentLocation()
    location.replace(url.toString());
}

export const onUserAuth = (accessToken, idToken, sessionState) => (dispatch) => {
    dispatch({
        type: SET_LOGGED_USER,
        payload: {accessToken, idToken, sessionState}
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

export const getUserInfo = (expand = 'groups', backUrl = null, history = null, errorHandler = null ) => (dispatch, getState) => {

    let AllowedUserGroups = getAllowedUserGroups();
    AllowedUserGroups = AllowedUserGroups !== '' ? AllowedUserGroups.split(' ') : [];
    let {loggedUserState} = getState();
    let {accessToken, member} = loggedUserState;

    if (member != null) {
        if(history != null && backUrl != null)
            history.push(backUrl);
        return Promise.resolve();
    }

    if(errorHandler == null)
        errorHandler = authErrorHandler;

    dispatch(startLoading());

    return getRequest(
        createAction(REQUEST_USER_INFO),
        createAction(RECEIVE_USER_INFO),
        buildAPIBaseUrl(`/api/v1/members/me?expand=${expand}&access_token=${accessToken}`),
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

            if(history != null && backUrl != null)
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
