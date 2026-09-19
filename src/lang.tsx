import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { STRINGS, fmt, type Key, type Lang } from './i18n';

const KEY = 'genetranslator:lang';

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: Key, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<LangCtx>({ lang: 'en', setLang: () => {}, t: (k) => STRINGS.en[k] });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(KEY);
    return saved === 'fr' ? 'fr' : 'en';
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem(KEY, lang);
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const t = useCallback(
    (key: Key, vars?: Record<string, string | number>) =>
      vars ? fmt(STRINGS[lang][key], vars) : STRINGS[lang][key],
    [lang],
  );

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
