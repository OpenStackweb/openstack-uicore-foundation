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
    getAuthUrl,
    initLogOut,
    SESSION_STATE_STATUS_CHANGED,
    SESSION_STATE_STATUS_ERROR,
    SESSION_STATE_STATUS_UNCHANGED,
    updateSessionStateStatus
} from "../actions";
import URI from "urijs"

const CHECK_SESSION_INTERVAL = (1000 * 60) * 30;

class OPSessionChecker extends React.Component {

    constructor(props) {
        super(props);
        this.receiveMessage = this.receiveMessage.bind(this);
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

    componentDidMount() {
        //console.log("OPSessionChecker::componentDidMount");
        // add event listener to receive messages from idp through OP frame
        if(typeof window !== 'undefined') {
            if ( window.location !== window.parent.location ) {
                //console.log("OPSessionChecker::componentDidMount running inside iframe, skipping");
            }
            else {
                window.addEventListener("message", this.receiveMessage, false);
                // set up op frame
                this.onSetupCheckSessionRP();
            }
        }
    }

    rpCheckSessionStateFrameOnLoad(event){
        // this is called bc we set the RP frame to check the session state with promp=none
        //console.log("OPSessionChecker::rpCheckSessionStateFrameOnLoad");
        let resultUrl = new URI(event.target.baseURI);
        // test the result Url
        console.log("OPSessionChecker::rpCheckSessionStateFrameOnLoad - resultUrl " + resultUrl);
        if(resultUrl.hasQuery("error")){
            let error = resultUrl.query(true).error;
            // console.log("OPSessionChecker::rpCheckSessionStateFrameOnLoad - error " + error);
            // check session state with prompt none failed do logoutdebugger;
            //console.log('OPSessionChecker::rpCheckSessionStateFrameOnLoad - initiating logout');
            initLogOut();
            return;
        }
        // no error we still logged so re init the checking
        // set up op frame
        this.props.updateSessionStateStatus(SESSION_STATE_STATUS_UNCHANGED);
        //this.onSetupCheckSessionRP();
    }

    componentDidUpdate(prevProps) {
        //console.log("OPSessionChecker::componentDidUpdate");
        if (this.props.sessionStateStatus !== prevProps.sessionStateStatus) {
            if(this.props.sessionStateStatus === SESSION_STATE_STATUS_CHANGED){
                console.log("OPSessionChecker::componentDidUpdate sessionStateStatus === changed");
                let url = getAuthUrl(null, 'none');
                // https://openid.net/specs/openid-connect-session-1_0.html#RPiframe
                // set the frame to idp
                this.rpCheckSessionStateFrame.src = url.toString();
                return;
            }
            if(this.props.sessionStateStatus === SESSION_STATE_STATUS_ERROR){
                console.log("OPSessionChecker::componentDidUpdate sessionStateStatus === error");
                // https://openid.net/specs/openid-connect-session-1_0.html#RPiframe
                // do logout
                this.props.doLogout();
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

    setTimer()
    {
        //console.log("OPSessionChecker::setTimer");

        if(!this.props.isLoggedUser){
            //console.log("OPSessionChecker::setTimer - !this.props.isLoggedUser");
            return;
        }

        if(this.props.sessionStateStatus !== SESSION_STATE_STATUS_UNCHANGED ){
            //console.log("OPSessionChecker::setTimer - this.props.sessionStateStatus");
            return;
        }

        this.checkSession();
        // console.log(`OPSessionChecker::setTimer setting interval ${CHECK_SESSION_INTERVAL}`);
        if(typeof window !== 'undefined')
            this.interval = window.setInterval(this.checkSession, CHECK_SESSION_INTERVAL);
    }

    onSetupCheckSessionRP(){
        // https://openid.net/specs/openid-connect-session-1_0.html#OPiframe
        //console.log("OPSessionChecker::onSetupCheckSessionRP");
        if(this.opFrame == null){
            //console.log("OPSessionChecker::onSetupCheckSessionRP - opFrame is null");
            return;
        }
        const sessionCheckEndpoint = `${this.props.idpBaseUrl}/oauth2/check-session`;
        //console.log("OPSessionChecker::onSetupCheckSessionRP - sessionCheckEndpoint "+ sessionCheckEndpoint);
        this.opFrame.src = sessionCheckEndpoint;
    }

    receiveMessage(e)
    {
        //console.log("OPSessionChecker::receiveMessage");
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
                //console.log("OPSessionChecker::receiveMessage - session state has changed on OP");
                // signal session start check
                // kill timer
                if(typeof window !== 'undefined')
                    window.clearInterval(this.interval);
                this.interval = null;
                this.props.updateSessionStateStatus('changed');
                return;
            }

            if(status === SESSION_STATE_STATUS_ERROR){
                //console.log("OPSessionChecker::receiveMessage - error , init log out");
                // kill timer
                if(typeof window !== 'undefined')
                    window.clearInterval(this.interval);
                this.interval = null;
                this.props.updateSessionStateStatus('error');
                return;
            }
        }
    }

    render() {

        if(typeof window !== 'undefined') {
            if ( window.location !== window.parent.location ) {
                //console.log("OPSessionChecker::render running inside iframe, skipping");
                return null
            }
        }

        return(
            <div style={{height: '0px'}}>
                <iframe
                    ref={this.setOPFrameRef}
                    id="OPFrame" onLoad={this.setTimer}
                    style={{visibility:'hidden', position: 'absolute', left: 0, top: 0, border: 'none'}}>></iframe>
                <iframe ref={this.setCheckSessionStateFrameRef}
                        id="RPCHeckSessionStateFrame"
                        onLoad={this.rpCheckSessionStateFrameOnLoad}
                        style={{visibility:'hidden', position: 'absolute', left: 0, top: 0, border: 'none'}}>></iframe>
            </div>
        );
    }
}

const mapStateToProps = ({ loggedUserState }) => ({
    sessionState: loggedUserState.sessionState,
    isLoggedUser: loggedUserState.isLoggedUser,
    idToken: loggedUserState.idToken,
    sessionStateStatus: loggedUserState.sessionStateStatus,
})

export default connect(mapStateToProps, {
    doLogout, updateSessionStateStatus
})(OPSessionChecker);
