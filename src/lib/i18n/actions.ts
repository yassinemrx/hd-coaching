"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LOCALES, type Locale } from "./dict";

const LOCALE_SET = new Set<string>(LOCALES);

export async function setLocale(locale: Locale) {
  if (!LOCALE_SET.has(locale)) return;
  const c = await cookies();
  c.set("lang", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
