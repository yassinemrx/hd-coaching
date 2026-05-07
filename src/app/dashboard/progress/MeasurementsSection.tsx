"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

type Entry = {
  id: string;
  date: string;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  thighs: number | null;
  arms: number | null;
};

const FIELDS: { key: keyof Omit<Entry, "id" | "date">; label: string }[] = [
  { key: "chest", label: "Chest" },
  { key: "waist", label: "Waist" },
  { key: "hips", label: "Hips" },
  { key: "thighs", label: "Thighs" },
  { key: "arms", label: "Arms" },
];

export default function MeasurementsSection({ entries }: { entries: Entry[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: string, val: string) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload: Record<string, number | null> = {};
    let any = false;
    for (const f of FIELDS) {
      const raw = values[f.key];
      if (raw && raw.length > 0) {
        const n = parseFloat(raw);
        if (Number.isFinite(n) && n > 0) {
          payload[f.key] = n;
          any = true;
        }
      }
    }
    if (!any) {
      setError("Enter at least one measurement.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/measurements", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);
    if (!res.ok) {
      setError("Could not save measurements.");
      return;
    }
    setValues({});
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    const res = await fetch(`/api/measurements/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <section className="card">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Body measurements</h2>
        <span className="text-xs text-slate-400">cm</span>
      </div>

      <form onSubmit={onSubmit} className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="label" htmlFor={f.key}>{f.label}</label>
            <input
              id={f.key}
              type="number"
              step="0.1"
              min="0"
              className="input mt-1"
              value={values[f.key] ?? ""}
              onChange={(e) => set(f.key, e.target.value)}
              placeholder="—"
            />
          </div>
        ))}
        <div className="col-span-2 sm:col-span-5 flex items-center gap-3">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Saving…" : "Save measurements"}
          </button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>

      {entries.length > 0 ? (
        <div className="mt-6 overflow-x-auto rounded-md ring-1 ring-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2">Date</th>
                {FIELDS.map((f) => (
                  <th key={f.key} className="px-4 py-2">{f.label}</th>
                ))}
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {entries.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-2 text-slate-700">
                    {format(new Date(e.date), "MMM d, yyyy")}
                  </td>
                  {FIELDS.map((f) => (
                    <td key={f.key} className="px-4 py-2">
                      {e[f.key] != null ? `${(e[f.key] as number).toFixed(1)}` : "—"}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => onDelete(e.id)}
                      className="text-xs text-slate-400 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-6 text-sm text-slate-400">
          No measurements yet — log your first set above.
        </p>
      )}
    </section>
  );
}
