"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import WeightChart from "@/components/WeightChart";

type Log = { id: string; date: string; weightKg: number };

export default function WeightSection({ logs }: { logs: Log[] }) {
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
      setError("Could not save. Check the value.");
      return;
    }
    setWeight("");
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this log?")) return;
    const res = await fetch(`/api/weight/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  const sortedDesc = [...logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <section className="card">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Weight</h2>
        <span className="text-xs text-slate-400">Last 90 days</span>
      </div>

      <form onSubmit={onSubmit} className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="label" htmlFor="weight">Today&apos;s weight (kg)</label>
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
            placeholder="e.g. 81.4"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving…" : "Log weight"}
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
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Weight</th>
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
                      Delete
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
