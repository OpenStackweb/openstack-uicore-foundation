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
import PropTypes from 'prop-types';
import http from 'superagent/lib/client';
import {getAccessToken} from './security/methods';

// SCOPES NEEDED
// %s/me/summits/events/leave
// %s/me/summits/events/enter

class AttendanceTracker extends React.Component {

    componentDidMount() {
        const {trackEnter, onBeforeUnload} = this;

        // track enter
        trackEnter();

        if (typeof window !== 'undefined') {
            window.addEventListener("beforeunload", onBeforeUnload);
        }
    }

    componentWillUnmount() {
        const {trackLeave, onBeforeUnload} = this;

        // track leave
        trackLeave();

        if (typeof window !== 'undefined') {
            window.removeEventListener("beforeunload", onBeforeUnload);
        }
    }

    trackEnter = async () => {
        const {apiBaseUrl, summitId, sourceId, sourceName} = this.props;
        const location = this.getLocation();
        try{
            const accessToken = await getAccessToken();
            http.put(`${apiBaseUrl}/api/v1/summits/${summitId}/metrics/enter`)
                .send({access_token: accessToken, type: sourceName, source_id: sourceId, location: location})
                .end(() => console.log('ENTER PAGE'));
        }
        catch (e){
            console.log(e);
        }
    };

    trackLeave = async () => {
        const {apiBaseUrl, summitId, sourceId, sourceName} = this.props;
        const location = this.getLocation();
        try {
            const accessToken = await getAccessToken();

            http.post(`${apiBaseUrl}/api/v1/summits/${summitId}/metrics/leave`)
                .send({access_token: accessToken, type: sourceName, source_id: sourceId, location: location})
                .end(() => console.log('LEFT PAGE'));
        }
        catch (e){
            console.log(e);
        }
    };

    onBeforeUnload = async () => {
        const {apiBaseUrl, summitId, sourceId, sourceName} = this.props;
        const location = this.getLocation();
        try {
            const accessToken = await getAccessToken();
            navigator.sendBeacon(
                `${apiBaseUrl}/api/v1/summits/${summitId}/metrics/leave?access_token=${accessToken}&type=${sourceName}&source_id=${sourceId}&location=${location}`, {});
            return undefined;
        }
        catch (e){
            console.log(e);
        }
    };

    getLocation = () => {
      if (typeof window !== 'undefined') {
          return encodeURIComponent(window.location.href);
      }
      return '';
    };

    render() {
        return null;
    }
}

AttendanceTracker.propTypes = {
    sourceName: PropTypes.string,
    sourceId: PropTypes.number,
    summitId: PropTypes.number.isRequired,
    apiBaseUrl: PropTypes.string.isRequired
};

AttendanceTracker.defaultProps = {
    sourceId: 0,
    sourceName: 'GENERAL'
};

export default AttendanceTracker;

