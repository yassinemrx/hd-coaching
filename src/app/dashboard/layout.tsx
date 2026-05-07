import Link from "next/link";
import NavLink from "@/components/NavLink";
import SignOutButton from "@/components/SignOutButton";
import { requireClient } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireClient();
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/dashboard/progress" className="font-semibold text-slate-900">
            HD Coaching
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink href="/dashboard/progress">Progress</NavLink>
            <NavLink href="/dashboard/diet">Diet</NavLink>
            <NavLink href="/dashboard/training">Training</NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">{user.name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
