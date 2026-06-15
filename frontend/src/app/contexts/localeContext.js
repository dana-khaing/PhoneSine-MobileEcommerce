"use client";

import { createContext, useEffect, useMemo, useState } from "react";
import { supportedLocales, translate } from "../i18n.mjs";

export const LocaleContext = createContext({ locale: "en", setLocale: () => {}, t: (key) => key });

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState("en");
  useEffect(() => {
    const saved = localStorage.getItem("phone-sine-locale");
    if (supportedLocales.includes(saved)) setLocale(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem("phone-sine-locale", locale);
  }, [locale]);
  const value = useMemo(() => ({ locale, setLocale, t: (key) => translate(locale, key) }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
