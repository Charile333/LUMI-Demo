import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/locales/en.json';
import zh from '@/locales/zh.json';

// Check if we're in the browser
const isBrowser = typeof window !== 'undefined';

// Initialize i18n
if (!i18n.isInitialized) {
  const defaultLang = 'en';
  
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        zh: { translation: zh }
      },
      fallbackLng: defaultLang,
      lng: defaultLang,
      debug: false,
      
      interpolation: {
        escapeValue: false
      },
      
      react: {
        useSuspense: false
      }
    });

  // After initialization, load saved language from localStorage
  if (isBrowser) {
    const savedLang = localStorage.getItem('lumi-language');
    if (savedLang && (savedLang === 'en' || savedLang === 'zh')) {
      i18n.changeLanguage(savedLang);
    }
  }
}

export default i18n;

