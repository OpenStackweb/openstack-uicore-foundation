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
import moment from "moment-timezone";
import FragmentParser from "./fragment-parser";
import {getTimeServiceUrl} from '../utils/methods';

/**
 * class Clock
 */
class Clock extends React.Component {

    constructor(props) {
        super(props);
        this.fragmentParser = new FragmentParser();
        this.interval = null;
        this.state = {
            timestamp: null
        }
        this._isMounted = false;
        this.onVisibilityChange = this.onVisibilityChange.bind(this);
    }

    /**
     * @param response
     * @param localBefore
     */
    processServerTimeResponse = (response, localBefore) => {
        const localAfter = moment().unix();
        let timestamp = localAfter;
        if (response) {
            timestamp = response.timestamp + (localAfter - localBefore);
        }
        if(this._isMounted) {
            console.log(`Clock::processServerTimeResponse setting timestamp ${timestamp}`)
            this.setState({timestamp});
        }
        if(this.props.onTick)
            this.props.onTick(timestamp);
    }

    processServerTimeResponseError = () => {
        const localAfter = moment().unix();
        let timestamp = localAfter;
        if(this._isMounted) {
            console.log(`Clock::processServerTimeResponseError setting timestamp ${timestamp}`)
            this.setState({timestamp});
        }
        if(this.props.onTick)
            this.props.onTick(timestamp);
    }

    componentDidMount() {
        this._isMounted = true;
        const {timezone = 'UTC', now} = this.props;
        const nowQS = this.fragmentParser.getParam('now');
        const momentQS = moment.tz(nowQS, 'YYYY-MM-DD,hh:mm:ss', timezone);
        let timestamp = null;
        if (momentQS.isValid()) {
            timestamp = momentQS.valueOf() / 1000;
        } else if (now) {
            timestamp = now
        } else {
            const localBefore = moment().unix();
            this.getServerTime()
                .then((response) => this.processServerTimeResponse(response, localBefore))
                .catch(() => this.processServerTimeResponseError())
        }

        if(timestamp) {
            this.setState({timestamp});
            if(this.props.onTick)
                this.props.onTick(timestamp);
        }

        this.interval = setInterval(this.tick, 1000);
        document.addEventListener("visibilitychange", this.onVisibilityChange, false)
    }

    onVisibilityChange() {
        const visibilityState = document.visibilityState;

        if (visibilityState === "visible") {
            console.log(`Clock::onVisibilityChange`)
            const localBefore = moment().unix();
            this.getServerTime()
                .then((response) => this.processServerTimeResponse(response, localBefore))
                .catch(() => this.processServerTimeResponseError());
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
        clearInterval(this.interval);
        document.removeEventListener("visibilitychange", this.onVisibilityChange)
        this.interval = null;
    }

    getServerTime = () => {
        const timeServiceUrl = getTimeServiceUrl();
        return fetch(`${timeServiceUrl}`).then(async (response) => {
            if (response.status === 200) {
                return response.json();
            }
            return Promise.reject(null);
        })
        .catch(err => {
            console.log(err);
            return Promise.reject(err);
        });
    };

    tick = () => {
        const {timestamp} = this.state;
        if (timestamp !== null) {
            if(this.props.onTick)
                this.props.onTick(timestamp + 1);
            if(this._isMounted)
                this.setState({timestamp: timestamp + 1})
        }
    };

    // epoch utc time in seconds
    now = () => {
        return this.state.timestamp;
    };

    render() {
        const {display, timezone = 'UTC'} = this.props;
        const {timestamp} = this.state;

        if (!display || !timestamp) return null;

        return (
            <div style={{marginTop: '50px', textAlign: 'center', fontSize: '20px'}}>
                {moment.tz(timestamp * 1000, timezone).format('YYYY-MM-DD hh:mm:ss')}
            </div>
        );
    }

}

export default Clock;
