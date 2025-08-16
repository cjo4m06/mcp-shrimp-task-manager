import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation, translations } from './translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  // Get initial language from URL, localStorage or default to 'en'
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Check URL first
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang');
    const supportedLanguages = ['en', 'zh', 'es', 'ko', 'ja', 'th', 'vi', 'pt', 'tr', 'hi', 'it', 'fr', 'de', 'ru'];
    if (urlLang && supportedLanguages.includes(urlLang)) {
      return urlLang;
    }
    
    // Fall back to localStorage
    const saved = localStorage.getItem('shrimpTaskViewerLanguage');
    // Ensure we have a valid language from localStorage
    if (saved && supportedLanguages.includes(saved)) {
      return saved;
    }
    
    // Default to English
    return 'en';
  });

  // Save language preference when it changes
  useEffect(() => {
    console.log('Saving language to localStorage:', currentLanguage);
    localStorage.setItem('shrimpTaskViewerLanguage', currentLanguage);
    
    // Update URL when language changes
    const params = new URLSearchParams(window.location.search);
    if (currentLanguage === 'en') {
      params.delete('lang'); // Don't include default language in URL
    } else {
      params.set('lang', currentLanguage);
    }
    
    const hash = window.location.hash || '#projects';
    const queryString = params.toString();
    const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}${hash}`;
    window.history.replaceState({}, '', newUrl);
  }, [currentLanguage]);

  const t = (key, params) => {
    // Ensure currentLanguage is never null/undefined
    const safeLang = currentLanguage || 'en';
    return getTranslation(safeLang, key, params);
  };

  const changeLanguage = (lang) => {
    console.log('changeLanguage called with:', lang);
    console.log('Available translations:', Object.keys(translations));
    // Only set valid languages, default to 'en' if invalid
    const supportedLanguages = ['en', 'zh', 'es', 'ko', 'ja', 'th', 'vi', 'pt', 'tr', 'hi', 'it', 'fr', 'de', 'ru'];
    const validLang = lang && supportedLanguages.includes(lang) ? lang : 'en';
    setCurrentLanguage(validLang);
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages: [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'zh', name: '中文', flag: '🇨🇳' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'ko', name: '한국어', flag: '🇰🇷' },
      { code: 'ja', name: '日本語', flag: '🇯🇵' },
      { code: 'th', name: 'ไทย', flag: '🇹🇭' },
      { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
      { code: 'pt', name: 'Português', flag: '🇵🇹' },
      { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
      { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
      { code: 'it', name: 'Italiano', flag: '🇮🇹' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
      { code: 'ru', name: 'Русский', flag: '🇷🇺' }
    ]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};