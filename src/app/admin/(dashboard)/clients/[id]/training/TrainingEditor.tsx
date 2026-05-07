"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Exercise = {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes: string;
};

type Day = { dayLabel: string; exercises: Exercise[] };

type Initial = {
  title: string;
  notes: string;
  startDate: string;
  days: Day[];
};

const EMPTY_EXERCISE: Exercise = {
  name: "",
  sets: 3,
  reps: "8-10",
  rest: "90s",
  notes: "",
};

const EMPTY: Initial = {
  title: "",
  notes: "",
  startDate: "",
  days: [{ dayLabel: "Day 1", exercises: [{ ...EMPTY_EXERCISE }] }],
};

export default function TrainingEditor({
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

  function patch(p: Partial<Initial>) {
    setState((s) => ({ ...s, ...p }));
  }

  function setDay(i: number, patch: Partial<Day>) {
    setState((s) => ({
      ...s,
      days: s.days.map((d, idx) => (idx === i ? { ...d, ...patch } : d)),
    }));
  }

  function addDay() {
    setState((s) => ({
      ...s,
      days: [
        ...s.days,
        { dayLabel: `Day ${s.days.length + 1}`, exercises: [{ ...EMPTY_EXERCISE }] },
      ],
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

  function setExercise(di: number, ei: number, patch: Partial<Exercise>) {
    setState((s) => ({
      ...s,
      days: s.days.map((d, idx) =>
        idx !== di
          ? d
          : {
              ...d,
              exercises: d.exercises.map((e, j) =>
                j === ei ? { ...e, ...patch } : e
              ),
            }
      ),
    }));
  }

  function addExercise(di: number) {
    setState((s) => ({
      ...s,
      days: s.days.map((d, idx) =>
        idx === di ? { ...d, exercises: [...d.exercises, { ...EMPTY_EXERCISE }] } : d
      ),
    }));
  }

  function removeExercise(di: number, ei: number) {
    setState((s) => ({
      ...s,
      days: s.days.map((d, idx) =>
        idx === di
          ? { ...d, exercises: d.exercises.filter((_, j) => j !== ei) }
          : d
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
    if (!state.title.trim()) {
      setError("Program title is required.");
      return;
    }
    for (const d of state.days) {
      if (!d.dayLabel.trim()) {
        setError("Each day needs a label.");
        return;
      }
      for (const ex of d.exercises) {
        if (!ex.name.trim() || !ex.reps.trim() || ex.sets < 1) {
          setError("Each exercise needs a name, sets ≥ 1, and a reps value.");
          return;
        }
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
          <label className="label" htmlFor="title">Program title</label>
          <input
            id="title"
            required
            className="input mt-1"
            value={state.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="e.g. Push / Pull / Legs — 5 weeks"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="startDate">Start date</label>
            <input
              id="startDate"
              type="date"
              className="input mt-1"
              value={state.startDate}
              onChange={(e) => patch({ startDate: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="notes">Coach notes</label>
          <textarea
            id="notes"
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
            <div className="flex items-start justify-between gap-3">
              <input
                className="input max-w-md"
                value={day.dayLabel}
                onChange={(e) => setDay(di, { dayLabel: e.target.value })}
                placeholder="Monday — Push"
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => moveDay(di, -1)} className="btn btn-secondary">↑</button>
                <button type="button" onClick={() => moveDay(di, 1)} className="btn btn-secondary">↓</button>
                <button type="button" onClick={() => removeDay(di)} className="btn btn-danger">Remove day</button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {day.exercises.map((ex, ei) => (
                <div
                  key={ei}
                  className="grid grid-cols-12 items-end gap-2 rounded-md border border-slate-200 p-2"
                >
                  <div className="col-span-12 sm:col-span-4">
                    <label className="label">Exercise</label>
                    <input
                      className="input mt-1"
                      value={ex.name}
                      onChange={(e) => setExercise(di, ei, { name: e.target.value })}
                      placeholder="Bench press"
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-1">
                    <label className="label">Sets</label>
                    <input
                      type="number"
                      min={1}
                      className="input mt-1"
                      value={ex.sets}
                      onChange={(e) =>
                        setExercise(di, ei, { sets: parseInt(e.target.value || "1", 10) })
                      }
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <label className="label">Reps</label>
                    <input
                      className="input mt-1"
                      value={ex.reps}
                      onChange={(e) => setExercise(di, ei, { reps: e.target.value })}
                      placeholder="8-10"
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-2">
                    <label className="label">Rest</label>
                    <input
                      className="input mt-1"
                      value={ex.rest}
                      onChange={(e) => setExercise(di, ei, { rest: e.target.value })}
                      placeholder="90s"
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-2">
                    <label className="label">Notes</label>
                    <input
                      className="input mt-1"
                      value={ex.notes}
                      onChange={(e) => setExercise(di, ei, { notes: e.target.value })}
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-1 flex items-end gap-1">
                    <button
                      type="button"
                      onClick={() => moveExercise(di, ei, -1)}
                      className="btn btn-secondary px-2"
                    >↑</button>
                    <button
                      type="button"
                      onClick={() => moveExercise(di, ei, 1)}
                      className="btn btn-secondary px-2"
                    >↓</button>
                    <button
                      type="button"
                      onClick={() => removeExercise(di, ei)}
                      className="btn btn-danger px-2"
                    >×</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => addExercise(di)} className="btn btn-secondary">
                + Add exercise
              </button>
            </div>
          </div>
        ))}
        <button type="button" onClick={addDay} className="btn btn-secondary">
          + Add day
        </button>
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {ok && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">Saved.</p>}

      <div className="sticky bottom-4 flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : "Save program"}
        </button>
      </div>
    </form>
  );
}
