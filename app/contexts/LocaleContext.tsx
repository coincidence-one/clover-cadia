'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { en, ko, Translations } from '@/app/locales';

type Locale = 'en' | 'ko';

interface LocaleContextType {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

const translations: Record<Locale, Translations> = { en, ko };

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ko');

  // Load saved locale from localStorage
  useEffect(() => {
    // Load from storage
    const saved = localStorage.getItem('pixelBetLocale') as Locale;
    if (saved && (saved === 'en' || saved === 'ko')) {
      setLocale(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  const toggleLocale = () => {
    const newLocale = locale === 'en' ? 'ko' : 'en';
    setLocale(newLocale);
    localStorage.setItem('pixelBetLocale', newLocale);
  };

  const value: LocaleContextType = {
    locale,
    t: translations[locale],
    setLocale,
    toggleLocale,
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
