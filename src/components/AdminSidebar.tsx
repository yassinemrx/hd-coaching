"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  HomeIcon,
  UsersIcon,
  DumbbellIcon,
  SaladIcon,
  LogoutIcon,
  MenuIcon,
  CloseIcon,
  SettingsIcon,
} from "./Icon";
import LocaleSwitcher from "./LocaleSwitcher";
import { useDict } from "./I18nProvider";

export default function AdminSidebar({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-ink-200 bg-white px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-gradient text-white shadow-soft">
            <DumbbellIcon size={18} />
          </span>
          <span className="font-display text-base font-bold tracking-tight">HD Coaching</span>
        </Link>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn-icon"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 start-0 w-72 bg-ink-gradient text-white">
            <SidebarContent name={name} onNavigate={() => setOpen(false)} />
            <button
              onClick={() => setOpen(false)}
              className="absolute end-3 top-3 rounded-lg p-2 text-white/70 hover:bg-white/10"
              aria-label="Close menu"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">
        <div className="flex h-full flex-col bg-ink-gradient text-white">
          <SidebarContent name={name} />
        </div>
      </aside>
    </>
  );
}

function SidebarContent({
  name,
  onNavigate,
}: {
  name: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const t = useDict();

  const NAV = [
    { href: "/admin", label: t.nav.overview, icon: HomeIcon, exact: true },
    { href: "/admin/clients", label: t.nav.clients, icon: UsersIcon, exact: false },
    { href: "/admin/exercises", label: t.nav.exerciseLibrary, icon: DumbbellIcon, exact: false },
    { href: "/admin/foods", label: t.nav.foodLibrary, icon: SaladIcon, exact: false },
    { href: "/admin/settings", label: t.nav.settings, icon: SettingsIcon, exact: false },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-6 pb-4">
        <Link href="/admin" onClick={onNavigate} className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-gradient shadow-glow">
            <DumbbellIcon size={20} className="text-white" />
          </span>
          <div>
            <div className="font-display text-base font-bold tracking-tight">HD Coaching</div>
            <div className="text-xs text-white/40">{t.nav.coachPanel}</div>
          </div>
        </Link>
      </div>

      <div className="px-5 pb-3 hidden lg:block">
        <LocaleSwitcher tone="dark" />
      </div>

      <nav className="flex-1 px-3 py-2">
        <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
          {t.nav.workspace}
        </div>
        <ul className="space-y-1">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={
                    "nav-item " +
                    (active ? "nav-item-active" : "nav-item-inactive")
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-sm font-semibold">
            {name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{name}</div>
            <div className="text-xs text-white/40">{t.common.admin}</div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
            aria-label={t.common.signOut}
          >
            <LogoutIcon size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
