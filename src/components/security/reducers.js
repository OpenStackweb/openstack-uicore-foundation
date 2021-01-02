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
    LOGOUT_USER,
    SET_LOGGED_USER,
    RECEIVE_USER_INFO,
    CLEAR_SESSION_STATE,
    SESSION_STATE_STATUS_UNCHANGED,
    UPDATE_SESSION_STATE_STATUS,
    UPDATE_ACCESS_TOKEN,
} from './actions';
import IdTokenVerifier from 'idtoken-verifier';

import {storeAuthInfo, clearAuthInfo, getOAuth2IDPBaseUrl, getOAuth2ClientId, updateAuthInfo} from '../../utils/methods';

const DEFAULT_STATE = {
    isLoggedUser: false,
    accessToken: null,
    member: null,
    idToken: null,
    sessionState: null,
    expiresIn: null,
    accessTokenUpdatedAt: null,
    backUrl : null,
    sessionStateStatus: SESSION_STATE_STATUS_UNCHANGED,
    refreshToken : null,
};

export const loggedUserReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    let issuer              = getOAuth2IDPBaseUrl();
    let audience            = getOAuth2ClientId();

    switch(type) {
        case SET_LOGGED_USER: {
            let { accessToken, idToken, sessionState, refreshToken, expiresIn } = action.payload;
            storeAuthInfo(accessToken, idToken, sessionState, expiresIn, refreshToken);
            return {...state,
                isLoggedUser:true,
                accessToken,
                idToken,
                sessionState,
                backUrl : null,
                refreshToken: refreshToken,
                expiresIn: expiresIn,
                accessTokenUpdatedAt: Math.floor(Date.now() / 1000),
            };
        }
        case UPDATE_ACCESS_TOKEN: {
            let { accessToken, refreshToken, expiresIn } = action.payload;
            updateAuthInfo(accessToken, expiresIn, refreshToken);
            // console.log(`UPDATE_ACCESS_TOKEN new access token ${accessToken} expiresIn ${expiresIn}`);
            let update = {
                accessToken,
                expiresIn: expiresIn,
                accessTokenUpdatedAt: Math.floor(Date.now() / 1000),
            };

            if(refreshToken !== null){
                update['refreshToken'] = refreshToken;
            }

            return {...state, ...update};
        }
        break;
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
                accessToken:null,
                idToken:null,
                sessionState:null,
                backUrl : null,
                refreshToken: null,
                expiresIn: null,
                accessTokenUpdatedAt: null,
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

                let jwt       = verifier.decode(idToken);
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
        break;
        default:
            return state;
    }

}
