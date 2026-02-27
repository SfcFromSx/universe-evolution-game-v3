import { en } from '../data/lang/en.js';
import { zh } from '../data/lang/zh.js';

const LANGS = { en, zh };
const STORAGE_KEY = 'cosmopoeia_lang';

let _lang = localStorage.getItem(STORAGE_KEY) || 'en';

export function t(key) {
  return LANGS[_lang]?.[key] || LANGS.en[key] || key;
}

export function getLang() {
  return _lang;
}

export function setLang(lang) {
  if (!LANGS[lang]) return;
  _lang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  location.reload();
}

export function toggleLang() {
  setLang(_lang === 'en' ? 'zh' : 'en');
}
