/**
 * Atharva Travels ETS — Driver Android App (Atharva Pilot)
 * Language Context & Hook with Offline Persistence
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language } from '../types';
import { translations, TranslationKey } from './index';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: TranslationKey) => string;
  isLoading: boolean;
}

const STORAGE_KEY = '@atharva_driver_language';

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: async () => {},
  t: (key: TranslationKey) => translations.en[key] || key,
  isLoading: true,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && (saved === 'en' || saved === 'kn' || saved === 'hi')) {
          setLanguageState(saved as Language);
        }
      } catch (err) {
        console.warn('Failed to load saved language:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSavedLanguage();
  }, []);

  const setLanguage = async (newLang: Language) => {
    setLanguageState(newLang);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newLang);
    } catch (err) {
      console.warn('Failed to persist language choice:', err);
    }
  };

  const t = (key: TranslationKey): string => {
    const langDict = translations[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    return translations.en[key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
