"use client";

import { useDict } from "@/components/I18nProvider";

type Macros = { calories: number; protein: number; carbs: number; fat: number };

export default function DailyTotalBar({
  totals,
  target,
}: {
  totals: Macros;
  target: Macros | null;
}) {
  const t = useDict();

  if (!target) {
    return (
      <section className="card">
        <h2 className="h-section">{t.diet.dailyTotal}</h2>
        <p className="mt-2 text-sm text-ink-500">
          {Math.round(totals.calories)} {t.nutrition.kcal} · P {totals.protein.toFixed(0)} · C{" "}
          {totals.carbs.toFixed(0)} · F {totals.fat.toFixed(0)}
        </p>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="flex items-baseline justify-between">
        <h2 className="h-section">{t.diet.dailyTotal}</h2>
        <span className="text-sm text-ink-500">
          {Math.round(totals.calories)} / {target.calories} {t.nutrition.kcal}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MacroBar
          label={t.nutrition.carbs}
          value={totals.carbs}
          target={target.carbs}
          color="bg-amber-400"
        />
        <MacroBar
          label={t.nutrition.protein}
          value={totals.protein}
          target={target.protein}
          color="bg-purple-400"
        />
        <MacroBar
          label={t.nutrition.fat}
          value={totals.fat}
          target={target.fat}
          color="bg-blue-400"
        />
      </div>
    </section>
  );
}

function MacroBar({
  label,
  value,
  target,
  color,
}: {
  label: string;
  value: number;
  target: number;
  color: string;
}) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  const over = target > 0 && value > target;
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium uppercase tracking-wide text-ink-500">{label}</span>
        <span className={"font-medium " + (over ? "text-red-400" : "text-ink-700")}>
          {Math.round(value)} g / {target} g
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-ink-100">
        <div
          className={"h-full transition-all " + (over ? "bg-red-500" : color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
