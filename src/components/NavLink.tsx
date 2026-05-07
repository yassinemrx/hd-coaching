"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({
  href,
  children,
  exact = false,
}: {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={
        "rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
        (active
          ? "bg-brand-50 text-brand-700"
          : "text-ink-600 hover:bg-ink-100 hover:text-ink-900")
      }
    >
      {children}
    </Link>
  );
}
