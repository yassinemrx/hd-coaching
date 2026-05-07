import { requireClient } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Diet — HD Coaching" };
export const dynamic = "force-dynamic";

export default async function DietPage() {
  const user = await requireClient();
  const plan = await prisma.dietPlan.findUnique({
    where: { userId: user.id },
    include: { macros: true, meals: { orderBy: { order: "asc" } } },
  });

  if (!plan) {
    return (
      <div className="card">
        <h1 className="text-xl font-semibold">No diet plan yet</h1>
        <p className="mt-2 text-sm text-slate-500">
          Your coach hasn&apos;t assigned a diet plan. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">{plan.title}</h1>
        {plan.notes && (
          <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{plan.notes}</p>
        )}
      </header>

      {plan.macros && (
        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">
            Daily targets
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MacroCard label="Calories" value={plan.macros.calories} unit="kcal" />
            <MacroCard label="Protein" value={plan.macros.protein} unit="g" />
            <MacroCard label="Carbs" value={plan.macros.carbs} unit="g" />
            <MacroCard label="Fat" value={plan.macros.fat} unit="g" />
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">
          Meals
        </h2>
        <div className="space-y-3">
          {plan.meals.map((m) => (
            <article key={m.id} className="card">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">{m.name}</h3>
                <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-600">
                  {m.time}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
                {m.foods}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function MacroCard({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
        <span className="ml-1 text-sm font-medium text-slate-400">{unit}</span>
      </p>
    </div>
  );
}
