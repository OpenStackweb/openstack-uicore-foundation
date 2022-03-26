import {getCurrentUserLanguage} from "../utils/methods";
import T from "i18n-react";
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