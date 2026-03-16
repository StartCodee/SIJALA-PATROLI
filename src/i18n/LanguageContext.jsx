import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
} from "./localeConfig";

const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
});

function normalizeLanguage(value) {
  return SUPPORTED_LANGUAGES.includes(value) ? value : DEFAULT_LANGUAGE;
}

function readInitialLanguage() {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  return normalizeLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(readInitialLanguage);

  const setLanguage = useCallback((nextLanguage) => {
    const normalized = normalizeLanguage(nextLanguage);
    setLanguageState(normalized);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
    }),
    [language, setLanguage],
  );

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
