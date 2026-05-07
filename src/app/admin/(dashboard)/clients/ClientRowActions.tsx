"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ClientRowActions({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm(`Delete ${name}? This removes all their data.`)) return;
    setBusy(true);
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
    else alert("Could not delete client.");
  }

  return (
    <div className="flex items-center justify-end gap-3 text-sm">
      <Link href={`/admin/clients/${id}`} className="text-brand-700 hover:underline">
        View
      </Link>
      <Link href={`/admin/clients/${id}/edit`} className="text-slate-600 hover:underline">
        Edit
      </Link>
      <button
        onClick={onDelete}
        disabled={busy}
        className="text-red-600 hover:underline disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
