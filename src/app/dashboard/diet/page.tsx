import { requireClient } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SaladIcon } from "@/components/Icon";
import { getDict } from "@/lib/i18n/server";
import { emptyTotals, scaleNutrition, sumNutrition, type NutritionTotals } from "@/lib/nutrition";
import DailyTotalBar from "./DailyTotalBar";
import MealCard, { type MealItem } from "./MealCard";

export const metadata = { title: "Diet — HD Coaching" };
export const dynamic = "force-dynamic";

export default async function DietPage() {
  const [user, t] = await Promise.all([requireClient(), getDict()]);
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
        <p className="mt-3 font-medium text-ink-700">{t.diet.noPlan}</p>
        <p className="mt-1 text-muted">{t.diet.noPlanSub}</p>
      </div>
    );
  }

  const mealRows = plan.meals.map((m) => {
    const itemTotals: NutritionTotals[] = [];
    const items: MealItem[] = m.items.map((it) => {
      if (it.food) itemTotals.push(scaleNutrition(it.food, it.quantity));
      return {
        id: it.id,
        quantity: it.quantity,
        unit: it.unit,
        customName: it.customName,
        food: it.food
          ? { id: it.food.id, name: it.food.name, imageUrl: it.food.imageUrl }
          : null,
      };
    });
    const totals = itemTotals.length > 0 ? sumNutrition(itemTotals) : emptyTotals();
    const firstImage = m.items.find((it) => it.food?.imageUrl)?.food?.imageUrl ?? null;
    return {
      meal: {
        id: m.id,
        name: m.name,
        time: m.time,
        notes: m.notes,
        imageUrl: m.imageUrl,
        items,
      },
      totals,
      firstImage,
    };
  });

  const dayTotals = sumNutrition(mealRows.map((r) => r.totals));
  const target = plan.macros
    ? {
        calories: plan.macros.calories,
        protein: plan.macros.protein,
        carbs: plan.macros.carbs,
        fat: plan.macros.fat,
      }
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
          {t.diet.yourPlan}
        </p>
        <h1 className="mt-1 h-page">{plan.title}</h1>
        {plan.notes && (
          <p className="mt-2 whitespace-pre-line text-sm text-ink-600">{plan.notes}</p>
        )}
      </header>

      <DailyTotalBar
        totals={{
          calories: dayTotals.calories,
          protein: dayTotals.protein,
          carbs: dayTotals.carbs,
          fat: dayTotals.fat,
        }}
        target={target}
      />

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink-500">
          {t.diet.meals}
        </h2>
        <div className="space-y-4">
          {mealRows.map((r) => (
            <MealCard
              key={r.meal.id}
              meal={r.meal}
              totals={r.totals}
              firstImage={r.firstImage}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
