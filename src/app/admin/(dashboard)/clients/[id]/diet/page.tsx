import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DietEditor from "./DietEditor";

export const metadata = { title: "Diet editor — Admin" };

export default async function DietEditorPage({ params }: { params: { id: string } }) {
  const client = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, role: true },
  });
  if (!client || client.role !== "USER") notFound();

  const plan = await prisma.dietPlan.findUnique({
    where: { userId: client.id },
    include: { macros: true, meals: { orderBy: { order: "asc" } } },
  });

  return (
    <div className="max-w-3xl">
      <Link
        href={`/admin/clients/${client.id}`}
        className="text-sm text-brand-700 hover:underline"
      >
        ← Back to {client.name}
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Diet plan</h1>
      <p className="mt-1 text-sm text-slate-500">
        Set targets and meals for {client.name}.
      </p>
      <DietEditor
        clientId={client.id}
        initial={
          plan
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
                  foods: m.foods,
                })),
              }
            : null
        }
      />
    </div>
  );
}
