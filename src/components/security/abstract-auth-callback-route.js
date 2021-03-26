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
import {doLogin, emitAccessToken, getOAuth2Flow, RESPONSE_TYPE_IMPLICIT, RESPONSE_TYPE_CODE} from "./methods";
import {getFromLocalStorage, getCurrentPathName, getCurrentHref} from '../../utils/methods';

class AbstractAuthorizationCallbackRoute extends React.Component {

    constructor(issuer, audience, props) {
        // console.log('AbstractAuthorizationCallbackRoute::constructor init');
        super(props);

        let flow = getOAuth2Flow();

        // initial state
        this.state = {
            id_token_is_valid: true,
            error: null,
            error_description: null,
            issuer: issuer,
            audience: audience,
            accessToken: null,
        };

        if (flow === RESPONSE_TYPE_IMPLICIT) {
            this._implicitFlow();
        }

        if (flow === RESPONSE_TYPE_CODE) {
            this._codeFlow();
        }

        // console.log('AbstractAuthorizationCallbackRoute::constructor finish');
    }

    _implicitFlow(){
        const {access_token, id_token, session_state, error, error_description, expires_in} = this.extractHashParams();

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
            // set the state synchronusly bc we are on constructor context
            this.state.id_token_is_valid = id_token_is_valid;
            this.state.error = !id_token_is_valid ? "Invalid Token" : null;
            this.state.error_description = !id_token_is_valid ? "Invalid Token" : null;
            this.state.accessToken = access_token;
            if (access_token && id_token_is_valid) {
                this.props.onUserAuth(access_token, id_token, session_state, expires_in);
                if(typeof window !== 'undefined') {
                    if (window.location !== window.parent.location ) {
                        console.log("AbstractAuthorizationCallbackRoute::_implicitFlow running inside iframe, sending auth state to parent");
                        window.parent.postMessage(JSON.stringify({
                            action : 'SET_AUTH_INFO_SILENTLY',
                            access_token : access_token,
                            id_token : id_token,
                            session_state : session_state,
                            expires_in: expires_in,
                        }),  window.location.origin);
                    }
                }
            }
    }

    _codeFlow() {

        const {code, session_state, error, error_description} = this.extractHashParams();

        if (error) {
            // if error condition short cut...
            // we set here directly bc we are at construction time
            this.state.error = error;
            this.state.error_description = error_description;
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
        // console.log(`AbstractAuthorizationCallbackRoute::_codeFlow getting access token with code ${code}`)

        emitAccessToken(code, backUrl).then(response => {
            // console.log(`AbstractAuthorizationCallbackRoute::_codeFlow [ASYNC] got response ${JSON.stringify(response)}`);
            let { id_token, access_token, refresh_token, expires_in,  error: error2, error_description: error_description2} = response;

            if(error2){
                // set with
                this.setState({
                    ...this.state,
                    error: error2,
                    error_description:error_description2
                });
                return;
            }

            const id_token_is_valid = id_token ? this.validateIdToken(id_token) : false;

            // this.state.id_token_is_valid = id_token_is_valid;
            //this.state.error = !id_token_is_valid ? "Invalid Token" : error;
            //this.state.error_description = !id_token_is_valid ? "Invalid Token" : error_description;

            // set with
            // console.log(`AbstractAuthorizationCallbackRoute::_codeFlow [ASYNC] setting state`);
            // set the state asynchronusly bc we are not  on constructor context
            this.setState({
                ...this.state,
                id_token_is_valid: id_token_is_valid,
                accessToken:access_token,
                error: !id_token_is_valid ? "Invalid Token" : error,
                error_description:!id_token_is_valid ? "Invalid Token" : error_description,
            });

            if (access_token && id_token_is_valid) {
                // console.log(`AbstractAuthorizationCallbackRoute::_codeFlow [ASYNC] onUserAuth`);
                this.props.onUserAuth(access_token, id_token, session_state, expires_in, refresh_token);
                if(typeof window !== 'undefined') {
                    if (window.location !== window.parent.location ) {
                        console.log("AbstractAuthorizationCallbackRoute::_codeFlow running inside iframe, sending auth state to parent");
                        window.parent.postMessage(JSON.stringify({
                            action : 'SET_AUTH_INFO_SILENTLY',
                            access_token : access_token,
                            id_token : id_token,
                            session_state : session_state,
                            expires_in : expires_in,
                            refresh_token : refresh_token
                        }),  window.location.origin);
                    }
                }
            }
        });
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
        return tnonce === storedNonce && aud === audience && iss === issuer;
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {

        if (nextState.accessToken !== this.state.accessToken) {
            return true;
        }
        if(nextState.error !== this.state.error){
            return true;
        }

        if(nextState.id_token_is_valid !== this.state.id_token_is_valid){
            return true;
        }

        return false;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // if we have an access token refresh ...
        if (prevState.accessToken !== this.state.accessToken) {

            let url = URI(getCurrentHref());
            let query = url.search(true);
            let fragment = URI.parseQuery(url.fragment());

            // purge fragment
            delete fragment['code'];
            delete fragment['access_token'];
            delete fragment['expires_in'];
            delete fragment['token_type'];
            delete fragment['scope'];
            delete fragment['id_token'];
            delete fragment['session_state'];

            let backUrl = query.hasOwnProperty('BackUrl') ? query['BackUrl'] : '/app';

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

    render() {

        let {id_token_is_valid, error, error_description} = this.state;

        if (error != null) {
            return this._redirect2Error(`${error} - ${error_description}.`);
        }

        if (!id_token_is_valid) {
            return this._redirect2Error("Token Validation Error - Token is invalid.");
        }

        return null;
    }
}

export default AbstractAuthorizationCallbackRoute;

