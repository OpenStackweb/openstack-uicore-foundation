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
import {authErrorHandler, createAction, getRequest, showMessage, startLoading, stopLoading} from "../../utils/actions";
import {buildAPIBaseUrl, getAllowedUserGroups} from '../../utils/methods';
import { getAccessToken, storeAuthInfo, initLogOut} from './methods';

/**
 * @ignore
 */
export const SET_LOGGED_USER = 'SET_LOGGED_USER';
export const LOGOUT_USER = 'LOGOUT_USER';
export const REQUEST_USER_INFO = 'REQUEST_USER_INFO';
export const RECEIVE_USER_INFO = 'RECEIVE_USER_INFO';
export const CLEAR_SESSION_STATE = 'CLEAR_SESSION_STATE';
export const UPDATE_SESSION_STATE_STATUS = 'UPDATE_SESSION_STATE_STATUS';
export const SESSION_STATE_STATUS_UNCHANGED = 'unchanged';
export const SESSION_STATE_STATUS_CHANGED = 'changed';
export const SESSION_STATE_STATUS_ERROR = 'error';

export const onUserAuth = (accessToken, idToken, sessionState, expiresIn = 0, refreshToken = null) => (dispatch) => {

    storeAuthInfo(accessToken, expiresIn, refreshToken, idToken);

    dispatch({
        type: SET_LOGGED_USER,
        payload: { sessionState }
    });
}

export const doLogout = (backUrl) => (dispatch, getState) => {
    dispatch({
        type: LOGOUT_USER,
        payload: {backUrl: backUrl}
    });
}

export const getUserInfo =  (expand = 'groups', backUrl = null, history = null, errorHandler = null ) => async (dispatch, getState) => {

    let AllowedUserGroups = getAllowedUserGroups();
    AllowedUserGroups = AllowedUserGroups !== '' ? AllowedUserGroups.split(' ') : [];
    let {loggedUserState} = getState();
    let {member} = loggedUserState;

    let accessToken = await getAccessToken();

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