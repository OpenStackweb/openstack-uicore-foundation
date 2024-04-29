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

import { fetchErrorHandler, fetchResponseHandler, escapeFilterValue } from "./actions";
import { getAccessToken } from '../components/security/methods';
import { buildAPIBaseUrl } from "./methods";
import _ from 'lodash';
export const RECEIVE_COUNTRIES  = 'RECEIVE_COUNTRIES';
const callDelay = 500; // milliseconds
import URI from "urijs";
export const DEFAULT_PAGE_SIZE = 10;

/**
 * @param endpoint
 * @param callback
 * @param options
 * @returns {Promise<Response | void>}
 * @private
 */
const _fetch = async (endpoint, callback, options = {}) => {

    let accessToken;

    try {
        accessToken = await getAccessToken();
    } catch (e) {
        if(typeof callback === 'function')
            callback(e);
        return Promise.reject();
    }

    endpoint.addQuery('access_token', accessToken);

    return fetch(buildAPIBaseUrl(endpoint.toString()), options)
        .then(fetchResponseHandler)
        .then((json) => {
            if(typeof callback === 'function')
                callback(json.data);
        })
        .catch(response => {
            const code = response.status;
            if (code === 404) callback([]);
            return response;
        })
        .catch(fetchErrorHandler);
}
/**
 *
 * @type {DebouncedFunc<(function(*, *, *=): Promise<void>)|*>}
 */
export const queryMembers = _.debounce(async (input, callback, per_page= DEFAULT_PAGE_SIZE) => {

    let endpoint = URI(`/api/v1/members`);

    endpoint.addQuery('expand', `tickets,rsvp,schedule_summit_events,all_affiliations`);
    endpoint.addQuery('order','first_name,last_name');
    endpoint.addQuery('page', 1);
    endpoint.addQuery('per_page', per_page);

    if(input) {
        input = escapeFilterValue(input);
        endpoint.addQuery('filter[]', `full_name@@${input},first_name@@${input},last_name@@${input},email@@${input}`);
    }

    _fetch(endpoint, callback);

}, callDelay);

/**
 * @type {DebouncedFunc<(function(*, *, *=): Promise<void>)|*>}
 */
export const querySummits = _.debounce(async (input, callback, per_page= DEFAULT_PAGE_SIZE) => {

    let endpoint = URI(`/api/v1/summits/all`);

    endpoint.addQuery('expand', `tickets,rsvp,schedule_summit_events,all_affiliations`);
    endpoint.addQuery('order','name');
    endpoint.addQuery('page', 1);
    endpoint.addQuery('per_page', per_page);

    if(input) {
        input = escapeFilterValue(input);
        endpoint.addQuery('filter[]', `name@@${input}`);
    }

    _fetch(endpoint, callback);

}, callDelay);

/**
 * @type {DebouncedFunc<(function(*, *, *, *=): Promise<void>)|*>}
 */
export const querySpeakers = _.debounce(async (summitId, input, callback, per_page = DEFAULT_PAGE_SIZE ) => {


    let endpoint = URI(`/api/v1/${summitId ? `summits/${summitId}/speakers`:`speakers`}`);

    endpoint.addQuery('expand', `member,registration_request`);
    endpoint.addQuery('order','first_name,last_name');
    endpoint.addQuery('page', 1);
    endpoint.addQuery('per_page', per_page);

    if(input) {
        input = escapeFilterValue(input);
        endpoint.addQuery('filter[]', `full_name@@${input},first_name@@${input},last_name@@${input},email@@${input}`);
    }

    _fetch(endpoint, callback);

}, callDelay);

/**
 * @type {DebouncedFunc<(function(*, *, *, *=): Promise<void>)|*>}
 */
export const queryTags = _.debounce(async (summitId, input, callback, per_page = 50) => {

    let endpoint = URI(`/api/v1/${summitId ? `summits/${summitId}/track-tag-groups/all/allowed-tags`:`tags`}`);

    if(summitId)
        endpoint.addQuery('expand', `tag,track_tag_group`);

    endpoint.addQuery('order','tag');
    endpoint.addQuery('page', 1);
    endpoint.addQuery('per_page', per_page);

    if(input) {
        input = escapeFilterValue(input);
        endpoint.addQuery('filter[]', `tag@@${input}`);
    }

    _fetch(endpoint, callback);

}, callDelay);

/**
 * @type {DebouncedFunc<(function(*, *, *, *=): Promise<void>)|*>}
 */
export const queryTracks = _.debounce(async (summitId, input, callback, per_page = DEFAULT_PAGE_SIZE) => {

    let endpoint = URI(`/api/v1/summits/${summitId}/tracks`);

    endpoint.addQuery('order','name');
    endpoint.addQuery('page', 1);
    endpoint.addQuery('per_page', per_page);

    if(input) {
        input = escapeFilterValue(input);
        endpoint.addQuery('filter[]', `name@@${input}`);
    }

    _fetch(endpoint, callback);
}, callDelay);

/**
 * @type {DebouncedFunc<(function(*, *, *, *=): Promise<void>)|*>}
 */
export const queryTrackGroups = _.debounce(async (summitId, input, callback, per_page = DEFAULT_PAGE_SIZE) => {

    let endpoint = URI(`/api/v1/summits/${summitId}/track-groups`);

    endpoint.addQuery('order','name');
    endpoint.addQuery('page', 1);
    endpoint.addQuery('per_page', per_page);

    if(input) {
        input = escapeFilterValue(input);
        endpoint.addQuery('filter[]', `name@@${input}`);
    }

    _fetch(endpoint, callback);

}, callDelay);

/**
 * @type {DebouncedFunc<(function(*, *, *=, *): Promise<void>)|*>}
 */
export const queryEvents = _.debounce(async (summitId, input, onlyPublished = false, callback, per_page = DEFAULT_PAGE_SIZE) => {

    let endpoint = URI(`/api/v1/summits/${summitId}/events` + (onlyPublished ? '/published' : ''));

    endpoint.addQuery('order','title');
    endpoint.addQuery('page', 1);
    endpoint.addQuery('per_page', per_page);

    if(input) {
        input = escapeFilterValue(input);
        endpoint.addQuery('filter[]', `title@@${input}`);
    }

    _fetch(endpoint, callback);
}, callDelay);

/**
 * @type {DebouncedFunc<(function(*, *, *, *=, *=): Promise<void>)|*>}
 */
export const queryEventTypes = _.debounce(async (summitId, input, callback, eventTypeClassName = null, per_page = DEFAULT_PAGE_SIZE) => {

    let endpoint = URI(`/api/v1/summits/${summitId}/event-types`);

    endpoint.addQuery('order','name');
    endpoint.addQuery('page', 1);
    endpoint.addQuery('per_page', per_page);

    if(input) {
        input = escapeFilterValue(input);
        endpoint.addQuery('filter[]', `name@@${input}`);
    }

    if (eventTypeClassName) {
        eventTypeClassName = escapeFilterValue(eventTypeClassName);
        endpoint.addQuery('filter[]', `class_name==${eventTypeClassName}`);
    }

    _fetch(endpoint, callback);

}, callDelay);


/**
 * @type {DebouncedFunc<(function(*, *, *=): Promise<void>)|*>}
 */
export const queryGroups = _.debounce(async (input, callback, per_page = DEFAULT_PAGE_SIZE) => {

    let endpoint = URI(`/api/v1/groups`);

    endpoint.addQuery('order','title,code');
    endpoint.addQuery('page', 1);
    endpoint.addQuery('per_page', per_page);

    if(input) {
        input = escapeFilterValue(input);
        endpoint.addQuery('filter[]', `title@@${input},code@@${input}`);
    }

    _fetch(endpoint, callback);

}, callDelay);

/**
 * @type {DebouncedFunc<(function(*, *, *=): Promise<void>)|*>}
 */
export const queryCompanies = _.debounce(async (input, callback, per_page = DEFAULT_PAGE_SIZE) => {

    let endpoint = URI(`/api/v1/companies`);

    endpoint.addQuery('order','name');
    endpoint.addQuery('page', 1);
    endpoint.addQuery('per_page', per_page);

    if(input) {
        input = escapeFilterValue(input);
        endpoint.addQuery('filter[]', `name@@${input}`);
    }

    _fetch(endpoint, callback);
}, callDelay);

/**
 * @type {DebouncedFunc<(function(*, *, *, *=): Promise<void>)|*>}
 */
export const queryRegistrationCompanies = _.debounce(async (summitId, input, callback, per_page = DEFAULT_PAGE_SIZE) => {

    let endpoint = URI(`/api/v1/summits/${summitId}/registration-companies`);

    endpoint.addQuery('order','name')
    endpoint.addQuery('page', 1);
    endpoint.addQuery('per_page', per_page);

    if(input) {
        input = escapeFilterValue(input);
        endpoint.addQuery('filter[]', `name@@${input}`);
    }

    _fetch(endpoint, callback);

}, callDelay);

/**
 * @type {DebouncedFunc<(function(*, *, *, *=): Promise<void>)|*>}
 */
export const querySponsors = _.debounce(async (summitId, input, callback, per_page = DEFAULT_PAGE_SIZE) => {

    let endpoint = URI(`/api/v1/summits/${summitId}/sponsors`);

    endpoint.addQuery('expand','company,sponsorship,sponsorship.type')
    endpoint.addQuery('order','id')
    endpoint.addQuery('page', 1);
    endpoint.addQuery('per_page', per_page);

    if(input) {
        input = escapeFilterValue(input);
        endpoint.addQuery('filter[]', `company_name@@${input}`);
    }

    _fetch(endpoint, callback);

}, callDelay);

/**
 * @type {DebouncedFunc<(function(*, *, *, *=): Promise<void>)|*>}
 */
export const queryAccessLevels = _.debounce(async (summitId, input, callback, per_page = DEFAULT_PAGE_SIZE) => {

    let endpoint = URI(`/api/v1/summits/${summitId}/access-level-types`);

    endpoint.addQuery('order','name')
    endpoint.addQuery('page', 1);
    endpoint.addQuery('per_page', per_page);

    if(input) {
        input = escapeFilterValue(input);
        endpoint.addQuery('filter[]', `name@@${input}`);
    }

    _fetch(endpoint, callback);

}, callDelay);

/**
 * @type {DebouncedFunc<(function(*, *, *=): Promise<void>)|*>}
 */
export const queryOrganizations = _.debounce(async (input, callback, per_page = DEFAULT_PAGE_SIZE) => {

    let endpoint = URI(`/api/v1/organizations`);

    endpoint.addQuery('order','name')
    endpoint.addQuery('page', 1);
    endpoint.addQuery('per_page', per_page);

    if(input) {
        input = escapeFilterValue(input);
        endpoint.addQuery('filter[]', `name@@${input}`);
    }

    _fetch(endpoint, callback);

}, callDelay);

export const getLanguageList = (callback, signal) => {
    return _fetch(new URI(`/api/public/v1/languages`), callback, { signal });
};

export const getCountryList = (callback, signal) => {
    return _fetch(new URI(`/api/public/v1/countries`), callback, { signal });
};

let geocoder;

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

    let latlng = {lat: parseFloat(lat), lng: parseFloat(lng)};
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

/**
 * @type {DebouncedFunc<(function(*, *=, *, *=, *=): Promise<void>)|*>}
 */
export const queryTicketTypes = _.debounce(async (summitId, filters = {}, callback, version = 'v1', per_page = DEFAULT_PAGE_SIZE) => {

    let endpoint = URI(`/api/${version}/summits/${summitId}/ticket-types`);

    endpoint.addQuery('order','name');
    endpoint.addQuery('page', 1);
    endpoint.addQuery('per_page', per_page);

    if(filters.hasOwnProperty('name')) {
        const name = escapeFilterValue(filters.name);
        if(name && name != '')
            endpoint.addQuery('filter[]', `name@@${name}`);
    }

    if(filters.hasOwnProperty('audience')){
        const audience = escapeFilterValue(filters.audience);
        if(audience && audience != '')
            endpoint.addQuery('filter[]', `audience==${audience}`);
    }

    _fetch(endpoint, callback);

}, callDelay);

/**
 * @type {DebouncedFunc<(function(*, *, *=): Promise<void>)|*>}
 */
export const querySponsoredProjects = _.debounce(async (input, callback, per_page = DEFAULT_PAGE_SIZE) => {


    const endpoint = URI(`/api/v1/sponsored-projects`);

    endpoint.addQuery('order','name')
    endpoint.addQuery('page', 1);
    endpoint.addQuery('per_page', per_page);

    if(input) {
        input = escapeFilterValue(input);
        endpoint.addQuery('filter[]', `name@@${input}`);
    }

    _fetch(endpoint, callback);

}, callDelay);

/**
 * @type {DebouncedFunc<(function(*, *, *, *=): Promise<void>)|*>}
 */
export const queryPromocodes = _.debounce(async (summitId, input, callback, per_page = DEFAULT_PAGE_SIZE, extraFilters = []) => {


    let endpoint = URI(`/api/v1/summits/${summitId}/promo-codes`);

    endpoint.addQuery('order','code')
    endpoint.addQuery('page', 1);
    endpoint.addQuery('per_page', per_page);

    if(input) {
        input = escapeFilterValue(input);
        endpoint.addQuery('filter[]', `code@@${input}`);
    }

    //eg: filter = 'class_name==SummitRegistrationPromoCode'
    for (const filter of extraFilters) {
        endpoint.addQuery('filter[]', filter);
    }

    _fetch(endpoint, callback);

}, callDelay);
