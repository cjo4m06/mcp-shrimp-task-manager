import { zhDocumentation } from './zh.js';
import { esDocumentation } from './es.js';
import { koDocumentation } from './ko.js';
import { jaDocumentation } from './ja.js';
import { thDocumentation } from './th.js';
import { viDocumentation } from './vi.js';
import { ptDocumentation } from './pt.js';
import { trDocumentation } from './tr.js';
import { hiDocumentation } from './hi.js';
import { itDocumentation } from './it.js';
import { frDocumentation } from './fr.js';
import { deDocumentation } from './de.js';
import { ruDocumentation } from './ru.js';

// English documentation will be loaded dynamically from the actual files
const enDocumentation = {
  releaseNotes: {
    header: '📋 Release Notes',
    versions: 'Versions',
    loading: 'Loading release notes...',
    notFound: 'Release notes not found.',
    error: 'Error loading release notes.',
    copy: 'Copy',
    copied: 'Copied!'
  },
  help: {
    header: 'ℹ️ Help & Documentation',
    loading: 'Loading documentation...',
    notFound: 'README not found.',
    error: 'Error loading README.',
    copy: 'Copy',
    copied: 'Copied!'
  }
};

export const documentation = {
  en: enDocumentation,
  zh: zhDocumentation,
  es: esDocumentation,
  ko: koDocumentation,
  ja: jaDocumentation,
  th: thDocumentation,
  vi: viDocumentation,
  pt: ptDocumentation,
  tr: trDocumentation,
  hi: hiDocumentation,
  it: itDocumentation,
  fr: frDocumentation,
  de: deDocumentation,
  ru: ruDocumentation
};

export const getUIStrings = (component, language = 'en') => {
  return documentation[language]?.[component] || documentation.en[component];
};

export const getReleaseContent = (version, language = 'en') => {
  if (language === 'en') {
    // English content is loaded dynamically from markdown files
    return null;
  }
  return documentation[language]?.releases?.[version] || null;
};

export const getReadmeContent = (language = 'en') => {
  if (language === 'en') {
    // English content is loaded dynamically from README.md
    return null;
  }
  return documentation[language]?.readme || null;
};