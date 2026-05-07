import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const mealSchema = z.object({
  name: z.string().min(1).max(100),
  time: z.string().min(1).max(20),
  foods: z.string().max(2000),
});

const schema = z.object({
  title: z.string().min(1).max(200),
  notes: z.string().max(2000).optional().nullable(),
  macros: z.object({
    calories: z.coerce.number().int().min(0).max(20000),
    protein: z.coerce.number().int().min(0).max(2000),
    carbs: z.coerce.number().int().min(0).max(2000),
    fat: z.coerce.number().int().min(0).max(2000),
  }),
  meals: z.array(mealSchema).max(20),
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target || target.role !== "USER") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, notes, macros, meals } = parsed.data;

  const plan = await prisma.$transaction(async (tx) => {
    const existing = await tx.dietPlan.findUnique({ where: { userId: params.id } });
    if (existing) {
      await tx.meal.deleteMany({ where: { dietPlanId: existing.id } });
      await tx.macroTarget.deleteMany({ where: { dietPlanId: existing.id } });
      return tx.dietPlan.update({
        where: { id: existing.id },
        data: {
          title,
          notes: notes ?? null,
          macros: { create: macros },
          meals: {
            create: meals.map((m, i) => ({ ...m, order: i })),
          },
        },
        include: { macros: true, meals: { orderBy: { order: "asc" } } },
      });
    }
    return tx.dietPlan.create({
      data: {
        userId: params.id,
        title,
        notes: notes ?? null,
        macros: { create: macros },
        meals: { create: meals.map((m, i) => ({ ...m, order: i })) },
      },
      include: { macros: true, meals: { orderBy: { order: "asc" } } },
    });
  });

  return NextResponse.json(plan);
}
