"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useDict } from "@/components/I18nProvider";

type Entry = {
  id: string;
  date: string;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  thighs: number | null;
  arms: number | null;
};

const FIELD_KEYS = ["chest", "waist", "hips", "thighs", "arms"] as const;
type FieldKey = (typeof FIELD_KEYS)[number];

export default function MeasurementsSection({ entries }: { entries: Entry[] }) {
  const t = useDict();
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const FIELDS: { key: FieldKey; label: string }[] = [
    { key: "chest", label: t.progress.chest },
    { key: "waist", label: t.progress.waist },
    { key: "hips", label: t.progress.hips },
    { key: "thighs", label: t.progress.thighs },
    { key: "arms", label: t.progress.arms },
  ];

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
      setError(t.progress.enterAtLeastOne);
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
      setError(t.progress.couldNotSaveMeasurements);
      return;
    }
    setValues({});
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm(t.progress.deleteEntryConfirm)) return;
    const res = await fetch(`/api/measurements/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <section className="card">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t.progress.bodyMeasurements}</h2>
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
            {submitting ? t.common.saving : t.progress.saveMeasurements}
          </button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>

      {entries.length > 0 ? (
        <div className="mt-6 overflow-x-auto rounded-md ring-1 ring-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2">{t.common.date}</th>
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
                      {t.common.delete}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-6 text-sm text-slate-400">{t.progress.noMeasurements}</p>
      )}
    </section>
  );
}
