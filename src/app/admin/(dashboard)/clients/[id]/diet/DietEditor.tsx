"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SearchIcon,
  CloseIcon,
  SaladIcon,
  CheckIcon,
} from "@/components/Icon";
import { useLocale } from "@/components/I18nProvider";
import { trFoodName, trCategory, trUnit } from "@/lib/i18n/dynamic";

type Food = {
  id: string;
  name: string;
  category: string;
  unit: string;
  perAmount: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type Item = {
  foodId: string | null;
  customName: string | null;
  quantity: number;
  unit: string;
};

type Meal = { name: string; time: string; notes: string; items: Item[] };
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
  meals: [{ name: "Breakfast", time: "08:00", notes: "", items: [] }],
};

function macrosFor(item: Item, foodMap: Map<string, Food>): {
  cal: number; p: number; c: number; f: number;
} {
  if (!item.foodId) return { cal: 0, p: 0, c: 0, f: 0 };
  const food = foodMap.get(item.foodId);
  if (!food || !food.perAmount) return { cal: 0, p: 0, c: 0, f: 0 };
  const factor = item.quantity / food.perAmount;
  return {
    cal: food.calories * factor,
    p: food.protein * factor,
    c: food.carbs * factor,
    f: food.fat * factor,
  };
}

export default function DietEditor({
  clientId,
  initial,
  foods,
}: {
  clientId: string;
  initial: Initial | null;
  foods: Food[];
}) {
  const router = useRouter();
  const locale = useLocale();
  const [state, setState] = useState<Initial>(initial ?? EMPTY);
  const [pickerForMeal, setPickerForMeal] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const foodMap = useMemo(() => {
    const m = new Map<string, Food>();
    for (const f of foods) m.set(f.id, f);
    return m;
  }, [foods]);

  // Total macros across all meal items
  const totals = useMemo(() => {
    let cal = 0, p = 0, c = 0, f = 0;
    for (const meal of state.meals) {
      for (const item of meal.items) {
        const m = macrosFor(item, foodMap);
        cal += m.cal; p += m.p; c += m.c; f += m.f;
      }
    }
    return { cal, p, c, f };
  }, [state.meals, foodMap]);

  function patch(p: Partial<Initial>) {
    setState((s) => ({ ...s, ...p }));
  }
  function setMacro(k: keyof Macros, v: string) {
    const n = Math.max(0, parseInt(v || "0", 10) || 0);
    setState((s) => ({ ...s, macros: { ...s.macros, [k]: n } }));
  }

  function addMeal() {
    setState((s) => ({
      ...s,
      meals: [...s.meals, { name: "", time: "", notes: "", items: [] }],
    }));
  }
  function removeMeal(i: number) {
    setState((s) => ({ ...s, meals: s.meals.filter((_, idx) => idx !== i) }));
  }
  function setMeal(i: number, p: Partial<Meal>) {
    setState((s) => ({
      ...s,
      meals: s.meals.map((m, idx) => (idx === i ? { ...m, ...p } : m)),
    }));
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

  function addItem(mealIdx: number, food: Food, quantity: number) {
    setState((s) => ({
      ...s,
      meals: s.meals.map((m, i) =>
        i === mealIdx
          ? {
              ...m,
              items: [
                ...m.items,
                { foodId: food.id, customName: null, quantity, unit: food.unit },
              ],
            }
          : m
      ),
    }));
  }
  function setItem(mi: number, ii: number, p: Partial<Item>) {
    setState((s) => ({
      ...s,
      meals: s.meals.map((m, idx) =>
        idx !== mi
          ? m
          : { ...m, items: m.items.map((it, j) => (j === ii ? { ...it, ...p } : it)) }
      ),
    }));
  }
  function removeItem(mi: number, ii: number) {
    setState((s) => ({
      ...s,
      meals: s.meals.map((m, idx) =>
        idx === mi ? { ...m, items: m.items.filter((_, j) => j !== ii) } : m
      ),
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);
    if (!state.title.trim()) return setError("Plan title is required.");
    if (state.meals.some((m) => !m.name.trim() || !m.time.trim()))
      return setError("Each meal needs a name and time.");

    setSaving(true);
    const res = await fetch(`/api/clients/${clientId}/diet`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: state.title,
        notes: state.notes || null,
        macros: state.macros,
        meals: state.meals.map((m) => ({
          name: m.name,
          time: m.time,
          notes: m.notes || null,
          items: m.items,
        })),
      }),
    });
    setSaving(false);
    if (!res.ok) return setError("Save failed.");
    setOk(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-6 pb-24">
      <div className="card space-y-4">
        <div>
          <label className="label">Plan title</label>
          <input
            required
            className="input mt-1"
            value={state.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="e.g. Cut Phase — Week 4"
          />
        </div>
        <div>
          <label className="label">Coach notes</label>
          <textarea
            rows={3}
            className="input mt-1"
            value={state.notes}
            onChange={(e) => patch({ notes: e.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card">
          <h2 className="h-section">Daily targets</h2>
          <p className="text-xs text-ink-500">What the client should aim for.</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {(["calories", "protein", "carbs", "fat"] as const).map((k) => (
              <div key={k}>
                <label className="label capitalize">
                  {k} {k === "calories" ? "(kcal)" : "(g)"}
                </label>
                <input
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
          <h2 className="h-section">Plan total (calculated)</h2>
          <p className="text-xs text-ink-500">Auto from foods you added.</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <TotalMacro label="Calories" value={Math.round(totals.cal)} target={state.macros.calories} unit="kcal" />
            <TotalMacro label="Protein" value={Math.round(totals.p)} target={state.macros.protein} unit="g" />
            <TotalMacro label="Carbs" value={Math.round(totals.c)} target={state.macros.carbs} unit="g" />
            <TotalMacro label="Fat" value={Math.round(totals.f)} target={state.macros.fat} unit="g" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {state.meals.map((meal, mi) => (
          <div key={mi} className="card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Meal name</label>
                  <input
                    className="input mt-1"
                    value={meal.name}
                    onChange={(e) => setMeal(mi, { name: e.target.value })}
                    placeholder="Breakfast"
                  />
                </div>
                <div>
                  <label className="label">Time</label>
                  <input
                    className="input mt-1"
                    value={meal.time}
                    onChange={(e) => setMeal(mi, { time: e.target.value })}
                    placeholder="08:00"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => moveMeal(mi, -1)} className="btn btn-secondary px-3" aria-label="Move up">
                  <ArrowUpIcon size={16} />
                </button>
                <button type="button" onClick={() => moveMeal(mi, 1)} className="btn btn-secondary px-3" aria-label="Move down">
                  <ArrowDownIcon size={16} />
                </button>
                <button type="button" onClick={() => removeMeal(mi)} className="btn btn-danger">
                  Remove
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {meal.items.length === 0 && (
                <div className="empty-state py-6">
                  <SaladIcon size={22} className="text-ink-300" />
                  <p className="mt-2 text-sm text-ink-600">No foods yet.</p>
                </div>
              )}
              {meal.items.map((item, ii) => {
                const food = item.foodId ? foodMap.get(item.foodId) : null;
                const m = macrosFor(item, foodMap);
                return (
                  <div key={ii} className="rounded-lg border border-ink-200 bg-white p-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-ink-900">
                          {food ? trFoodName(food.name, locale) : item.customName || "Custom item"}
                        </div>
                        <div className="text-xs text-ink-500">
                          {Math.round(m.cal)} kcal · P {m.p.toFixed(1)} · C {m.c.toFixed(1)} · F {m.f.toFixed(1)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          step="0.1"
                          value={item.quantity}
                          onChange={(e) =>
                            setItem(mi, ii, { quantity: parseFloat(e.target.value || "0") })
                          }
                          className="input w-24"
                        />
                        <span className="text-sm text-ink-500">{trUnit(item.unit, locale)}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(mi, ii)}
                          className="btn-icon hover:text-red-600"
                          aria-label="Remove"
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() => setPickerForMeal(mi)}
                className="btn btn-secondary w-full sm:w-auto"
              >
                <PlusIcon size={16} /> Add food from library
              </button>
            </div>

            <div className="mt-3">
              <label className="label">Meal notes</label>
              <input
                className="input mt-1"
                value={meal.notes}
                onChange={(e) => setMeal(mi, { notes: e.target.value })}
                placeholder="optional notes for this meal"
              />
            </div>
          </div>
        ))}
        <button type="button" onClick={addMeal} className="btn btn-secondary">
          <PlusIcon size={16} /> Add meal
        </button>
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {ok && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">Saved.</p>}

      <div className="fixed bottom-4 left-0 right-0 z-30 flex justify-center px-4">
        <button type="submit" className="btn btn-primary shadow-glow" disabled={saving}>
          <CheckIcon size={16} />
          {saving ? "Saving…" : "Save plan"}
        </button>
      </div>

      {pickerForMeal !== null && (
        <FoodPicker
          foods={foods}
          onClose={() => setPickerForMeal(null)}
          onAdd={(food, qty) => {
            addItem(pickerForMeal, food, qty);
          }}
        />
      )}
    </form>
  );
}

function TotalMacro({
  label,
  value,
  target,
  unit,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
}) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  const over = target > 0 && value > target;
  return (
    <div className="rounded-lg bg-ink-50 p-3">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</span>
        <span className="text-xs text-ink-400">target {target}</span>
      </div>
      <div className="mt-1 font-display text-xl font-bold text-ink-900">
        {value}
        <span className="ml-1 text-sm font-medium text-ink-400">{unit}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
        <div
          className={"h-full " + (over ? "bg-red-500" : "bg-brand-500")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function FoodPicker({
  foods,
  onClose,
  onAdd,
}: {
  foods: Food[];
  onClose: () => void;
  onAdd: (food: Food, qty: number) => void;
}) {
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<Food | null>(null);
  const [qty, setQty] = useState("100");

  const categories = useMemo(() => {
    const set = new Set(foods.map((f) => f.category));
    return ["All", ...Array.from(set)];
  }, [foods]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return foods.filter(
      (f) =>
        (filter === "All" || f.category === filter) &&
        (q === "" || f.name.toLowerCase().includes(q))
    );
  }, [foods, search, filter]);

  function pick(food: Food) {
    setSelected(food);
    setQty(String(food.perAmount));
  }
  function confirm() {
    if (!selected) return;
    const n = parseFloat(qty || "0");
    if (n <= 0) return;
    onAdd(selected, n);
    setSelected(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 backdrop-blur-sm sm:items-center">
      <div className="flex h-[85vh] w-full max-w-2xl flex-col animate-slide-in rounded-t-2xl bg-white shadow-soft sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-ink-100 p-4">
          <div>
            <h2 className="h-section">Pick a food</h2>
            <p className="text-xs text-ink-500">Tap, set quantity, add.</p>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        {selected ? (
          <div className="flex-1 overflow-y-auto p-4">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-sm text-brand-700 hover:text-brand-600"
            >
              ← Back to list
            </button>
            <div className="mt-3 rounded-xl border border-brand-200 bg-brand-50/40 p-4">
              <h3 className="font-display text-lg font-bold text-ink-900">{trFoodName(selected.name, locale)}</h3>
              <p className="mt-0.5 text-xs text-ink-500">
                Per {selected.perAmount} {trUnit(selected.unit, locale)}: {Math.round(selected.calories)} kcal · P{" "}
                {selected.protein.toFixed(1)} · C {selected.carbs.toFixed(1)} · F{" "}
                {selected.fat.toFixed(1)}
              </p>
            </div>
            <div className="mt-4">
              <label className="label">Quantity ({trUnit(selected.unit, locale)})</label>
              <input
                autoFocus
                type="number"
                min={0}
                step="0.1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="input mt-1"
              />
              {(() => {
                const factor = parseFloat(qty || "0") / selected.perAmount;
                const cal = selected.calories * factor;
                const p = selected.protein * factor;
                const c = selected.carbs * factor;
                const f = selected.fat * factor;
                return (
                  <p className="mt-2 text-sm text-ink-600">
                    → <strong>{Math.round(cal)}</strong> kcal · P {p.toFixed(1)} · C{" "}
                    {c.toFixed(1)} · F {f.toFixed(1)}
                  </p>
                );
              })()}
            </div>
            <button type="button" onClick={confirm} className="btn btn-primary mt-4 w-full">
              <PlusIcon size={16} /> Add to meal
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3 p-4">
              <label className="relative block">
                <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search foods…"
                  className="input pl-9"
                />
              </label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFilter(c)}
                    className={
                      "rounded-full px-3 py-1.5 text-xs font-medium transition-colors " +
                      (filter === c
                        ? "bg-ink-900 text-white"
                        : "bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-50")
                    }
                  >
                    {c === "All" ? c : trCategory(c, locale)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-ink-400">No matches.</p>
              ) : (
                <ul className="space-y-2">
                  {filtered.map((f) => (
                    <li key={f.id}>
                      <button
                        type="button"
                        onClick={() => pick(f)}
                        className="flex w-full items-center justify-between rounded-lg border border-ink-100 p-3 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/30"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-ink-900">{trFoodName(f.name, locale)}</div>
                          <div className="text-xs text-ink-500">
                            {Math.round(f.calories)} kcal · P {f.protein.toFixed(1)} · C{" "}
                            {f.carbs.toFixed(1)} · F {f.fat.toFixed(1)}{" "}
                            <span className="text-ink-400">
                              · per {f.perAmount} {trUnit(f.unit, locale)}
                            </span>
                          </div>
                        </div>
                        <span className="chip">{trCategory(f.category, locale)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
