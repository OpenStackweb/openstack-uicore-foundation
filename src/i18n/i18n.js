import {getCurrentUserLanguage} from "../utils/methods";
import T from "i18n-react";
import merge from "lodash/merge";
import en from './en.json';
import zh from './zh.json';
import es from './es.json';

const resources = {
    'en' : en,
    'zh' : zh,
    'es' : es,
}

let language = getCurrentUserLanguage();

// language would be something like es-ES or es_ES
// However we store our files with format es.json or en.json
// therefore retrieve only the first 2 digits

if (language.length > 2) {
    language = language.split("-")[0];
    language = language.split("_")[0];
}

try {
    T.setTexts(resources[language]);
} catch (e) {
    T.setTexts(resources['en']);
}

/**
 * Call this instead of T.setTexts() in consumer apps.
 * Deep-merges the lib's base translations with your custom translations,
 * so new keys added to the lib are always available even if your
 * translation file doesn't include them yet. Consumer keys take precedence.
 *
 * @param {object} customTexts - your app's translation object
 */
export const setAppTexts = (customTexts = {}) => {
    const libTexts = resources[language] || resources['en'];
    T.setTexts(merge({}, libTexts, customTexts));
};