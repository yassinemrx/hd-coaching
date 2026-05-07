import { requireClient } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { FlameIcon, SaladIcon } from "@/components/Icon";

export const metadata = { title: "Diet — HD Coaching" };
export const dynamic = "force-dynamic";

export default async function DietPage() {
  const user = await requireClient();
  const plan = await prisma.dietPlan.findUnique({
    where: { userId: user.id },
    include: {
      macros: true,
      meals: {
        orderBy: { order: "asc" },
        include: {
          items: {
            orderBy: { order: "asc" },
            include: { food: true },
          },
        },
      },
    },
  });

  if (!plan) {
    return (
      <div className="empty-state">
        <SaladIcon size={28} className="text-ink-300" />
        <p className="mt-3 font-medium text-ink-700">No diet plan yet</p>
        <p className="mt-1 text-muted">Your coach hasn&apos;t assigned a diet plan. Check back soon.</p>
      </div>
    );
  }

  function macrosFor(item: { quantity: number; food: { perAmount: number; calories: number; protein: number; carbs: number; fat: number } | null }) {
    if (!item.food || !item.food.perAmount) return { cal: 0, p: 0, c: 0, f: 0 };
    const factor = item.quantity / item.food.perAmount;
    return {
      cal: item.food.calories * factor,
      p: item.food.protein * factor,
      c: item.food.carbs * factor,
      f: item.food.fat * factor,
    };
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Your plan</p>
        <h1 className="mt-1 h-page">{plan.title}</h1>
        {plan.notes && (
          <p className="mt-2 whitespace-pre-line text-sm text-ink-600">{plan.notes}</p>
        )}
      </header>

      {plan.macros && (
        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink-500">
            Daily targets
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MacroCard label="Calories" value={plan.macros.calories} unit="kcal" accent="bg-amber-50 text-amber-700" />
            <MacroCard label="Protein" value={plan.macros.protein} unit="g" accent="bg-blue-50 text-blue-700" />
            <MacroCard label="Carbs" value={plan.macros.carbs} unit="g" accent="bg-purple-50 text-purple-700" />
            <MacroCard label="Fat" value={plan.macros.fat} unit="g" accent="bg-pink-50 text-pink-700" />
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink-500">Meals</h2>
        <div className="space-y-3">
          {plan.meals.map((m) => {
            const totals = m.items.reduce(
              (acc, it) => {
                const q = macrosFor(it);
                return { cal: acc.cal + q.cal, p: acc.p + q.p, c: acc.c + q.c, f: acc.f + q.f };
              },
              { cal: 0, p: 0, c: 0, f: 0 }
            );
            return (
              <article key={m.id} className="card">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-ink-900">{m.name}</h3>
                  <span className="chip">{m.time}</span>
                </div>
                {m.notes && <p className="mt-2 text-sm text-ink-600">{m.notes}</p>}

                <ul className="mt-4 divide-y divide-ink-100">
                  {m.items.length === 0 && (
                    <li className="py-2 text-sm text-ink-400">No items.</li>
                  )}
                  {m.items.map((it) => {
                    const q = macrosFor(it);
                    return (
                      <li key={it.id} className="flex items-center justify-between py-2">
                        <div className="min-w-0">
                          <p className="font-medium text-ink-800">
                            {it.food ? it.food.name : it.customName || "Item"}
                          </p>
                          <p className="text-xs text-ink-500">
                            {Math.round(q.cal)} kcal · P {q.p.toFixed(1)} · C {q.c.toFixed(1)} · F {q.f.toFixed(1)}
                          </p>
                        </div>
                        <span className="ml-3 shrink-0 text-sm font-semibold text-ink-700">
                          {it.quantity} {it.unit}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {m.items.length > 0 && (
                  <div className="mt-3 flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2 text-xs">
                    <span className="font-medium text-ink-600">Meal total</span>
                    <span className="font-semibold text-ink-900">
                      {Math.round(totals.cal)} kcal · P {totals.p.toFixed(0)} · C {totals.c.toFixed(0)} · F {totals.f.toFixed(0)}
                    </span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function MacroCard({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: number;
  unit: string;
  accent: string;
}) {
  return (
    <div className="card-tight">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
        <span className={`grid h-7 w-7 place-items-center rounded-md ${accent}`}>
          <FlameIcon size={14} />
        </span>
      </div>
      <p className="mt-2 font-display text-2xl font-bold text-ink-900">
        {value}
        <span className="ml-1 text-sm font-medium text-ink-400">{unit}</span>
      </p>
    </div>
  );
}
