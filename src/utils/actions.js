/**
 * Copyright 2017 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific flanguage governing permissions and
 * limitations under the License.
 **/

import request from 'superagent/lib/client';
import URI from "urijs";
let http = request;
import Swal from 'sweetalert2';
import T from "i18n-react/dist/i18n-react";
import { isClearingSessionState, setSessionClearingState, getCurrentPathName } from './methods';
import { CLEAR_SESSION_STATE } from '../components/security/actions';
import { doLogin, initLogOut } from '../components/security/methods';

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
const etagCache = {};

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

const buildNotifyHandlerPayload = (httpCode, title, content, type) => ({ httpcode, title, html: content, type });
const buildNotifyHandlerErrorPayload = (httpCode, title, content) => buildNotifyHandlerPayload(httpcode, title, content, "error");
const buildNotifyHandlerWarningPayload = (httpCode, title, content) => buildNotifyHandlerPayload(httpcode, title, content, "warning");

const initLogin = () => (dispatch) => {
    const currentLocation = getCurrentPathName();
    const clearingSessionState = isClearingSessionState();
    dispatch({
        type: CLEAR_SESSION_STATE,
        payload: {}
    });
    if (!clearingSessionState) {
        setSessionClearingState(true);
        console.log("authErrorHandler 401 - re login");
        doLogin(currentLocation);
    }
};

export const authErrorHandler = (
    err,
    res,
    notifyErrorHandler = showMessage
) => (dispatch, state) => {

    const code = err.status;
    let msg = "";
    let payload, callback;

    dispatch(stopLoading());

    switch (code) {
        case 401:
            if (notifyErrorHandler !== showMessage) {
                payload = buildNotifyHandlerErrorPayload(code, "ERROR", T.translate("errors.user_not_auth"));
                callback = () => initLogin()(dispatch);
            } else {
                initLogin()(dispatch);
            }
            break;
        case 403:
            payload = buildNotifyHandlerErrorPayload(code, "ERROR", T.translate("errors.user_not_authz"));
            callback = initLogOut;
            break;
        case 404:
            msg = err.response.body?.message || err.response.error?.message || err.message;
            payload = buildNotifyHandlerWarningPayload(code, "Not Found", msg);
            break;
        case 412:
            for (const [key, value] of Object.entries(err.response.body.errors)) {
                msg += isNaN(key) ? `${key}: ` : "";
                msg += `${value}<br>`;
            }
            dispatch({
                type: VALIDATE,
                payload: { errors: err.response.body.errors }
            });
            payload = buildNotifyHandlerWarningPayload(code, "Validation error", msg);
            break;
        default:
            payload = buildNotifyHandlerErrorPayload(code, "ERROR", T.translate("errors.server_error"));
    }

    if (payload) notifyError(payload, callback);
}

export const getRequest =(
    requestActionCreator,
    receiveActionCreator,
    endpoint,
    errorHandler = defaultErrorHandler,
    requestActionPayload = {},
    useEtag = false
) => (params = {}) => (dispatch, state) => {

    let url = URI(endpoint);
    let key = url.toString();

    if(!isObjectEmpty(params)) {
        // remove the access token
        const { access_token: _, ...newParams} = params;
        // and generate new key
        key = url.query(newParams).toString();
        url = url.query(params);
    }

    if(requestActionCreator && typeof requestActionCreator === 'function')
        dispatch(requestActionCreator(requestActionPayload));

    cancel(key);

    return new Promise((resolve, reject) => {
        let req = http.get(url.toString());
        if(useEtag && etagCache.hasOwnProperty(key)){
            const { etag } = etagCache[key];
            if(etag){
                req.set('If-None-Match', etag)
            }
        }

        req.timeout({
            response: 60000,
            deadline: 60000,
        })
        .end(responseHandler(dispatch, state, receiveActionCreator, errorHandler, resolve, reject, key, useEtag))

        schedule(key, req);
    });
};

export const putRequest = (
    requestActionCreator,
    receiveActionCreator,
    endpoint,
    payload,
    errorHandler = defaultErrorHandler,
    requestActionPayload = {}
) => (params = {}) => ( dispatch, state) => {

    let url = URI(endpoint);

    if(!isObjectEmpty(params))
        url = url.query(params);

    if(requestActionCreator && typeof requestActionCreator === 'function')
        dispatch(requestActionCreator(requestActionPayload));

    return new Promise((resolve, reject) => {
        if(payload == null)
            payload = {};
        http.put(url.toString())
            .send(payload)
            .end(responseHandler(dispatch, state, receiveActionCreator, errorHandler, resolve, reject))
    });
};

export const deleteRequest = (
    requestActionCreator,
    receiveActionCreator,
    endpoint,
    payload,
    errorHandler  = defaultErrorHandler,
    requestActionPayload = {}
) => (params) => (dispatch, state) => {
    let url = URI(endpoint);

    if(!isObjectEmpty(params))
        url = url.query(params);

    if(requestActionCreator && typeof requestActionCreator === 'function')
        dispatch(requestActionCreator(requestActionPayload));

    return new Promise((resolve, reject) => {
        if(payload == null)
            payload = {};

        http.delete(url)
            .send(payload)
            .end(responseHandler(dispatch, state, receiveActionCreator, errorHandler, resolve, reject));
    });
};

export const postRequest = (
        requestActionCreator,
        receiveActionCreator,
        endpoint,
        payload,
        errorHandler = defaultErrorHandler,
        requestActionPayload = {}
) => (params = {}) => (dispatch, state) => {

    let url = URI(endpoint);

    if(!isObjectEmpty(params))
        url = url.query(params);

    if(requestActionCreator && typeof requestActionCreator === 'function')
        dispatch(requestActionCreator(requestActionPayload));

    return new Promise((resolve, reject) => {

        let request = http.post(url);

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

const byLowerCase = toFind => value => toLowerCase(value) === toFind;
const toLowerCase = value => value.toLowerCase();
const getKeys = headers => Object.keys(headers);

export const getHeaderCaseInsensitive = (headerName, headers = {}) => {
    const key = getKeys(headers).find(byLowerCase(headerName));
    return key ? headers[key] : undefined;
};

export const responseHandler = ( dispatch, state, receiveActionCreator, errorHandler, resolve, reject, key = null, useEtag= false ) =>

    (err, res) => {

    if (err || !res.ok) {
        let code = err.status;

        if(code === 304 && etagCache.hasOwnProperty(key) && useEtag){
            const { body } = etagCache[key];

            if(typeof receiveActionCreator === 'function') {
                dispatch(receiveActionCreator({response: body}));
                return resolve({response: body});
            }

            dispatch(receiveActionCreator);
            return resolve({response: body});
        }
        if(errorHandler) {
            errorHandler(err, res)(dispatch, state);
        }
        return reject({ err, res, dispatch, state })
    }

    let json = res.body;

    if(useEtag) {
        const responseETAG = getHeaderCaseInsensitive('etag', res.headers);
        if (responseETAG) {
            etagCache[key] = { etag: responseETAG, body: json};
        }
    }

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

export const showMessage = (settings, callback = null) => (dispatch) => {
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
