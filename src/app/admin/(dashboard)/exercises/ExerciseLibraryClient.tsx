"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  SearchIcon,
  PencilIcon,
  TrashIcon,
  DumbbellIcon,
  CloseIcon,
} from "@/components/Icon";
import { useLocale } from "@/components/I18nProvider";
import { trExerciseName, trCategory, trMuscleGroup, trEquipment } from "@/lib/i18n/dynamic";

type Exercise = {
  id: string;
  name: string;
  category: string;
  muscleGroup: string | null;
  equipment: string | null;
  notes: string | null;
  defaultSets: number | null;
  defaultReps: string | null;
  defaultRest: string | null;
};

const CATEGORIES = ["Push", "Pull", "Legs", "Core", "Cardio", "Olympic", "Full Body", "Other"];
const EQUIPMENT = ["Barbell", "Dumbbell", "Machine", "Cable", "Bodyweight", "Kettlebell", "Band"];

export default function ExerciseLibraryClient({ initial }: { initial: Exercise[] }) {
  const router = useRouter();
  const locale = useLocale();
  const [items, setItems] = useState(initial);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(
      (e) =>
        (filterCategory === "All" || e.category === filterCategory) &&
        (q === "" ||
          e.name.toLowerCase().includes(q) ||
          (e.muscleGroup ?? "").toLowerCase().includes(q) ||
          (e.equipment ?? "").toLowerCase().includes(q))
    );
  }, [items, search, filterCategory]);

  const grouped = useMemo(() => {
    const map: Record<string, Exercise[]> = {};
    for (const e of filtered) {
      (map[e.category] ||= []).push(e);
    }
    return map;
  }, [filtered]);

  function openNew() {
    setEditing(null);
    setShowForm(true);
  }
  function openEdit(ex: Exercise) {
    setEditing(ex);
    setShowForm(true);
  }
  async function onDelete(id: string) {
    if (!confirm("Delete this exercise?")) return;
    const res = await fetch(`/api/exercises/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((arr) => arr.filter((x) => x.id !== id));
    } else {
      alert("Could not delete (it may be in use).");
    }
  }

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Library</p>
          <h1 className="mt-1 h-page">Exercises</h1>
          <p className="mt-1 text-muted">
            Tap any exercise to add it to a client&apos;s training program.
          </p>
        </div>
        <button onClick={openNew} className="btn btn-primary">
          <PlusIcon size={16} /> New exercise
        </button>
      </header>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, muscle, equipment…"
            className="input pl-9"
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={filterCategory === "All"} onClick={() => setFilterCategory("All")}>
            All
          </FilterChip>
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c}
              active={filterCategory === c}
              onClick={() => setFilterCategory(c)}
            >
              {trCategory(c, locale)}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {Object.keys(grouped).length === 0 ? (
          <div className="empty-state">
            <DumbbellIcon size={28} className="text-ink-300" />
            <p className="mt-3 font-medium text-ink-700">No exercises match</p>
            <p className="mt-1 text-muted">Try a different search or filter.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([cat, list]) => (
            <section key={cat}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">{trCategory(cat, locale)}</h2>
                <span className="text-xs text-ink-400">({list.length})</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((ex) => (
                  <article
                    key={ex.id}
                    className="group rounded-xl bg-white p-4 ring-1 ring-ink-100 transition-all hover:-translate-y-0.5 hover:shadow-soft hover:ring-brand-200"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-ink-900">{trExerciseName(ex.name, locale)}</h3>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {ex.muscleGroup && <span className="chip chip-brand">{trMuscleGroup(ex.muscleGroup, locale)}</span>}
                          {ex.equipment && <span className="chip">{trEquipment(ex.equipment, locale)}</span>}
                        </div>
                        <p className="mt-2 text-xs text-ink-500">
                          {ex.defaultSets ?? "—"} × {ex.defaultReps || "—"} · rest{" "}
                          {ex.defaultRest || "—"}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => openEdit(ex)}
                          className="btn-icon"
                          aria-label="Edit"
                        >
                          <PencilIcon size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(ex.id)}
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
        <ExerciseForm
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

function ExerciseForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: Exercise | null;
  onClose: () => void;
  onSaved: (e: Exercise) => void;
}) {
  const locale = useLocale();
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "Push");
  const [muscleGroup, setMuscleGroup] = useState(initial?.muscleGroup ?? "");
  const [equipment, setEquipment] = useState(initial?.equipment ?? "");
  const [defaultSets, setDefaultSets] = useState<string>(
    initial?.defaultSets?.toString() ?? "3"
  );
  const [defaultReps, setDefaultReps] = useState(initial?.defaultReps ?? "8-10");
  const [defaultRest, setDefaultRest] = useState(initial?.defaultRest ?? "90s");
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
      muscleGroup: muscleGroup || null,
      equipment: equipment || null,
      defaultSets: defaultSets ? parseInt(defaultSets, 10) : null,
      defaultReps: defaultReps || null,
      defaultRest: defaultRest || null,
      notes: notes || null,
    };
    const url = initial ? `/api/exercises/${initial.id}` : "/api/exercises";
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
            <h2 className="h-section">{initial ? "Edit exercise" : "New exercise"}</h2>
            <p className="text-muted">Add to your library so you can pick it for any client.</p>
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
              placeholder="e.g. Barbell Bench Press"
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
              <label className="label">Equipment</label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="input mt-1"
              >
                <option value="">—</option>
                {EQUIPMENT.map((c) => (
                  <option key={c} value={c}>{trEquipment(c, locale)}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Muscle group</label>
            <input
              value={muscleGroup}
              onChange={(e) => setMuscleGroup(e.target.value)}
              className="input mt-1"
              placeholder="chest, back, quads..."
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Sets</label>
              <input
                type="number"
                min={1}
                value={defaultSets}
                onChange={(e) => setDefaultSets(e.target.value)}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="label">Reps</label>
              <input
                value={defaultReps}
                onChange={(e) => setDefaultReps(e.target.value)}
                className="input mt-1"
                placeholder="8-10"
              />
            </div>
            <div>
              <label className="label">Rest</label>
              <input
                value={defaultRest}
                onChange={(e) => setDefaultRest(e.target.value)}
                className="input mt-1"
                placeholder="90s"
              />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea
              rows={2}
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
              {saving ? "Saving…" : initial ? "Save changes" : "Add exercise"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
