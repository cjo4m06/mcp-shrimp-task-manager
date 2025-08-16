import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import zhTranslations from './locales/zh.json';
import esTranslations from './locales/es.json';
import koTranslations from './locales/ko.json';
import jaTranslations from './locales/ja.json';
import thTranslations from './locales/th.json';
import viTranslations from './locales/vi.json';
import ptTranslations from './locales/pt.json';
import trTranslations from './locales/tr.json';
import hiTranslations from './locales/hi.json';
import itTranslations from './locales/it.json';
import frTranslations from './locales/fr.json';
import deTranslations from './locales/de.json';
import ruTranslations from './locales/ru.json';

const resources = {
  en: { translation: enTranslations },
  zh: { translation: zhTranslations },
  es: { translation: esTranslations },
  ko: { translation: koTranslations },
  ja: { translation: jaTranslations },
  th: { translation: thTranslations },
  vi: { translation: viTranslations },
  pt: { translation: ptTranslations },
  tr: { translation: trTranslations },
  hi: { translation: hiTranslations },
  it: { translation: itTranslations },
  fr: { translation: frTranslations },
  de: { translation: deTranslations },
  ru: { translation: ruTranslations }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'shrimpTaskViewerLanguage'
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    react: {
      useSuspense: false
    }
  });

export default i18n;