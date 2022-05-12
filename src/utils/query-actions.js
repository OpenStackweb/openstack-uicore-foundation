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

import {fetchErrorHandler, fetchResponseHandler, escapeFilterValue } from "./actions";
import {getAccessToken} from '../components/security/methods';
import {buildAPIBaseUrl} from "./methods";
import URI from "urijs";
import _ from 'lodash';
export const RECEIVE_COUNTRIES  = 'RECEIVE_COUNTRIES';
const callDelay = 500; //miliseconds

export const queryMembers = _.debounce(async (input, callback) => {

    const accessToken = await getAccessToken();
    input = escapeFilterValue(input);
    let filters = encodeURIComponent(`full_name=@${input},first_name=@${input},last_name=@${input},email=@${input}`);
    let expand = `tickets,rsvp,schedule_summit_events,all_affiliations`

    fetch(buildAPIBaseUrl(`/api/v1/members?filter=${filters}&expand=${expand}&access_token=${accessToken}`))
        .then(fetchResponseHandler)
        .then((json) => {
            let options = [...json.data];

            callback(options);
        })
        .catch(fetchErrorHandler);
}, callDelay);

export const querySummits = _.debounce(async (input, callback) => {

    const accessToken = await getAccessToken();
    input = escapeFilterValue(input);
    let filters = encodeURIComponent(`name=@${input}`);

    fetch(buildAPIBaseUrl(`/api/v1/summits/all?filter=${filters}&access_token=${accessToken}`))
        .then(fetchResponseHandler)
        .then((json) => {
            let options = [...json.data];

            callback(options);
        })
        .catch(fetchErrorHandler);
}, callDelay);

export const querySpeakers = _.debounce(async (summitId, input, callback) => {

    const accessToken = await getAccessToken();
    input = escapeFilterValue(input);
    let filters = encodeURIComponent(`full_name=@${input},first_name=@${input},last_name=@${input},email=@${input}`);
    let apiUrl = `/api/v1`;

    if (summitId) {
        apiUrl += `/summits/${summitId}`;
    }

    apiUrl += `/speakers?filter=${filters}&access_token=${accessToken}&expand=member,registration_request`;

    fetch(buildAPIBaseUrl(apiUrl))
        .then(fetchResponseHandler)
        .then((json) => {
            let options = [...json.data];

            callback(options);
        })
        .catch(fetchErrorHandler);
}, callDelay);

export const queryTags = _.debounce(async (summitId, input, callback) => {

    const accessToken = await getAccessToken();
    input = escapeFilterValue(input);
    let apiUrl = `/api/v1`;
    let filter = encodeURIComponent(`tag=@${input}`);

    if (summitId) {
        apiUrl += `/summits/${summitId}/track-tag-groups/all/allowed-tags?filter=${filter}&expand=tag,track_tag_group`;
    } else {
        apiUrl += `/tags?filter=${filter}`;
    }

    apiUrl += `&order=tag&page=1&per_page=50&access_token=${accessToken}`;

    fetch(buildAPIBaseUrl(apiUrl))
        .then(fetchResponseHandler)
        .then((json) => {
            let options = [...json.data];

            if (summitId) {
                options = options.map(t => t.tag);
            }

            callback(options);
        })
        .catch(fetchErrorHandler);
}, callDelay);

export const queryTracks = _.debounce(async (summitId, input, callback) => {

    const accessToken = await getAccessToken();
    input = escapeFilterValue(input);
    let filter = encodeURIComponent(`name=@${input}`);

    fetch(buildAPIBaseUrl(`/api/v1/summits/${summitId}/tracks?filter=${filter}&order=name&access_token=${accessToken}`))
        .then(fetchResponseHandler)
        .then((json) => {
            let options = [...json.data];

            callback(options);
        })
        .catch(fetchErrorHandler);
}, callDelay);

export const queryTrackGroups = _.debounce(async (summitId, input, callback) => {

    const accessToken = await getAccessToken();
    input = escapeFilterValue(input);
    let filter = input ? encodeURIComponent(`filter=name=@${input}`) : '';

    fetch(buildAPIBaseUrl(`/api/v1/summits/${summitId}/track-groups?order=name&access_token=${accessToken}&${filter}`))
        .then(fetchResponseHandler)
        .then((json) => {
            let options = [...json.data];

            callback(options);
        })
        .catch(fetchErrorHandler);
}, callDelay);

export const queryEvents = _.debounce(async (summitId, input, onlyPublished = false, callback) => {

    const accessToken = await getAccessToken();
    input = escapeFilterValue(input);
    let baseUrl = `/api/v1/summits/${summitId}/events` + (onlyPublished ? '/published' : '');
    let filter = encodeURIComponent(`title=@${input}`);

    fetch(buildAPIBaseUrl(`${baseUrl}?filter=${filter}&order=title&access_token=${accessToken}`))
        .then(fetchResponseHandler)
        .then((json) => {
            let options = [...json.data];

            callback(options);
        })
        .catch(fetchErrorHandler);
}, callDelay);

export const queryGroups = _.debounce(async (input, callback) => {

    const accessToken = await getAccessToken();
    let filters = encodeURIComponent(`title=@${input},code=@${input}`);

    fetch(buildAPIBaseUrl(`/api/v1/groups?filter=${filters}&access_token=${accessToken}`))
        .then(fetchResponseHandler)
        .then((json) => {
            let options = [...json.data];

            callback(options);
        })
        .catch(fetchErrorHandler);
}, callDelay);

export const queryCompanies = _.debounce(async (input, callback) => {

    const accessToken = await getAccessToken();
    input = escapeFilterValue(input);
    let filters = encodeURIComponent(`name=@${input}`);

    fetch(buildAPIBaseUrl(`/api/v1/companies?filter=${filters}&access_token=${accessToken}`))
        .then(fetchResponseHandler)
        .then((json) => {
            let options = [...json.data];

            callback(options);
        })
        .catch(fetchErrorHandler);
}, callDelay);

export const queryRegistrationCompanies = _.debounce(async (summitId, input, callback) => {
    
    let accessToken;

    try {
        accessToken = await getAccessToken();
    } catch (e) {
        callback(e);
        return;
    }

    let apiUrl = URI(`/api/v1/summits/${summitId}/registration-companies`);
    apiUrl.addQuery('access_token', accessToken);
    apiUrl.addQuery('order','name')

    if(input) {
        input = escapeFilterValue(input);
        apiUrl.addQuery('filter[]', `name=@${input}`);
    }

    fetch(buildAPIBaseUrl(apiUrl.toString()))
        .then(fetchResponseHandler)
        .then((json) => {
            let options = [...json.data];

            callback(options);
        })
        .catch(fetchErrorHandler);
}, callDelay);

export const querySponsors = _.debounce(async (summitId, input, callback) => {

    const accessToken = await getAccessToken();
    input = escapeFilterValue(input);
    let filters = encodeURIComponent(`company_name=@${input}`);

    fetch(buildAPIBaseUrl(`/api/v1/summits/${summitId}/sponsors?filter=${filters}&expand=company,sponsorship&access_token=${accessToken}`))
        .then(fetchResponseHandler)
        .then((json) => {
            let options = [...json.data];

            callback(options);
        })
        .catch(fetchErrorHandler);
}, callDelay);

export const queryAccessLevels = _.debounce((summitId, input, callback) => {

    let accessToken = getAccessToken();
    input = escapeFilterValue(input);
    let filters = encodeURIComponent(`name=@${input}`);

    fetch(buildAPIBaseUrl(`/api/v1/summits/${summitId}/access-level-types?filter=${filters}&&access_token=${accessToken}`))
        .then(fetchResponseHandler)
        .then((json) => {
            let options = [...json.data];

            callback(options);
        })
        .catch(fetchErrorHandler);
}, callDelay);

export const queryOrganizations = _.debounce(async (input, callback) => {

    const accessToken = await getAccessToken();
    input = escapeFilterValue(input);
    let filters = encodeURIComponent(`name=@${input}`);

    fetch(buildAPIBaseUrl(`/api/v1/organizations?filter=${filters}&access_token=${accessToken}`))
        .then(fetchResponseHandler)
        .then((json) => {
            let options = [...json.data];

            callback(options);
        })
        .catch(fetchErrorHandler);
}, callDelay);

export const getLanguageList = (callback, signal) => {
    return fetch(buildAPIBaseUrl(`/api/public/v1/languages`), {signal})
        .then(fetchResponseHandler)
        .then((response) => {
            callback(response.data);
        })
        .catch(fetchErrorHandler);
};

export const getCountryList = (callback, signal) => {

    return fetch(buildAPIBaseUrl(`/api/public/v1/countries`), {signal})
        .then(fetchResponseHandler)
        .then((response) => {
            callback(response.data);
        })
        .catch(fetchErrorHandler);
};

var geocoder;

export const geoCodeAddress = (address) => {

    if (!geocoder) geocoder = new google.maps.Geocoder();

    // return a Promise
    return new Promise(function(resolve,reject) {
        geocoder.geocode( { 'address': address}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                // resolve results upon a successful status
                resolve(results);
            } else {
                // reject status upon un-successful status
                reject(status);
            }
        });
    });
};

export const geoCodeLatLng = (lat, lng) => {

    if (!geocoder) geocoder = new google.maps.Geocoder();

    var latlng = {lat: parseFloat(lat), lng: parseFloat(lng)};
    // return a Promise
    return new Promise(function(resolve,reject) {
        geocoder.geocode( { 'location': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                // resolve results upon a successful status
                resolve(results);
            } else {
                // reject status upon un-successful status
                reject(status);
            }
        });
    });
};


