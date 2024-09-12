import { getCurrentUserLanguage } from "../utils/methods";
import T from "i18n-react";
import en from './en.json';
import zh from './zh.json';
import es from './es.json';

const resources = {
    'en': en,
    'zh': zh,
    'es': es,
}

export const initI18n = (dictionary) => {
    let language = getCurrentUserLanguage();

    // language would be something like es-ES or es_ES
    // However we store our files with format es.json or en.json
    // therefore retrieve only the first 2 digits

    if (language.length > 2) {
        language = language.split("-")[0];
        language = language.split("_")[0];
    }

    const isDictionaryValid = dictionary && typeof dictionary === 'object' && !Array.isArray(dictionary);
    try {
        T.setTexts(isDictionaryValid ? { ...resources[language], ...dictionary } : resources[language]);
    } catch (e) {        
        T.setTexts(isDictionaryValid ? { ...resources['en'], ...dictionary } : resources['en']);
    }
};