/**
 * Copyright 2017 OpenStack Foundation
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

import request from 'superagent';
import URI from "urijs";
let http = request;
import Swal from 'sweetalert2';
import T from "i18n-react/dist/i18n-react";
import {objectToQueryString, isClearingSessionState, setSessionClearingState, getCurrentPathName} from './methods';
import {doLogin, initLogOut, CLEAR_SESSION_STATE, LOGOUT_USER} from '../components/security/actions';

export const GENERIC_ERROR  = "Yikes. Something seems to be broken. Our web team has been notified, and we apologize for the inconvenience.";
export const RESET_LOADING  = 'RESET_LOADING';
export const START_LOADING  = 'START_LOADING';
export const STOP_LOADING   = 'STOP_LOADING';
export const VALIDATE       = 'VALIDATE';
export const CLEAR_MESSAGE  = 'CLEAR_MESSAGE';
export const SHOW_MESSAGE   = 'SHOW_MESSAGE';

export const createAction = type => payload => ({
    type,
    payload
});

export const resetLoading = createAction(RESET_LOADING);
export const startLoading = createAction(START_LOADING);
export const stopLoading  = createAction(STOP_LOADING);

const xhrs = {};

const cancel = (key) => {
    if(xhrs[key]) {
        xhrs[key].abort();
        console.log(`aborted request ${key}`);
        delete xhrs[key];
    }
}

const schedule = (key, req) => {
    // console.log(`scheduling ${key}`);
    xhrs[key] = req;
};

const isObjectEmpty = (obj) => {
    return Object.keys(obj).length === 0 && obj.constructor === Object ;
}

export const authErrorHandler = (err, res) => (dispatch, state) => {
    let code = err.status;
    let msg = '';

    dispatch(stopLoading());

    switch (code) {
        case 403:
            let error_message = {
                title: 'ERROR',
                html: T.translate("errors.user_not_authz"),
                type: 'error'
            };

            dispatch(showMessage( error_message, initLogOut ));
            break;
        case 401:
            let currentLocation = getCurrentPathName();
            let clearing_session_state = isClearingSessionState();

            dispatch({
                type: CLEAR_SESSION_STATE,
                payload: {}
            });

            if(!clearing_session_state) {
                setSessionClearingState(true);
                console.log('authErrorHandler 401 - re login');
                doLogin(currentLocation);
            }
            break;
        case 404:
            msg = "";

            if (err.response.body && err.response.body.message) msg = err.response.body.message;
            else if (err.response.error && err.response.error.message) msg = err.response.error.message;
            else msg = err.message;

            Swal.fire("Not Found", msg, "warning");

            break;
        case 412:
            for (var [key, value] of Object.entries(err.response.body.errors)) {
                if (isNaN(key)) {
                    msg += key + ': ';
                }

                msg += value + '<br>';
            }
            Swal.fire("Validation error", msg, "warning");
            dispatch({
                type: VALIDATE,
                payload: {errors: err.response.body.errors}
            });
            break;
        default:
            Swal.fire("ERROR", T.translate("errors.server_error"), "error");
    }
}

export const getRequest =(
    requestActionCreator,
    receiveActionCreator,
    endpoint,
    errorHandler = defaultErrorHandler,
    requestActionPayload = {},
    responseTimeout = 60, // secs,
    deadlineTimeout = 60, //secs,
    withCredentials = false
) => (params = {}) => (dispatch, state) => {

    let url = URI(endpoint);

    if(!isObjectEmpty(params))
        url = url.query(params);

    let key = url.toString();

    if(requestActionCreator && typeof requestActionCreator === 'function')
        dispatch(requestActionCreator(requestActionPayload));

    cancel(key);

    return new Promise((resolve, reject) => {
        let request = http.get(url.toString());

        if(withCredentials)
            request = request.withCredentials();

        request.timeout({
            response: (responseTimeout * 1000),
            deadline: (deadlineTimeout * 1000),
        })
        .end(responseHandler(dispatch, state, receiveActionCreator, errorHandler, resolve, reject))

        schedule(key, req);
    });
};

export const putRequest = (
    requestActionCreator,
    receiveActionCreator,
    endpoint,
    payload,
    errorHandler = defaultErrorHandler,
    requestActionPayload = {},
    withCredentials = false
) => (params = {}) => ( dispatch, state) => {

    let url = URI(endpoint);

    if(!isObjectEmpty(params))
        url = url.query(params);

    if(requestActionCreator && typeof requestActionCreator === 'function')
        dispatch(requestActionCreator(requestActionPayload));

    return new Promise((resolve, reject) => {
        if(payload == null)
            payload = {};
        let request = http.put(url.toString());

        if(withCredentials)
            request = request.withCredentials();

        request.send(payload)
            .end(responseHandler(dispatch, state, receiveActionCreator, errorHandler, resolve, reject))
    });
};

export const deleteRequest = (
    requestActionCreator,
    receiveActionCreator,
    endpoint,
    payload,
    errorHandler  = defaultErrorHandler,
    requestActionPayload = {},
    withCredentials = false
) => (params) => (dispatch, state) => {
    let url = URI(endpoint);

    if(!isObjectEmpty(params))
        url = url.query(params);

    if(requestActionCreator && typeof requestActionCreator === 'function')
        dispatch(requestActionCreator(requestActionPayload));

    return new Promise((resolve, reject) => {
        if(payload == null)
            payload = {};

        let request = http.delete(url);

        if(withCredentials)
            request = request.withCredentials();

        request.send(payload)
            .end(responseHandler(dispatch, state, receiveActionCreator, errorHandler, resolve, reject));
    });
};

export const postRequest = (
        requestActionCreator,
        receiveActionCreator,
        endpoint,
        payload,
        errorHandler = defaultErrorHandler,
        requestActionPayload = {},
        withCredentials = false
) => (params = {}) => (dispatch, state) => {

    let url = URI(endpoint);

    if(!isObjectEmpty(params))
        url = url.query(params);

    if(requestActionCreator && typeof requestActionCreator === 'function')
        dispatch(requestActionCreator(requestActionPayload));

    return new Promise((resolve, reject) => {

        let request = http.post(url);

        if(withCredentials)
            request = request.withCredentials();

        if(payload != null)
            request.send(payload);
        else // to be a simple CORS request
            request.set('Content-Type', 'text/plain');

        request.end(responseHandler(dispatch, state, receiveActionCreator, errorHandler, resolve, reject));
    });
};

export const postFile = (
    requestActionCreator,
    receiveActionCreator,
    endpoint,
    file,
    fileMetadata = {},
    errorHandler = defaultErrorHandler,
    requestActionPayload = {}
) => (params = {}) => (dispatch, state) => {

    let url = URI(endpoint);

    if(!isObjectEmpty(params))
        url = url.query(params);

    if(requestActionCreator && typeof requestActionCreator === 'function')
        dispatch(requestActionCreator(requestActionPayload));

    return new Promise((resolve, reject) => {

        const req = http.post(url)
                    .attach('file', file);

        if(!isObjectEmpty(fileMetadata)) {
            Object.keys(fileMetadata).forEach(function (key) {
                let value = fileMetadata[key];
                req.field(key, value);
            });
        }

        req.end(responseHandler(dispatch, state, receiveActionCreator, errorHandler, resolve, reject));
    });
};

export const putFile = (
    requestActionCreator,
    receiveActionCreator,
    endpoint,
    file = null,
    fileMetadata = {},
    errorHandler = defaultErrorHandler,
    requestActionPayload = {}
) => (params = {}) => (dispatch, state) => {

    let url = URI(endpoint);

    if(!isObjectEmpty(params))
        url = url.query(params);

    if(requestActionCreator && typeof requestActionCreator === 'function')
        dispatch(requestActionCreator(requestActionPayload));

    return new Promise((resolve, reject) => {

        const req = http.put(url);

        if(file != null){
            req.attach('file', file);
        }

        if(!isObjectEmpty(fileMetadata)) {
            Object.keys(fileMetadata).forEach(function (key) {
                let value = fileMetadata[key];
                req.field(key, value);
            });
        }

        req.end(responseHandler(dispatch, state, receiveActionCreator, errorHandler, resolve, reject));
    });
};

export const defaultErrorHandler = (err, res) => (dispatch) => {
    let body = res.body;
    let text = '';
    if(body instanceof Object){
        if(body.hasOwnProperty('message'))
            text = body.message;
    }
    Swal.fire(res.statusText, text, "error");
}

export const responseHandler =
    ( dispatch, state, receiveActionCreator, errorHandler, resolve, reject ) =>
    (err, res) => {
    if (err || !res.ok) {
        if(errorHandler) {
            errorHandler(err, res)(dispatch, state);
        }
        return reject({ err, res, dispatch, state })
    }
    let json = res.body;
    if(typeof receiveActionCreator === 'function') {
        dispatch(receiveActionCreator({response: json}));
        return resolve({response: json});
    }
    dispatch(receiveActionCreator);
    return resolve({response: json});
}


export const fetchErrorHandler = (response) => {
    let code = response.status;
    let msg = response.statusText;

    switch (code) {
        case 403:
            Swal.fire("ERROR", T.translate("errors.user_not_authz"), "warning");
            break;
        case 401:
            Swal.fire("ERROR", T.translate("errors.session_expired"), "error");
            break;
        case 412:
            Swal.fire("ERROR", msg, "warning");
        case 500:
            Swal.fire("ERROR", T.translate("errors.server_error"), "error");
    }
}

export const fetchResponseHandler = (response) => {
    if (!response.ok) {
        throw response;
    } else {
        return response.json();
    }
}

export const showMessage = (settings, callback = {}) => (dispatch) => {
    dispatch(stopLoading());

    Swal.fire(settings).then((result) => {
        if (result.value && typeof callback === 'function') {
            callback();
        }
    });
}

export const showSuccessMessage = (html) => (dispatch) => {
    dispatch(stopLoading());
    Swal.fire({
        title: T.translate("general.done"),
        html: html,
        type: 'success'
    });
}

export const downloadFileByContent = (filename, content, mime) => {
    let link = document.createElement('a');
    link.textContent = 'download';
    link.download = filename;
    link.href = `data:${mime},${encodeURIComponent(content)}`
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
}

export const getCSV = (endpoint, params, filename, header = null) => (dispatch) => {

    let url = URI(endpoint);

    if(!isObjectEmpty(params))
        url = url.query(params);

    dispatch(startLoading());

    return fetch(url.toString())
        .then((response) => {
            if (!response.ok) {
                throw response;
            } else {
                return response.text();
            }
        })
        .then((csv) => {
            dispatch(stopLoading());

            if (header) {
                csv = header + '\r\r' + csv;
            }
            downloadFileByContent(filename, csv, 'text/csv;charset=utf-8');
        })
        .catch(fetchErrorHandler);
};

export const getRawCSV = (endpoint, params, header = null) => {

    let url = URI(endpoint);

    if(!isObjectEmpty(params))
        url = url.query(params);

    return fetch(url.toString())
        .then((response) => {
            if (!response.ok) {
                throw response;
            } else {
                return response.text();
            }
        })
        .then((csv) => {
            if (header) {
                csv = header + '\r\r' + csv;
            }

          return csv;
        })
        .catch(fetchErrorHandler);
};

export const escapeFilterValue = (value) => {
    value = value.replace(/,/g, "\\,");
    value = value.replace(/;/g, "\\;");
    return value;
};