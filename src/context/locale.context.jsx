import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from '../i18n/translations';

const LocaleContext = createContext(null);
const STORAGE_KEY = 'novika-locale';

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (saved === 'fr' || saved === 'ar') return saved;
    const browserLang = typeof navigator !== 'undefined' ? navigator.language : 'fr';
    return browserLang?.toLowerCase().startsWith('ar') ? 'ar' : 'fr';
  });

  useEffect(() => {
    const dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    document.body.setAttribute('dir', dir);
    window.localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const value = useMemo(() => ({
    locale,
    setLocale,
    dir: locale === 'ar' ? 'rtl' : 'ltr',
    isArabic: locale === 'ar',
    t(key, vars = {}) {
      const dict = translations[locale] || translations.fr;
      const fallback = translations.fr;
      let text = dict[key] ?? fallback[key] ?? key;
      Object.entries(vars).forEach(([name, val]) => {
        text = text.replaceAll(`{{${name}}}`, String(val));
      });
      return text;
    },
  }), [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used inside LocaleProvider');
  return ctx;
}
