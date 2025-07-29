import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import viTranslations from '../translations/vi';
import enTranslations from '../translations/en';
import { useThemeSettings } from './ThemeContext';

// Types
type TranslationValue = string | Record<string, any>;

type Translations = {
  [key: string]: TranslationValue;
};

type Languages = {
  vi: Translations;
  en: Translations;
};

interface LanguageContextType {
  t: (key: string, params?: Record<string, any>) => string;
  currentLanguage: string;
}

interface LanguageProviderProps {
  children: ReactNode;
}

// Translations object
const languages: Languages = {
  vi: viTranslations,
  en: enTranslations,
};

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Hook to use context
export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

// Provider component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { language: currentLanguage } = useThemeSettings();
  
  // Translation function
  const t = (key: string, params?: Record<string, any>): string => {
    // Get translations for current language
    const translations = languages[currentLanguage as keyof Languages] || languages.vi;
    
    // Handle nested keys like 'landing.hero.title'
    const keys = key.split('.');
    let result: any = translations;
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key; // Return key if not found
      }
    }
    
    // If result is not a string, return key
    if (typeof result !== 'string') {
      return key;
    }
    
    // Replace parameters in translation string
    if (params) {
      return Object.entries(params).reduce((str, [key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        return str.replace(regex, String(value));
      }, result);
    }
    
    return result;
  };
  
  // Update page title
  useEffect(() => {
    document.title = t('appName');
  }, [currentLanguage]);
  
  const value = {
    t,
    currentLanguage,
  };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext; 