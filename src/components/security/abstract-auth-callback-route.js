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
import React from 'react';
import URI from "urijs";
import IdTokenVerifier from 'idtoken-verifier';
import {doLogin} from "./actions";
import {getCurrentHref, getCurrentPathName, getFromLocalStorage} from '../../utils/methods';

class AbstractAuthorizationCallbackRoute extends React.Component {

    constructor(issuer, audience, props) {
        super(props);

        const {access_token, id_token, session_state, error, error_description} = this.extractHashParams();

        console.log(`AbstractAuthorizationCallbackRoute::constructor error ${error} error_description ${error_description}`);

        this.state = {
            id_token_is_valid: true,
            error: null,
            error_description: null,
            issuer: issuer,
            audience: audience
        };

        if (error) {
            // if error condition short cut...
            this.state.error = error;
            this.state.error_description = error_description;
            return;
        }

        if (!access_token) {
            // re start flow
            doLogin(getCurrentPathName());
            return;
        }

        const id_token_is_valid = id_token ? this.validateIdToken(id_token) : false;
        this.state.id_token_is_valid = id_token_is_valid;
        this.state.error = error;
        this.state.error_description = error_description;

        if (access_token && id_token_is_valid) {
            props.onUserAuth(access_token, id_token, session_state);
            if(typeof window !== 'undefined') {
                if (window.location !== window.parent.location ) {
                    console.log("AbstractAuthorizationCallbackRoute::constructor running inside iframe, sending auth state to parent");
                    window.parent.postMessage(JSON.stringify({
                        action : 'SET_AUTH_INFO_SILENTLY',
                        access_token : access_token,
                        id_token : id_token,
                        session_state : session_state
                    }),  window.location.origin);
                }
            }
        }
    }

    extractHashParams() {
        return URI.parseQuery(this.props.location.hash.substr(1));
    }

    validateIdToken(idToken) {
        let {audience, issuer} = this.state;
        let verifier = new IdTokenVerifier({
            issuer: issuer,
            audience: audience
        });
        let storedNonce = getFromLocalStorage('nonce', true);
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

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (nextProps.accessToken !== this.props.accessToken) {
            return true;
        }
        return false;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // if we have an access token refresh ...
        if (prevProps.accessToken !== this.props.accessToken) {
            let url = URI(getCurrentHref());
            let query = url.search(true);
            let fragment = URI.parseQuery(url.fragment());

            // purge fragment
            delete fragment['access_token'];
            delete fragment['expires_in'];
            delete fragment['token_type'];
            delete fragment['scope'];
            delete fragment['id_token'];
            delete fragment['session_state'];

            let backUrl = query.hasOwnProperty('BackUrl') ? query['BackUrl'] : null;

            if (fragment.lenght > 0) {
                backUrl += `#${URI.buildQuery(fragment)}`;
            }
            this._callback(backUrl);
        }
    }

    /**
     * Abstract
     * @param error
     * @private
     */
    _callback(backUrl) {
    }

    /**
     * Abstract
     * @param error
     * @private
     */
    _redirect2Error(error) {
    }

    _render(){
        return null;
    }
    render() {
        //console.log("AuthorizationCallbackRoute::render");
        let {id_token_is_valid, error, error_description} = this.state;

        if (error != null) {
            console.log(`AbstractAuthorizationCallbackRoute::render _redirect2Error error ${error}`)
            return this._redirect2Error(error);
        }

        if (!id_token_is_valid) {
            return this._redirect2Error("token_validation_error");
        }

        return this._render();
    }
}

export default AbstractAuthorizationCallbackRoute;

