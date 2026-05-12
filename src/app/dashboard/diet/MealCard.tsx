"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import Image from "next/image";
import { useDict } from "@/components/I18nProvider";
import { useLocale } from "@/components/I18nProvider";
import { trFoodName, trUnit } from "@/lib/i18n/dynamic";
import { SaladIcon, ChevronDownIcon } from "@/components/Icon";
import {
  NUTRIENT_GROUPS,
  NUTRIENT_UNITS,
  allZero,
  dailyValuePercent,
  fmtNutrient,
  type NutrientKey,
  type NutritionTotals,
} from "@/lib/nutrition";

export type MealItem = {
  id: string;
  quantity: number;
  unit: string;
  customName: string | null;
  food: {
    id: string;
    name: string;
    imageUrl: string | null;
  } | null;
};

export type MealCardProps = {
  meal: {
    id: string;
    name: string;
    time: string;
    notes: string | null;
    imageUrl: string | null;
    items: MealItem[];
  };
  totals: NutritionTotals;
  firstImage: string | null;
};

export default function MealCard({ meal, totals, firstImage }: MealCardProps) {
  const t = useDict();
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  const banner = meal.imageUrl || firstImage;
  const macroData = [
    { name: t.nutrition.carbs, value: Math.max(0, totals.carbs), color: "#f59e0b" },
    { name: t.nutrition.protein, value: Math.max(0, totals.protein), color: "#a78bfa" },
    { name: t.nutrition.fat, value: Math.max(0, totals.fat), color: "#60a5fa" },
  ];
  const macroSum = macroData.reduce((s, m) => s + m.value, 0);

  return (
    <article className="card overflow-hidden p-0">
      <div className="relative h-44 w-full overflow-hidden bg-ink-100 sm:h-56">
        {banner ? (
          <Image
            src={banner}
            alt={meal.name}
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-ink-300">
            <SaladIcon size={42} />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-10">
          <div className="flex items-end justify-between gap-2">
            <h3 className="font-display text-lg font-semibold text-white drop-shadow">{meal.name}</h3>
            <span className="chip border-white/30 bg-black/40 text-white">{meal.time}</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {meal.notes && (
          <p className="mb-4 whitespace-pre-line text-sm text-ink-600">{meal.notes}</p>
        )}

        <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[140px_1fr]">
          <div className="relative mx-auto h-32 w-32">
            {macroSum > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroData}
                    dataKey="value"
                    innerRadius={42}
                    outerRadius={60}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {macroData.map((m) => (
                      <Cell key={m.name} fill={m.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full w-full place-items-center rounded-full border border-ink-200 text-ink-400">
                —
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="font-display text-xl font-bold leading-none text-ink-900">
                  {Math.round(totals.calories)}
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wide text-ink-500">
                  {t.nutrition.kcal}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <MacroPill color="bg-amber-400/20 text-amber-300" label={t.nutrition.carbs} value={totals.carbs} />
            <MacroPill color="bg-purple-400/20 text-purple-300" label={t.nutrition.protein} value={totals.protein} />
            <MacroPill color="bg-blue-400/20 text-blue-300" label={t.nutrition.fat} value={totals.fat} />
          </div>
        </div>

        {meal.items.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-500">
              {t.diet.ingredients}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {meal.items.map((it) => {
                const label = it.food ? trFoodName(it.food.name, locale) : it.customName || "Item";
                return (
                  <div key={it.id} className="card-tight flex items-center gap-2 p-2">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-ink-100">
                      {it.food?.imageUrl ? (
                        <Image
                          src={it.food.imageUrl}
                          alt={label}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-ink-300">
                          <SaladIcon size={20} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-800">{label}</p>
                      <p className="text-xs text-ink-500">
                        {it.quantity} {trUnit(it.unit, locale)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {meal.items.length === 0 && (
          <p className="mt-3 text-sm text-ink-400">{t.diet.noItems}</p>
        )}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-50"
        >
          {open ? t.diet.hideNutrition : t.diet.viewFullNutrition}
          <ChevronDownIcon
            size={16}
            className={"transition-transform " + (open ? "rotate-180" : "")}
          />
        </button>

        {open && <DetailedNutrition totals={totals} />}
      </div>
    </article>
  );
}

function MacroPill({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div className={"rounded-lg px-2 py-2 " + color}>
      <p className="text-[10px] uppercase tracking-wide opacity-80">{label}</p>
      <p className="font-display text-lg font-bold">{value.toFixed(0)}<span className="ml-0.5 text-xs font-medium opacity-80">g</span></p>
    </div>
  );
}

function DetailedNutrition({ totals }: { totals: NutritionTotals }) {
  const t = useDict();

  const sections: { title: string; keys: readonly NutrientKey[] }[] = [
    { title: t.diet.vitaminsAndMinerals, keys: NUTRIENT_GROUPS.vitaminsMinerals },
    { title: t.diet.sugars, keys: NUTRIENT_GROUPS.sugars },
    { title: t.diet.fatBreakdown, keys: NUTRIENT_GROUPS.fats },
    { title: t.diet.fattyAcids, keys: NUTRIENT_GROUPS.fattyAcids },
    { title: t.diet.aminoAcids, keys: NUTRIENT_GROUPS.aminoAcids },
  ].filter((s) => !allZero(totals, s.keys));

  if (sections.length === 0) {
    return (
      <p className="mt-4 rounded-lg border border-dashed border-ink-200 px-3 py-4 text-center text-xs text-ink-400">
        {t.diet.noItems}
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {sections.map((s) => (
        <NutrientSection key={s.title} title={s.title} keys={s.keys} totals={totals} />
      ))}
    </div>
  );
}

function NutrientSection({
  title,
  keys,
  totals,
}: {
  title: string;
  keys: readonly NutrientKey[];
  totals: NutritionTotals;
}) {
  const t = useDict();
  const visible = keys.filter((k) => (totals[k] ?? 0) > 0);
  if (visible.length === 0) return null;

  return (
    <section>
      <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-600">
        {title}
      </h4>
      <div className="overflow-hidden rounded-lg border border-ink-200">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-3 py-2 text-start font-medium">{t.diet.nutrient}</th>
              <th className="px-3 py-2 text-end font-medium">{t.diet.amount}</th>
              <th className="px-3 py-2 text-end font-medium">{t.diet.dailyValue}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((k, i) => {
              const amount = totals[k];
              const dv = dailyValuePercent(k, amount);
              return (
                <tr key={k} className={i % 2 === 0 ? "" : "bg-ink-50/50"}>
                  <td className="px-3 py-1.5 text-ink-800">
                    {(t.nutrients as Record<string, string>)[k] ?? k}
                  </td>
                  <td className="px-3 py-1.5 text-end font-medium text-ink-700">
                    {fmtNutrient(amount)} {NUTRIENT_UNITS[k]}
                  </td>
                  <td className="px-3 py-1.5 text-end text-ink-500">
                    {dv != null ? `${dv}%` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
