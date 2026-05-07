import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import { getLocale, getDict } from "@/lib/i18n/server";
import { isRtl } from "@/lib/i18n/dict";

export const metadata: Metadata = {
  title: "HD Coaching",
  description: "Personal fitness coaching dashboard",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dict = await getDict();
  const dir = isRtl(locale) ? "rtl" : "ltr";
  return (
    <html lang={locale} dir={dir}>
      <body className="min-h-screen">
        <Providers dict={dict} locale={locale}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
