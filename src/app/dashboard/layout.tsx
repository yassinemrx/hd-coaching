import Link from "next/link";
import { ChartIcon, SaladIcon, DumbbellIcon, SettingsIcon } from "@/components/Icon";
import SignOutButton from "@/components/SignOutButton";
import NavLink from "@/components/NavLink";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { requireClient } from "@/lib/session";
import { getDict } from "@/lib/i18n/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, t] = await Promise.all([requireClient(), getDict()]);
  return (
    <div className="min-h-screen bg-ink-50">
      <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/dashboard/progress" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-gradient text-white shadow-soft">
              <DumbbellIcon size={18} />
            </span>
            <span className="hidden font-display font-bold tracking-tight sm:inline">
              HD Coaching
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink href="/dashboard/progress">
              <span className="flex items-center gap-2"><ChartIcon size={16} /> {t.nav.progress}</span>
            </NavLink>
            <NavLink href="/dashboard/diet">
              <span className="flex items-center gap-2"><SaladIcon size={16} /> {t.nav.diet}</span>
            </NavLink>
            <NavLink href="/dashboard/training">
              <span className="flex items-center gap-2"><DumbbellIcon size={16} /> {t.nav.training}</span>
            </NavLink>
            <NavLink href="/dashboard/settings">
              <span className="flex items-center gap-2"><SettingsIcon size={16} /> {t.nav.settings}</span>
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <span className="hidden text-sm font-medium text-ink-700 sm:inline">{user.name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
