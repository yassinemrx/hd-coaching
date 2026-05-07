import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DietEditor from "./DietEditor";
import { getDict } from "@/lib/i18n/server";

export const metadata = { title: "Diet editor — Admin" };
export const dynamic = "force-dynamic";

export default async function DietEditorPage({ params }: { params: { id: string } }) {
  const [client, t] = await Promise.all([
    prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, role: true },
    }),
    getDict(),
  ]);
  if (!client || client.role !== "USER") notFound();

  const [plan, foods] = await Promise.all([
    prisma.dietPlan.findUnique({
      where: { userId: client.id },
      include: {
        macros: true,
        meals: {
          orderBy: { order: "asc" },
          include: { items: { orderBy: { order: "asc" } } },
        },
      },
    }),
    prisma.food.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }),
  ]);

  const initial = plan
    ? {
        title: plan.title,
        notes: plan.notes ?? "",
        macros: plan.macros
          ? {
              calories: plan.macros.calories,
              protein: plan.macros.protein,
              carbs: plan.macros.carbs,
              fat: plan.macros.fat,
            }
          : { calories: 2000, protein: 150, carbs: 200, fat: 60 },
        meals: plan.meals.map((m) => ({
          name: m.name,
          time: m.time,
          notes: m.notes ?? "",
          items: m.items.map((it) => ({
            foodId: it.foodId,
            customName: it.customName,
            quantity: it.quantity,
            unit: it.unit,
          })),
        })),
      }
    : null;

  return (
    <div className="animate-fade-in">
      <Link
        href={`/admin/clients/${client.id}`}
        className="text-sm font-medium text-brand-700 hover:text-brand-600"
      >
        {t.admin.backToClient.replace("{name}", client.name)}
      </Link>
      <div className="mt-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">{t.admin.dietPlanLabel}</p>
        <h1 className="mt-1 h-page">{client.name}</h1>
        <p className="mt-1 text-muted">{t.admin.buildMeals}</p>
      </div>
      <DietEditor
        clientId={client.id}
        initial={initial}
        foods={foods.map((f) => ({
          id: f.id,
          name: f.name,
          category: f.category,
          unit: f.unit,
          perAmount: f.perAmount,
          calories: f.calories,
          protein: f.protein,
          carbs: f.carbs,
          fat: f.fat,
        }))}
      />
    </div>
  );
}
