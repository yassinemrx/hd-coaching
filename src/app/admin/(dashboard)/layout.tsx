import Link from "next/link";
import NavLink from "@/components/NavLink";
import SignOutButton from "@/components/SignOutButton";
import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="font-semibold text-slate-900">
            HD Coaching <span className="text-xs text-slate-400">· Coach</span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink href="/admin" exact>Overview</NavLink>
            <NavLink href="/admin/clients">Clients</NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">{user.name}</span>
            <SignOutButton callbackUrl="/admin/login" />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
