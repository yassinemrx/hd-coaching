"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton({ callbackUrl = "/login" }: { callbackUrl?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl })}
      className="text-sm text-slate-600 hover:text-slate-900"
    >
      Sign out
    </button>
  );
}
