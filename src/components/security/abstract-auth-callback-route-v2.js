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

import React, {useState, useEffect, memo} from 'react';
import PropTypes from "prop-types";
import URI from "urijs";
import {
    doLogin,
    emitAccessToken,
    getOAuth2Flow,
    RESPONSE_TYPE_IMPLICIT,
    RESPONSE_TYPE_CODE,
    validateIdToken, getAuthInfo
} from "./methods";
import {getCurrentPathName, getCurrentHref} from '../../utils/methods';

const AbstractAuthorizationCallbackRouteV2 = ({issuer, audience, location, callback, redirectToError, onUserAuth}) => {
    // we only use this for the redirectToError, so its initial state should be true
    const [isTokenValid, setTokenValid] = useState(true);
    const [errorRes, setErrorRes] = useState({error:null, description:null});
    const [accessToken, setAccessToken] = useState(null);
    const flow = getOAuth2Flow();

    useEffect(() => {
        if (flow === RESPONSE_TYPE_IMPLICIT) {
            implicitFlow();
        } else if (flow === RESPONSE_TYPE_CODE) {
            codeFlow();
        }
    }, []);


    useEffect(() => {
        console.log("accessToken", accessToken);

        if (accessToken) {
            const url = URI(getCurrentHref());
            const query = url.search(true);
            const fragment = URI.parseQuery(url.fragment());

            // purge fragment
            delete fragment['code'];
            delete fragment['access_token'];
            delete fragment['expires_in'];
            delete fragment['token_type'];
            delete fragment['scope'];
            delete fragment['id_token'];
            delete fragment['session_state'];

            let backUrl = query.hasOwnProperty('BackUrl') ? query['BackUrl'] : '/app';

            if (fragment.length > 0) {
                backUrl += `#${URI.buildQuery(fragment)}`;
            }

            callback(backUrl);
        }
    }, [accessToken]);

    const extractHashParams = () => {
        return URI.parseQuery(location.hash.substr(1));
    }

    const implicitFlow = async ()=> {
        // get data from url hash
        const {access_token, id_token, session_state, error, error_description, expires_in} = extractHashParams();

        if (error) {
            // if error condition short cut...
            setErrorRes({error, description: error_description});
            return;
        }

        if (!access_token) {
            // re start flow
            doLogin(getCurrentPathName());
            return;
        }

        const idTokenValid = id_token ? validateIdToken(id_token, issuer, audience) : false;

        setTokenValid(idTokenValid);
        setErrorRes({error: !idTokenValid ? "Invalid Token" : null, description: !idTokenValid ? "Invalid Token" : null});

        if (access_token && idTokenValid) {
            await onUserAuth(access_token, id_token, session_state, expires_in);

            // we need to set it after onUserAuth because it triggers the useEffect
            setAccessToken(access_token);


            if (typeof window !== 'undefined') {
                if (window.location !== window.parent.location) {
                    console.log("AbstractAuthorizationCallbackRouteV2::_implicitFlow running inside iframe, sending auth state to parent");
                    window.parent.postMessage(JSON.stringify({
                        action: 'SET_AUTH_INFO_SILENTLY',
                        access_token,
                        id_token,
                        session_state,
                        expires_in,
                    }), window.location.origin);
                }
            }
        }
    }

    const codeFlow = () => {
        const {code, session_state, error, error_description} = extractHashParams();

        if (error) {
            // if error condition short cut...
            // we set here directly bc we are at construction time
            setErrorRes({error, description: error_description});
            return;
        }

        if (!code) {
            // re start flow
            doLogin(getCurrentPathName());
            return;
        }

        let url = URI(getCurrentHref());
        let query = url.search(true);
        let backUrl = query.hasOwnProperty('BackUrl') ? query['BackUrl'] : null;
        // async code
        // console.log(`AbstractAuthorizationCallbackRouteV2::_codeFlow getting access token with code ${code}`)

        emitAccessToken(code, backUrl).then(async (response) => {
            // console.log(`AbstractAuthorizationCallbackRouteV2::_codeFlow [ASYNC] got response ${JSON.stringify(response)}`);
            const {id_token, access_token, refresh_token, expires_in, error: error2, error_description: error_description2} = response;

            if (error2) {
                // set with
                setErrorRes({error: error2, description: error_description2});
                return;
            }

            const idTokenValid = id_token ? validateIdToken(id_token, issuer, audience) : false;

            setTokenValid(idTokenValid);
            setErrorRes({error: !idTokenValid ? "Invalid Token" : null, description: !idTokenValid ? "Invalid Token" : null});

            if (access_token && idTokenValid) {
                console.log(`AbstractAuthorizationCallbackRouteV2::_codeFlow [ASYNC] onUserAuth`);
                await onUserAuth(access_token, id_token, session_state, expires_in, refresh_token);

                console.log("AUTH", access_token, getAuthInfo());

                // we need to set it after onUserAuth because it triggers the useEffect
                setAccessToken(access_token);

                if (typeof window !== 'undefined') {
                    if (window.location !== window.parent.location) {
                        console.log("AbstractAuthorizationCallbackRouteV2::_codeFlow running inside iframe, sending auth state to parent");
                        window.parent.postMessage(JSON.stringify({
                            action: 'SET_AUTH_INFO_SILENTLY',
                            access_token,
                            id_token,
                            session_state,
                            expires_in,
                            refresh_token
                        }), window.location.origin);
                    }
                }
            }
        }).catch((e) => {
            console.log(e);
            // re start flow
            doLogin(getCurrentPathName());
        })
    }

    if (errorRes?.error) {
        return redirectToError(`${errorRes?.error} - ${errorRes?.description}.`);
    }

    if (!isTokenValid) {
        return redirectToError("Token Validation Error - Token is invalid.");
    }

    return null;
}

AbstractAuthorizationCallbackRouteV2.propTypes = {
    issuer: PropTypes.string.isRequired,
    audience: PropTypes.string.isRequired,
    location: PropTypes.object.isRequired,
    callback: PropTypes.func,
    redirectToError: PropTypes.func,
    onUserAuth: PropTypes.func.isRequired
};

AbstractAuthorizationCallbackRouteV2.defaultProps = {
    callback: () => {},
    redirectToError: () => {}
}

export default memo(AbstractAuthorizationCallbackRouteV2);

