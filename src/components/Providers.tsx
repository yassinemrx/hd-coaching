"use client";

import { SessionProvider } from "next-auth/react";
import { I18nProvider } from "@/components/I18nProvider";
import type { Dict, Locale } from "@/lib/i18n/dict";

export default function Providers({
  children,
  dict,
  locale,
}: {
  children: React.ReactNode;
  dict: Dict;
  locale: Locale;
}) {
  return (
    <SessionProvider>
      <I18nProvider dict={dict} locale={locale}>
        {children}
      </I18nProvider>
    </SessionProvider>
  );
}
