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

/**
 * Returns the lib translations for the given language, deep-merged on top of
 * English. Non english bundles are partial (they only translate a subset of the
 * keys), so without this merge any key missing from them would be rendered as
 * the raw key (i18n-react returns the key itself when it is not found).
 * Unsupported languages fall back to English entirely.
 *
 * @param {string} lang
 * @returns {object}
 */
const getLibTexts = (lang) => merge({}, resources['en'], resources[lang] || {});

T.setTexts(getLibTexts(language));

/**
 * Call this instead of T.setTexts() in consumer apps.
 * Deep-merges the lib's base translations with your custom translations,
 * so new keys added to the lib are always available even if your
 * translation file doesn't include them yet. Consumer keys take precedence.
 *
 * @param {object} customTexts - your app's translation object
 */
export const setAppTexts = (customTexts = {}) => {
    T.setTexts(merge({}, getLibTexts(language), customTexts));
};
