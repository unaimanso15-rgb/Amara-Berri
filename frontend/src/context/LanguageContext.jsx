import { createContext, useContext, useState, useCallback } from "react";
import { translations } from "@/i18n/translations";

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem("abke_lang") || "es");

  const changeLang = useCallback((l) => {
    setLang(l);
    localStorage.setItem("abke_lang", l);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
