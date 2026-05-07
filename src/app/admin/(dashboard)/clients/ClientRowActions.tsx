"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDict } from "@/components/I18nProvider";

export default function ClientRowActions({ id, name }: { id: string; name: string }) {
  const t = useDict();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(t.admin.deleteClientConfirm.replace("{name}", name))) return;
    setBusy(true);
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
    else alert(t.admin.couldNotDeleteClient);
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <Link
        href={`/admin/clients/${id}/edit`}
        onClick={(e) => e.stopPropagation()}
        className="rounded-md px-2 py-1 text-ink-600 hover:bg-ink-100"
      >
        {t.common.edit}
      </Link>
      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        className="rounded-md px-2 py-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {t.common.delete}
      </button>
    </div>
  );
}
