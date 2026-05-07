"use client";

import { signOut } from "next-auth/react";
import { useDict } from "./I18nProvider";

export default function SignOutButton({ callbackUrl = "/login" }: { callbackUrl?: string }) {
  const t = useDict();
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl })}
      className="text-sm text-slate-600 hover:text-slate-900"
    >
      {t.common.signOut}
    </button>
  );
}
