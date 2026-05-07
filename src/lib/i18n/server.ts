import { cookies } from "next/headers";
import { DICTS, DEFAULT_LOCALE, LOCALES, type Dict, type Locale } from "./dict";

const LOCALE_SET = new Set<string>(LOCALES);

export async function getLocale(): Promise<Locale> {
  const c = await cookies();
  const v = c.get("lang")?.value;
  return LOCALE_SET.has(v ?? "") ? (v as Locale) : DEFAULT_LOCALE;
}

export async function getDict(): Promise<Dict> {
  const locale = await getLocale();
  return DICTS[locale];
}
