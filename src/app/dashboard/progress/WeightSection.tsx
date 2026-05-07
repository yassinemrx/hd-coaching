"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import WeightChart from "@/components/WeightChart";
import { useDict } from "@/components/I18nProvider";

type Log = { id: string; date: string; weightKg: number };

export default function WeightSection({ logs }: { logs: Log[] }) {
  const t = useDict();
  const router = useRouter();
  const [weight, setWeight] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/weight", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ weightKg: weight }),
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(t.progress.couldNotSaveWeight);
      return;
    }
    setWeight("");
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm(t.progress.deleteLogConfirm)) return;
    const res = await fetch(`/api/weight/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  const sortedDesc = [...logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <section className="card">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t.progress.weight}</h2>
        <span className="text-xs text-slate-400">{t.progress.last90}</span>
      </div>

      <form onSubmit={onSubmit} className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="label" htmlFor="weight">{t.progress.todaysWeight}</label>
          <input
            id="weight"
            type="number"
            step="0.1"
            min="20"
            max="400"
            required
            className="input mt-1 w-40"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={t.progress.weightPlaceholder}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? t.common.saving : t.progress.logWeight}
        </button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </form>

      <div className="mt-6">
        <WeightChart data={logs} />
      </div>

      {sortedDesc.length > 0 && (
        <div className="mt-6 max-h-64 overflow-auto rounded-md ring-1 ring-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2">{t.common.date}</th>
                <th className="px-4 py-2">{t.progress.weightCol}</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {sortedDesc.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-2 text-slate-700">
                    {format(new Date(l.date), "EEE, MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-2 font-medium">{l.weightKg.toFixed(1)} kg</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => onDelete(l.id)}
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
      )}
    </section>
  );
}
