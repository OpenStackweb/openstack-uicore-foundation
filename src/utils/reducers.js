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

import {
    CLEAR_MESSAGE,
    SHOW_MESSAGE,
    STOP_LOADING,
    SET_SNACKBAR_MESSAGE,
    CLEAR_SNACKBAR_MESSAGE
} from './actions';

const DEFAULT_STATE = {
    msg: null,
    msg_type: null,
    params: {},
    loading: false,
    snackbarMessage: {
        title: "",
        html: "",
        type: "",
        httpCode: ""
    }
}

export const genericReducers  = function ( state = DEFAULT_STATE, action = {}) {
    const { type, payload } = action;

    switch(type) {
        case SHOW_MESSAGE:
            return {
                ...state,
                msg: payload.msg,
                msg_type: payload.msg_type,
            };

        case CLEAR_MESSAGE:
            return { ...state, msg: null };

        case STOP_LOADING:
            return { ...state, loading: false };

        case SET_SNACKBAR_MESSAGE: {
            return { ...state, snackbarMessage: payload };
        }
        case CLEAR_SNACKBAR_MESSAGE: {
            return { ...state, snackbarMessage: DEFAULT_STATE.snackbarMessage };
        }

        default:
            return state;
    }
};
