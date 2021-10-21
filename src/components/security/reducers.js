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

import {
    CLEAR_SESSION_STATE,
    LOGOUT_USER,
    RECEIVE_USER_INFO,
    SESSION_STATE_STATUS_UNCHANGED,
    SET_LOGGED_USER,
    UPDATE_SESSION_STATE_STATUS,
    UPDATE_USER_INFO
} from './actions';

import IdTokenVerifier from 'idtoken-verifier';

import {clearAuthInfo, getIdToken, getOAuth2ClientId, getOAuth2IDPBaseUrl} from './methods';

const DEFAULT_STATE = {
    isLoggedUser: false,
    member: null,
    sessionState: null,
    backUrl : null,
    sessionStateStatus: SESSION_STATE_STATUS_UNCHANGED,
};

export const loggedUserReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    let issuer              = getOAuth2IDPBaseUrl();
    let audience            = getOAuth2ClientId();

    switch(type) {
        case SET_LOGGED_USER: {
            let { sessionState } = action.payload;
            return {...state,
                isLoggedUser:true,
                sessionState,
                backUrl : null,
                sessionStateStatus: SESSION_STATE_STATUS_UNCHANGED
            };
        }
        case UPDATE_SESSION_STATE_STATUS:{
            let { sessionStateStatus } = action.payload;
            return {...state, sessionStateStatus:sessionStateStatus};
        }
        break;
        case CLEAR_SESSION_STATE:
        {
            clearAuthInfo();
            return {...state,
                isLoggedUser:false,
                sessionState:null,
                backUrl : null,
            };
        }
        break;
        case LOGOUT_USER : {
            clearAuthInfo();
            return {...DEFAULT_STATE, backUrl: payload.backUrl};
        }
        break;
        case RECEIVE_USER_INFO: {

            let { response } = action.payload;

            if(issuer !== '' && audience !== '') {
                // check on idp groups
                let verifier = new IdTokenVerifier({
                    issuer: issuer,
                    audience: audience
                });

                let jwt       = verifier.decode(getIdToken());
                let idpGroups = jwt.payload.groups || [];
                let address   = jwt.payload.address || {};
                // merge
                idpGroups = idpGroups.map((idpGroup) => { return {
                    id:idpGroup.id,
                    title: idpGroup.name,
                    description:  idpGroup.name,
                    code:idpGroup.slug,
                    created: idpGroup.created_at,
                    last_edited: idpGroup.updated_at
                }});

                response = {...response, groups: [...response.groups, ...idpGroups], address};
            }
            return {...state, member: response};
        }
        case UPDATE_USER_INFO:{
            let newMemberInfo = action.payload;
            return {...state, member: newMemberInfo};
        }
        break;
        default:
            return state;
    }

}
