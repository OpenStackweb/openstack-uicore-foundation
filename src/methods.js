import React from 'react';
import T from "i18n-react/dist/i18n-react";

import {
    createAction,
    getRequest,
    putRequest,
    deleteRequest,
    postRequest,
    postFile,
    putFile,
    defaultErrorHandler,
    responseHandler,
    fetchErrorHandler,
    fetchResponseHandler,
    showMessage,
    showSuccessMessage,
    getCSV,
    resetLoading,
    startLoading,
    stopLoading,
    authErrorHandler,
    escapeFilterValue,
} from './utils/actions';

import {
    queryMembers,
    querySpeakers,
    queryTags,
    queryTracks,
    queryTrackGroups,
    queryEvents,
    queryGroups,
    queryCompanies,
    querySponsors,
    getLanguageList,
    queryOrganizations,
    getCountryList,
    geoCodeAddress,
    geoCodeLatLng
} from './utils/query-actions';

import {
    findElementPos,
    epochToMoment,
    epochToMomentTimeZone,
    formatEpoch,
    objectToQueryString,
    getBackURL,
    formatAuthProviderButtons
} from './utils/methods'

import {
    onUserAuth,
    doLogout,
    getUserInfo,
} from './components/security/actions';

import {
    getAuthUrl,
    getLogoutUrl,
    doLogin,
    initLogOut,
    emitAccessToken,
    getAccessToken,
    getAuthInfo,
    clearAuthInfo,
    getIdToken,
    getOAuth2IDPBaseUrl,
    getOAuth2ClientId,
    passwordlessStart,
    passwordlessLogin,
} from './components/security/methods';

import {getCurrentUserLanguage} from './utils/methods';

let language = getCurrentUserLanguage();

// language would be something like es-ES or es_ES
// However we store our files with format es.json or en.json
// therefore retrieve only the first 2 digits

if (language.length > 2) {
    language = language.split("-")[0];
    language = language.split("_")[0];
}

try {
    T.setTexts(require(`./i18n/${language}.json`));
} catch (e) {
    T.setTexts(require(`./i18n/en.json`));
}


export {
    resetLoading,
    startLoading,
    stopLoading,
    responseHandler,
    fetchErrorHandler,
    fetchResponseHandler,
    showMessage,
    showSuccessMessage,
    getCSV,
    getRequest,
    putRequest,
    deleteRequest,
    postRequest,
    postFile,
    putFile,
    defaultErrorHandler,
    createAction,
    queryMembers,
    querySpeakers,
    queryTags,
    queryTracks,
    queryTrackGroups,
    queryEvents,
    queryGroups,
    queryCompanies,
    querySponsors,
    getLanguageList,
    queryOrganizations,
    getCountryList,
    geoCodeAddress,
    geoCodeLatLng,
    findElementPos,
    epochToMoment,
    epochToMomentTimeZone,
    formatEpoch,
    objectToQueryString,
    getBackURL,
    getAuthUrl,
    getLogoutUrl,
    doLogin,
    onUserAuth,
    initLogOut,
    doLogout,
    getUserInfo,
    authErrorHandler,
    escapeFilterValue,
    emitAccessToken,
    getAccessToken,
    getIdToken,
    getAuthInfo,
    getOAuth2IDPBaseUrl,
    getOAuth2ClientId,
    clearAuthInfo,
    passwordlessStart,
    passwordlessLogin,
    formatAuthProviderButtons
};
