import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

type Language = 'ar' | 'en' | 'es' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Fix: Make children optional to satisfy TypeScript strictness
export const LanguageProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('minecloud_lang') as Language) || 'ar';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('minecloud_lang', lang);
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (path: string) => {
    const keys = path.split('.');
    let result: any = translations[language];
    for (const key of keys) {
      if (result && result[key]) {
        result = result[key];
      } else {
        return path; 
      }
    }
    return result as string;
  };

  const isRtl = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};