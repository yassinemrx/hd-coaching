"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/lib/i18n/actions";
import { LOCALES, LOCALE_NAMES, LOCALE_SHORT, type Locale } from "@/lib/i18n/dict";
import { useLocale } from "./I18nProvider";

export default function LocaleSwitcher({ tone = "light" }: { tone?: "light" | "dark" }) {
  const current = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function pick(loc: Locale) {
    setOpen(false);
    if (loc === current) return;
    startTransition(async () => {
      await setLocale(loc);
      router.refresh();
    });
  }

  const btnClass =
    tone === "dark"
      ? "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white/80 ring-1 ring-white/15 hover:bg-white/10"
      : "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink-700 ring-1 ring-ink-200 hover:bg-ink-50";

  const menuClass =
    tone === "dark"
      ? "absolute end-0 mt-1 min-w-[140px] overflow-hidden rounded-lg bg-ink-900 text-white shadow-lg ring-1 ring-white/10"
      : "absolute end-0 mt-1 min-w-[140px] overflow-hidden rounded-lg bg-white shadow-soft ring-1 ring-ink-200";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        className={btnClass}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span aria-hidden="true">🌐</span>
        <span>{LOCALE_SHORT[current]}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div role="menu" className={menuClass}>
          {LOCALES.map((loc) => {
            const active = loc === current;
            const itemClass =
              tone === "dark"
                ? `flex w-full items-center justify-between px-3 py-2 text-sm ${
                    active ? "bg-white/10 font-semibold" : "hover:bg-white/5"
                  }`
                : `flex w-full items-center justify-between px-3 py-2 text-sm ${
                    active ? "bg-brand-50 font-semibold text-brand-700" : "hover:bg-ink-50"
                  }`;
            return (
              <button
                key={loc}
                type="button"
                role="menuitem"
                onClick={() => pick(loc)}
                className={itemClass}
              >
                <span>{LOCALE_NAMES[loc]}</span>
                <span className="text-xs opacity-60">{LOCALE_SHORT[loc]}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
