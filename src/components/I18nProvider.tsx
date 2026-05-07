"use client";

import { createContext, useContext } from "react";
import type { Dict, Locale } from "@/lib/i18n/dict";

type Ctx = { dict: Dict; locale: Locale };

const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({
  dict,
  locale,
  children,
}: {
  dict: Dict;
  locale: Locale;
  children: React.ReactNode;
}) {
  return <I18nCtx.Provider value={{ dict, locale }}>{children}</I18nCtx.Provider>;
}

export function useDict(): Dict {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useDict must be used inside I18nProvider");
  return ctx.dict;
}

export function useLocale(): Locale {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useLocale must be used inside I18nProvider");
  return ctx.locale;
}
