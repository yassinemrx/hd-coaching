"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Meal = { name: string; time: string; foods: string };
type Macros = { calories: number; protein: number; carbs: number; fat: number };

type Initial = {
  title: string;
  notes: string;
  macros: Macros;
  meals: Meal[];
};

const EMPTY: Initial = {
  title: "",
  notes: "",
  macros: { calories: 2000, protein: 150, carbs: 200, fat: 60 },
  meals: [{ name: "Breakfast", time: "08:00", foods: "" }],
};

export default function DietEditor({
  clientId,
  initial,
}: {
  clientId: string;
  initial: Initial | null;
}) {
  const router = useRouter();
  const [state, setState] = useState<Initial>(initial ?? EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);

  function setMacro(key: keyof Macros, val: string) {
    const n = Math.max(0, parseInt(val || "0", 10) || 0);
    setState((s) => ({ ...s, macros: { ...s.macros, [key]: n } }));
  }

  function setMeal(i: number, patch: Partial<Meal>) {
    setState((s) => ({
      ...s,
      meals: s.meals.map((m, idx) => (idx === i ? { ...m, ...patch } : m)),
    }));
  }

  function addMeal() {
    setState((s) => ({
      ...s,
      meals: [...s.meals, { name: "", time: "", foods: "" }],
    }));
  }

  function removeMeal(i: number) {
    setState((s) => ({ ...s, meals: s.meals.filter((_, idx) => idx !== i) }));
  }

  function moveMeal(i: number, dir: -1 | 1) {
    setState((s) => {
      const arr = [...s.meals];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return s;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...s, meals: arr };
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);
    if (!state.title.trim()) {
      setError("Plan title is required.");
      return;
    }
    if (state.meals.some((m) => !m.name.trim() || !m.time.trim())) {
      setError("Each meal needs a name and a time.");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/clients/${clientId}/diet`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(state),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Save failed.");
      return;
    }
    setOk(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-6">
      <div className="card space-y-4">
        <div>
          <label className="label" htmlFor="title">Plan title</label>
          <input
            id="title"
            required
            className="input mt-1"
            value={state.title}
            onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))}
            placeholder="e.g. Cut Phase — Week 4"
          />
        </div>
        <div>
          <label className="label" htmlFor="notes">Coach notes</label>
          <textarea
            id="notes"
            rows={3}
            className="input mt-1"
            value={state.notes}
            onChange={(e) => setState((s) => ({ ...s, notes: e.target.value }))}
          />
        </div>
      </div>

      <div className="card">
        <h2 className="text-base font-semibold">Daily macro targets</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(["calories", "protein", "carbs", "fat"] as const).map((k) => (
            <div key={k}>
              <label className="label capitalize" htmlFor={k}>
                {k} {k === "calories" ? "(kcal)" : "(g)"}
              </label>
              <input
                id={k}
                type="number"
                min={0}
                className="input mt-1"
                value={state.macros[k]}
                onChange={(e) => setMacro(k, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Meals</h2>
          <button type="button" onClick={addMeal} className="btn btn-secondary">
            + Add meal
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {state.meals.map((m, i) => (
            <div key={i} className="rounded-lg border border-slate-200 p-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="label">Name</label>
                  <input
                    className="input mt-1"
                    value={m.name}
                    onChange={(e) => setMeal(i, { name: e.target.value })}
                    placeholder="Breakfast"
                  />
                </div>
                <div>
                  <label className="label">Time</label>
                  <input
                    className="input mt-1"
                    value={m.time}
                    onChange={(e) => setMeal(i, { time: e.target.value })}
                    placeholder="08:00"
                  />
                </div>
                <div className="flex items-end justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => moveMeal(i, -1)}
                    className="btn btn-secondary"
                    aria-label="Move up"
                  >↑</button>
                  <button
                    type="button"
                    onClick={() => moveMeal(i, 1)}
                    className="btn btn-secondary"
                    aria-label="Move down"
                  >↓</button>
                  <button
                    type="button"
                    onClick={() => removeMeal(i)}
                    className="btn btn-danger"
                  >Remove</button>
                </div>
              </div>
              <div className="mt-3">
                <label className="label">Foods</label>
                <textarea
                  rows={2}
                  className="input mt-1"
                  value={m.foods}
                  onChange={(e) => setMeal(i, { foods: e.target.value })}
                  placeholder="e.g. 4 egg whites, 80g oats, 1 banana"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {ok && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">Saved.</p>}

      <div className="sticky bottom-4 flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : "Save plan"}
        </button>
      </div>
    </form>
  );
}
