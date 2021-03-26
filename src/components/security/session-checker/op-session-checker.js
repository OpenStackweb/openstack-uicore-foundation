/**
 * Copyright 2020 OpenStack Foundation
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
import {connect} from "react-redux";

import {
    doLogout,
    SESSION_STATE_STATUS_CHANGED,
    SESSION_STATE_STATUS_ERROR,
    SESSION_STATE_STATUS_UNCHANGED,
    updateSessionStateStatus,
    onUserAuth
} from "../actions";

import {
    getAuthUrl,
    initLogOut
} from "../methods";

import URI from "urijs"
// in minutes
const CHECK_SESSION_INTERVAL = (1000 * 60) * 30;

class OPSessionChecker extends React.Component {

    constructor(props) {
        //console.log("OPSessionChecker::constructor");
        super(props);
        this.state ={
            opFrame_src: "",
            rpCheckSessionStateFrame_src : ""
        }
        this.receiveMessage = this.receiveMessage.bind(this);
        this.receiveMessageFromChild = this.receiveMessageFromChild.bind(this);
        this.setTimer = this.setTimer.bind(this);
        this.checkSession = this.checkSession.bind(this);
        this.onSetupCheckSessionRP = this.onSetupCheckSessionRP.bind(this);
        this.rpCheckSessionStateFrameOnLoad = this.rpCheckSessionStateFrameOnLoad.bind(this);

        this.opFrame = null;
        this.rpCheckSessionStateFrame = null;

        this.setOPFrameRef = element => {
            this.opFrame = element;
        };

        this.setCheckSessionStateFrameRef = element => {
            this.rpCheckSessionStateFrame = element;
        };

        this.interval = null;
    }

    componentWillUnmount() {
        //console.log(`OPSessionChecker::componentWillUnmount`);
        try {
            if (this.interval) {
                window.clearInterval(this.interval);
                this.interval = null;
            }
            window.removeEventListener('message', this.receiveMessageFromChild, false);
            window.removeEventListener("message", this.receiveMessage, false);
        }
        catch (e){
            console.log(e);
        }
    }

    componentDidMount() {
        if(!this.props.isLoggedUser) return;
        //console.log("OPSessionChecker::componentDidMount");
        // add event listener to receive messages from idp through OP frame
        if(typeof window !== 'undefined') {
            if ( window.location !== window.parent.location ) {
                //console.log("OPSessionChecker::componentDidMount running inside iframe, skipping");
                return;
            }
            // set up op frame
            this.onSetupCheckSessionRP();
        }
    }

    rpCheckSessionStateFrameOnLoad(event){
        //console.log("OPSessionChecker::rpCheckSessionStateFrameOnLoad");
        let frame = event.target;
        if(this.state.rpCheckSessionStateFrame_src == "") return;

        //console.log(`OPSessionChecker::rpCheckSessionStateFrameOnLoad frame.src ${frame.src}`);
        // this is called bc we set the RP frame to check the session state with promp=none
        if(!frame.contentDocument){
            //console.log("OPSessionChecker::rpCheckSessionStateFrameOnLoad !frame.contentDocument) is null");
            return;
        }

        window.removeEventListener('message', this.receiveMessageFromChild, false);
        let resultUrl = new URI(frame.contentDocument.URL);
        // test the result Url1qa
        console.log("OPSessionChecker::rpCheckSessionStateFrameOnLoad - resultUrl " + resultUrl);
        let query = resultUrl.search(true);
        let fragment = URI.parseQuery(resultUrl.fragment());
        // check if we have some error on query string or fragment
        let error = null;
        if(query.hasOwnProperty("error")) error = query['error'];
        if(fragment.hasOwnProperty("error")) error = fragment['error'];
        if(error){
            console.log("OPSessionChecker::rpCheckSessionStateFrameOnLoad - error " + error);
            // check session state with prompt none failed do logout;
            //console.log('OPSessionChecker::rpCheckSessionStateFrameOnLoad - initiating logout');
            initLogOut();
            return;
        }
        // no error we still logged so re init the checking
        // set up op frame
        //console.log(`OPSessionChecker::rpCheckSessionStateFrameOnLoad this.props.sessionStateStatus ${this.props.sessionStateStatus}`);
        this.props.updateSessionStateStatus(SESSION_STATE_STATUS_UNCHANGED);
    }

    componentDidUpdate(prevProps) {
        //console.log("OPSessionChecker::componentDidUpdate");
        if (this.props.sessionStateStatus !== prevProps.sessionStateStatus) {
            if(this.props.sessionStateStatus === SESSION_STATE_STATUS_CHANGED){
                //console.log("OPSessionChecker::componentDidUpdate sessionStateStatus === changed");
                let url = getAuthUrl(null, 'none');
                // https://openid.net/specs/openid-connect-session-1_0.html#RPiframe
                // set the frame to idp
                if(this.state.rpCheckSessionStateFrame_src == "")
                    this.setState({...this.state, opFrame_src : "", rpCheckSessionStateFrame_src : url.toString()});
                return;
            }
            if(this.props.sessionStateStatus === SESSION_STATE_STATUS_UNCHANGED){
                //console.log("OPSessionChecker::componentDidUpdate sessionStateStatus === unchanged");
                this.onSetupCheckSessionRP();
                return;
            }
        }
        if(this.props.sessionState !== prevProps.sessionState){
            console.log(`OPSessionChecker::componentDidUpdate updated session state ${this.props.sessionState}`);
            this.onSetupCheckSessionRP();
        }
    }

    checkSession()
    {

        let now = new Date();
        console.log(`OPSessionChecker::checkSession now ${now.toLocaleString()}`);

        if(this.opFrame == null ){
            //console.log("OPSessionChecker::checkSession - this.opFrame == null ");
            return;
        }

        if(this.props.sessionState == null){
            //console.log("OPSessionChecker::checkSession - this.props.sessionState == null ");
            return;
        }

        if(this.props.clientId == null){
            //console.log("OPSessionChecker::checkSession - this.props.clientId == null ");
            return;
        }

        let targetOrigin = this.props.idpBaseUrl;
        let frame = this.opFrame.contentWindow;
        let message = this.props.clientId + " " + this.props.sessionState;
        //console.log("OPSessionChecker::checkSession - message" + message);
        // postMessage to the OP iframe
        frame.postMessage(message, targetOrigin);
    }

    setTimer(event)
    {
        let frame = event.target;
        if(this.state.opFrame_src == "") return;
        //console.log("OPSessionChecker::setTimer");

        if(!this.props.isLoggedUser){
            //console.log("OPSessionChecker::setTimer - !this.props.isLoggedUser");
            return;
        }

        if(this.props.sessionStateStatus !== SESSION_STATE_STATUS_UNCHANGED ){
            //console.log("OPSessionChecker::setTimer - this.props.sessionStateStatus");
            return;
        }

        if(typeof window !== 'undefined') {
            console.log(`OPSessionChecker::setTimer setting interval ${CHECK_SESSION_INTERVAL}`);
            this.interval = window.setInterval(this.checkSession, CHECK_SESSION_INTERVAL);
        }
    }

    onSetupCheckSessionRP(){
        // https://openid.net/specs/openid-connect-session-1_0.html#OPiframe
        // console.log("OPSessionChecker::onSetupCheckSessionRP");
        if(this.opFrame == null){
            //console.log("OPSessionChecker::onSetupCheckSessionRP - opFrame is null");
            return;
        }
        window.addEventListener("message", this.receiveMessage, false);
        const sessionCheckEndpoint = `${this.props.idpBaseUrl}/oauth2/check-session`;
        //console.log("OPSessionChecker::onSetupCheckSessionRP - sessionCheckEndpoint "+ sessionCheckEndpoint);
        if(this.state.opFrame_src == "")
            this.setState({...this.state, opFrame_src : sessionCheckEndpoint, rpCheckSessionStateFrame_src : ""});
    }

    receiveMessageFromChild(e){
        if (typeof e.data === 'string' || e.data instanceof String){
            try {
                let authInfo = JSON.parse(e.data);
                if (authInfo.hasOwnProperty('action') && authInfo.action == 'SET_AUTH_INFO_SILENTLY') {
                    window.removeEventListener('message', this.receiveMessageFromChild, false);
                    this.props.onUserAuth(
                        authInfo.access_token,
                        authInfo.id_token,
                        authInfo.session_state,
                        authInfo.expires_in,
                        authInfo.hasOwnProperty("refresh_token") ? authInfo.refresh_token : null
                    );
                }
            }
            catch (e){
                console.log(e);
            }
        }
    }

    receiveMessage(e)
    {
        //console.log("OPSessionChecker::receiveMessage - e.origin " + e.origin);
        if (e.origin !== this.props.idpBaseUrl ) {
            //console.log("OPSessionChecker::receiveMessage - e.origin !== this.props.idpBaseUrl");
            return;
        }
        let status = e.data;
        //console.log("OPSessionChecker::receiveMessage - status "+ status);
        //console.log("OPSessionChecker::receiveMessage - this.props.sessionStateStatus "+ this.props.sessionStateStatus);
        //console.log("OPSessionChecker::receiveMessage - this.props.isLoggedUser "+ this.props.isLoggedUser);
        if(this.props.sessionStateStatus === SESSION_STATE_STATUS_UNCHANGED && this.props.isLoggedUser){
            if(status === SESSION_STATE_STATUS_CHANGED) {
                console.log("OPSessionChecker::receiveMessage - session state has changed on OP");
                // signal session start check
                // kill timer

                if(typeof window !== 'undefined')
                    window.clearInterval(this.interval);
                this.interval = null;
                /**
                 * When the RP detects a session state change, it SHOULD first try a prompt=none request within an
                 * iframe to obtain a new ID Token and session state, sending the old ID Token as the id_token_hint.
                 * If the RP receives an ID token for the same End-User, it SHOULD simply update the value of the
                 * session state. If it does not receive an ID token or receives an ID token for another End-User,
                 * then it needs to handle this case as a logout for the original End-User. If the original End-User
                 * is already logged out at the RP when the state changes indicate that End-User should be logged out,
                 * the logout is considered to have succeeded.
                 */
                window.addEventListener('message', this.receiveMessageFromChild, false);
                window.removeEventListener("message", this.receiveMessage, false);
                this.props.updateSessionStateStatus(SESSION_STATE_STATUS_CHANGED);
                return;
            }
        }
    }

    render() {
        if(!this.props.isLoggedUser) return null;
        if(typeof window !== 'undefined') {
            if ( window.location !== window.parent.location ) {
                //console.log("OPSessionChecker::render running inside iframe, skipping");
                return null
            }
        }
        //console.log("OPSessionChecker::render");
        return(
            <div style={{height: '0px'}}>
                <iframe
                    ref={this.setOPFrameRef}
                    id="OPFrame" onLoad={this.setTimer}
                    src={this.state.opFrame_src}
                    style={{visibility:'hidden', position: 'absolute', left: 0, top: 0, border: 'none', width:0 , height:0}}>></iframe>
                <iframe ref={this.setCheckSessionStateFrameRef}
                        id="RPCHeckSessionStateFrame"
                        src={this.state.rpCheckSessionStateFrame_src}
                        onLoad={this.rpCheckSessionStateFrameOnLoad}
                        style={{visibility:'hidden', position: 'absolute', left: 0, top: 0, border: 'none', width:0 , height:0}}>></iframe>
            </div>
        );
    }
}

const mapStateToProps = ({ loggedUserState }) => ({
    sessionState: loggedUserState.sessionState,
    isLoggedUser: loggedUserState.isLoggedUser,
    sessionStateStatus: loggedUserState.sessionStateStatus,
})

export default connect(mapStateToProps, {
    doLogout, updateSessionStateStatus, onUserAuth
})(OPSessionChecker);
