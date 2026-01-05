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
    const saved = localStorage.getItem('cloverCadiaLocale') as Locale;
    if (saved && (saved === 'en' || saved === 'ko')) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('cloverCadiaLocale', newLocale);
  };

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'ko' : 'en');
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
