"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  SearchIcon,
  PencilIcon,
  TrashIcon,
  SaladIcon,
  CloseIcon,
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
  notes: string | null;
};

const CATEGORIES = ["Protein", "Carbs", "Fats", "Vegetables", "Fruits", "Dairy", "Drinks", "Other"];
const UNITS = ["g", "ml", "piece", "cup", "scoop", "slice", "tbsp"];

export default function FoodLibraryClient({ initial }: { initial: Food[] }) {
  const router = useRouter();
  const locale = useLocale();
  const [items, setItems] = useState(initial);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState<Food | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(
      (f) =>
        (filter === "All" || f.category === filter) &&
        (q === "" || f.name.toLowerCase().includes(q))
    );
  }, [items, search, filter]);

  const grouped = useMemo(() => {
    const map: Record<string, Food[]> = {};
    for (const f of filtered) (map[f.category] ||= []).push(f);
    return map;
  }, [filtered]);

  function openNew() {
    setEditing(null);
    setShowForm(true);
  }
  function openEdit(f: Food) {
    setEditing(f);
    setShowForm(true);
  }
  async function onDelete(id: string) {
    if (!confirm("Delete this food?")) return;
    const res = await fetch(`/api/foods/${id}`, { method: "DELETE" });
    if (res.ok) setItems((arr) => arr.filter((x) => x.id !== id));
    else alert("Could not delete (it may be in use).");
  }

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Library</p>
          <h1 className="mt-1 h-page">Foods</h1>
          <p className="mt-1 text-muted">
            Build meals fast — pick a food and a quantity for each client.
          </p>
        </div>
        <button onClick={openNew} className="btn btn-primary">
          <PlusIcon size={16} /> New food
        </button>
      </header>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search foods…"
            className="input pl-9"
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={filter === "All"} onClick={() => setFilter("All")}>All</FilterChip>
          {CATEGORIES.map((c) => (
            <FilterChip key={c} active={filter === c} onClick={() => setFilter(c)}>
              {trCategory(c, locale)}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {Object.keys(grouped).length === 0 ? (
          <div className="empty-state">
            <SaladIcon size={28} className="text-ink-300" />
            <p className="mt-3 font-medium text-ink-700">No foods match</p>
            <p className="mt-1 text-muted">Add a new food or change the filter.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([cat, list]) => (
            <section key={cat}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">{trCategory(cat, locale)}</h2>
                <span className="text-xs text-ink-400">({list.length})</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((f) => (
                  <article
                    key={f.id}
                    className="group rounded-xl bg-white p-4 ring-1 ring-ink-100 transition-all hover:-translate-y-0.5 hover:shadow-soft hover:ring-brand-200"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold text-ink-900">{trFoodName(f.name, locale)}</h3>
                        <p className="mt-0.5 text-xs text-ink-400">
                          per {f.perAmount} {trUnit(f.unit, locale)}
                        </p>
                        <div className="mt-2 grid grid-cols-4 gap-1 text-center">
                          <Macro label="kcal" value={Math.round(f.calories)} />
                          <Macro label="P" value={f.protein.toFixed(1)} />
                          <Macro label="C" value={f.carbs.toFixed(1)} />
                          <Macro label="F" value={f.fat.toFixed(1)} />
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button onClick={() => openEdit(f)} className="btn-icon" aria-label="Edit">
                          <PencilIcon size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(f.id)}
                          className="btn-icon hover:text-red-600"
                          aria-label="Delete"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {showForm && (
        <FoodForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={(saved) => {
            setShowForm(false);
            setItems((arr) => {
              const idx = arr.findIndex((x) => x.id === saved.id);
              if (idx >= 0) {
                const copy = [...arr];
                copy[idx] = saved;
                return copy;
              }
              return [...arr, saved];
            });
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function Macro({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-ink-50 px-2 py-1">
      <div className="text-[10px] font-medium uppercase tracking-wide text-ink-500">{label}</div>
      <div className="text-sm font-semibold text-ink-900">{value}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full px-3 py-1.5 text-xs font-medium transition-colors " +
        (active
          ? "bg-ink-900 text-white"
          : "bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-50")
      }
    >
      {children}
    </button>
  );
}

function FoodForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: Food | null;
  onClose: () => void;
  onSaved: (f: Food) => void;
}) {
  const locale = useLocale();
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "Protein");
  const [unit, setUnit] = useState(initial?.unit ?? "g");
  const [perAmount, setPerAmount] = useState(String(initial?.perAmount ?? 100));
  const [calories, setCalories] = useState(String(initial?.calories ?? ""));
  const [protein, setProtein] = useState(String(initial?.protein ?? ""));
  const [carbs, setCarbs] = useState(String(initial?.carbs ?? ""));
  const [fat, setFat] = useState(String(initial?.fat ?? ""));
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const body = {
      name,
      category,
      unit,
      perAmount: parseFloat(perAmount || "0"),
      calories: parseFloat(calories || "0"),
      protein: parseFloat(protein || "0"),
      carbs: parseFloat(carbs || "0"),
      fat: parseFloat(fat || "0"),
      notes: notes || null,
    };
    const url = initial ? `/api/foods/${initial.id}` : "/api/foods";
    const method = initial ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Save failed.");
      return;
    }
    const saved = await res.json();
    onSaved(saved);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-lg animate-slide-in rounded-t-2xl bg-white p-6 shadow-soft sm:rounded-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="h-section">{initial ? "Edit food" : "New food"}</h2>
            <p className="text-muted">Macros stored per the amount you set below.</p>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input mt-1"
              placeholder="Chicken breast (cooked)"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input mt-1"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{trCategory(c, locale)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Unit</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value)} className="input mt-1">
                {UNITS.map((u) => (
                  <option key={u} value={u}>{trUnit(u, locale)}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Per amount (in the unit above)</label>
            <input
              type="number"
              step="0.1"
              min={0}
              required
              value={perAmount}
              onChange={(e) => setPerAmount(e.target.value)}
              className="input mt-1"
            />
            <p className="mt-1 text-xs text-ink-400">
              e.g. 100 (per 100g) or 1 (per piece). Macros below are for this amount.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="label">Calories</label>
              <input
                type="number"
                step="0.1"
                min={0}
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="label">Protein g</label>
              <input
                type="number"
                step="0.1"
                min={0}
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="label">Carbs g</label>
              <input
                type="number"
                step="0.1"
                min={0}
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="label">Fat g</label>
              <input
                type="number"
                step="0.1"
                min={0}
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="input mt-1"
              />
            </div>
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input mt-1"
            />
          </div>
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? "Saving…" : initial ? "Save changes" : "Add food"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
