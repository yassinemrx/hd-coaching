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
  DumbbellIcon,
  CheckIcon,
} from "@/components/Icon";
import { useDict, useLocale } from "@/components/I18nProvider";
import { trExerciseName, trCategory, trMuscleGroup, trEquipment } from "@/lib/i18n/dynamic";

type LibraryItem = {
  id: string;
  name: string;
  category: string;
  muscleGroup: string | null;
  equipment: string | null;
  defaultSets: number | null;
  defaultReps: string | null;
  defaultRest: string | null;
};

type Exercise = {
  libraryId: string | null;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes: string;
};

type Day = { dayLabel: string; exercises: Exercise[] };

type Initial = { title: string; notes: string; startDate: string; days: Day[] };

const EMPTY: Initial = {
  title: "",
  notes: "",
  startDate: "",
  days: [{ dayLabel: "Day 1", exercises: [] }],
};

export default function TrainingEditor({
  clientId,
  initial,
  library,
}: {
  clientId: string;
  initial: Initial | null;
  library: LibraryItem[];
}) {
  const router = useRouter();
  const locale = useLocale();
  const t = useDict();
  const [state, setState] = useState<Initial>(initial ?? EMPTY);
  const [pickerForDay, setPickerForDay] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);

  function patch(p: Partial<Initial>) {
    setState((s) => ({ ...s, ...p }));
  }

  function setDay(i: number, p: Partial<Day>) {
    setState((s) => ({
      ...s,
      days: s.days.map((d, idx) => (idx === i ? { ...d, ...p } : d)),
    }));
  }

  function addDay() {
    setState((s) => ({
      ...s,
      days: [...s.days, { dayLabel: `Day ${s.days.length + 1}`, exercises: [] }],
    }));
  }
  function removeDay(i: number) {
    setState((s) => ({ ...s, days: s.days.filter((_, idx) => idx !== i) }));
  }
  function moveDay(i: number, dir: -1 | 1) {
    setState((s) => {
      const arr = [...s.days];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return s;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...s, days: arr };
    });
  }

  function addExercise(dayIdx: number, lib: LibraryItem) {
    setState((s) => ({
      ...s,
      days: s.days.map((d, i) =>
        i === dayIdx
          ? {
              ...d,
              exercises: [
                ...d.exercises,
                {
                  libraryId: lib.id,
                  name: lib.name,
                  sets: lib.defaultSets ?? 3,
                  reps: lib.defaultReps ?? "8-10",
                  rest: lib.defaultRest ?? "90s",
                  notes: "",
                },
              ],
            }
          : d
      ),
    }));
  }

  function setExercise(di: number, ei: number, p: Partial<Exercise>) {
    setState((s) => ({
      ...s,
      days: s.days.map((d, idx) =>
        idx !== di
          ? d
          : {
              ...d,
              exercises: d.exercises.map((e, j) => (j === ei ? { ...e, ...p } : e)),
            }
      ),
    }));
  }
  function removeExercise(di: number, ei: number) {
    setState((s) => ({
      ...s,
      days: s.days.map((d, idx) =>
        idx === di ? { ...d, exercises: d.exercises.filter((_, j) => j !== ei) } : d
      ),
    }));
  }
  function moveExercise(di: number, ei: number, dir: -1 | 1) {
    setState((s) => ({
      ...s,
      days: s.days.map((d, idx) => {
        if (idx !== di) return d;
        const arr = [...d.exercises];
        const j = ei + dir;
        if (j < 0 || j >= arr.length) return d;
        [arr[ei], arr[j]] = [arr[j], arr[ei]];
        return { ...d, exercises: arr };
      }),
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);
    if (!state.title.trim()) return setError(t.admin.programTitleReq);
    for (const d of state.days) {
      if (!d.dayLabel.trim()) return setError(t.admin.dayLabelReq);
      for (const ex of d.exercises) {
        if (!ex.name.trim() || !ex.reps.trim() || ex.sets < 1)
          return setError(t.admin.exerciseFieldsReq);
      }
    }
    setSaving(true);
    const payload = {
      title: state.title,
      notes: state.notes || null,
      startDate: state.startDate
        ? new Date(state.startDate + "T00:00:00").toISOString()
        : null,
      days: state.days.map((d) => ({
        dayLabel: d.dayLabel,
        exercises: d.exercises.map((e) => ({
          libraryId: e.libraryId || null,
          name: e.name,
          sets: e.sets,
          reps: e.reps,
          rest: e.rest || null,
          notes: e.notes || null,
        })),
      })),
    };
    const res = await fetch(`/api/clients/${clientId}/training`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) return setError(t.admin.saveFailed);
    setOk(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-6 pb-24">
      <div className="card space-y-4">
        <div>
          <label className="label">{t.admin.programTitle}</label>
          <input
            required
            className="input mt-1"
            value={state.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder={t.admin.programTitlePh}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="label">{t.admin.startDate}</label>
            <input
              type="date"
              className="input mt-1"
              value={state.startDate}
              onChange={(e) => patch({ startDate: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="label">{t.admin.coachNotes}</label>
          <textarea
            rows={3}
            className="input mt-1"
            value={state.notes}
            onChange={(e) => patch({ notes: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-4">
        {state.days.map((day, di) => (
          <div key={di} className="card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <input
                className="input max-w-md"
                value={day.dayLabel}
                onChange={(e) => setDay(di, { dayLabel: e.target.value })}
                placeholder={t.admin.dayLabelPh}
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => moveDay(di, -1)} className="btn btn-secondary px-3" aria-label={t.admin.moveUp}>
                  <ArrowUpIcon size={16} />
                </button>
                <button type="button" onClick={() => moveDay(di, 1)} className="btn btn-secondary px-3" aria-label={t.admin.moveDown}>
                  <ArrowDownIcon size={16} />
                </button>
                <button type="button" onClick={() => removeDay(di)} className="btn btn-danger">
                  {t.admin.removeDay}
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {day.exercises.length === 0 && (
                <div className="empty-state py-6">
                  <DumbbellIcon size={22} className="text-ink-300" />
                  <p className="mt-2 text-sm text-ink-600">{t.admin.noExercisesYet}</p>
                </div>
              )}
              {day.exercises.map((ex, ei) => (
                <div key={ei} className="rounded-lg border border-ink-200 bg-white p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink-900">{trExerciseName(ex.name, locale)}</span>
                        {ex.libraryId ? (
                          <span className="chip chip-brand">{t.admin.fromLibrary}</span>
                        ) : (
                          <span className="chip">{t.admin.custom}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button type="button" onClick={() => moveExercise(di, ei, -1)} className="btn-icon" aria-label={t.admin.moveUp}>
                        <ArrowUpIcon size={14} />
                      </button>
                      <button type="button" onClick={() => moveExercise(di, ei, 1)} className="btn-icon" aria-label={t.admin.moveDown}>
                        <ArrowDownIcon size={14} />
                      </button>
                      <button type="button" onClick={() => removeExercise(di, ei)} className="btn-icon hover:text-red-600" aria-label={t.admin.remove}>
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div>
                      <label className="label">{t.admin.setsLabel}</label>
                      <input
                        type="number"
                        min={1}
                        value={ex.sets}
                        onChange={(e) => setExercise(di, ei, { sets: parseInt(e.target.value || "1", 10) })}
                        className="input mt-1"
                      />
                    </div>
                    <div>
                      <label className="label">{t.admin.repsLabel}</label>
                      <input
                        value={ex.reps}
                        onChange={(e) => setExercise(di, ei, { reps: e.target.value })}
                        className="input mt-1"
                        placeholder="8-10"
                      />
                    </div>
                    <div>
                      <label className="label">{t.admin.restLabel}</label>
                      <input
                        value={ex.rest}
                        onChange={(e) => setExercise(di, ei, { rest: e.target.value })}
                        className="input mt-1"
                        placeholder="90s"
                      />
                    </div>
                    <div>
                      <label className="label">{t.admin.notesLabel}</label>
                      <input
                        value={ex.notes}
                        onChange={(e) => setExercise(di, ei, { notes: e.target.value })}
                        className="input mt-1"
                        placeholder={t.admin.optional}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setPickerForDay(di)}
                className="btn btn-secondary w-full sm:w-auto"
              >
                <PlusIcon size={16} /> {t.admin.addExerciseFromLib}
              </button>
            </div>
          </div>
        ))}
        <button type="button" onClick={addDay} className="btn btn-secondary">
          <PlusIcon size={16} /> {t.admin.addDay}
        </button>
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {ok && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{t.admin.saved}</p>}

      <div className="fixed bottom-4 left-0 right-0 z-30 flex justify-center px-4">
        <button type="submit" className="btn btn-primary shadow-glow" disabled={saving}>
          <CheckIcon size={16} />
          {saving ? t.admin.savingDots : t.admin.saveProgram}
        </button>
      </div>

      {pickerForDay !== null && (
        <ExercisePicker
          library={library}
          onClose={() => setPickerForDay(null)}
          onPick={(lib) => {
            addExercise(pickerForDay, lib);
          }}
        />
      )}
    </form>
  );
}

function ExercisePicker({
  library,
  onClose,
  onPick,
}: {
  library: LibraryItem[];
  onClose: () => void;
  onPick: (l: LibraryItem) => void;
}) {
  const locale = useLocale();
  const t = useDict();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const categories = useMemo(() => {
    const set = new Set(library.map((l) => l.category));
    return ["All", ...Array.from(set)];
  }, [library]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return library.filter(
      (l) =>
        (filter === "All" || l.category === filter) &&
        (q === "" ||
          l.name.toLowerCase().includes(q) ||
          (l.muscleGroup ?? "").toLowerCase().includes(q) ||
          (l.equipment ?? "").toLowerCase().includes(q))
    );
  }, [library, search, filter]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 backdrop-blur-sm sm:items-center">
      <div className="flex h-[85vh] w-full max-w-2xl flex-col animate-slide-in rounded-t-2xl bg-white shadow-soft sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-ink-100 p-4">
          <div>
            <h2 className="h-section">{t.admin.exerciseLibraryTitle}</h2>
            <p className="text-xs text-ink-500">{t.admin.tapAnyExercise}</p>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label={t.common.close}>
            <CloseIcon />
          </button>
        </div>
        <div className="space-y-3 p-4">
          <label className="relative block">
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.admin.searchExercisesShort}
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
                {c === "All" ? t.admin.all : trCategory(c, locale)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-400">{t.admin.noMatches}</p>
          ) : (
            <ul className="space-y-2">
              {filtered.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onPick(l);
                    }}
                    className="flex w-full items-center justify-between rounded-lg border border-ink-100 p-3 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/30"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-ink-900">{trExerciseName(l.name, locale)}</div>
                      <div className="mt-0.5 flex flex-wrap gap-1">
                        <span className="chip">{trCategory(l.category, locale)}</span>
                        {l.muscleGroup && <span className="chip chip-brand">{trMuscleGroup(l.muscleGroup, locale)}</span>}
                        {l.equipment && <span className="chip">{trEquipment(l.equipment, locale)}</span>}
                      </div>
                    </div>
                    <span className="text-xs text-ink-400">
                      {l.defaultSets ?? "—"} × {l.defaultReps || "—"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
