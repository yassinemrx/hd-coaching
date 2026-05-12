import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { foodUpdateSchema, EXTENDED_FIELDS } from "@/lib/foodSchema";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const json = await req.json().catch(() => null);
  const parsed = foodUpdateSchema.safeParse(json);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data;
  const update: Record<string, unknown> = {};

  if (data.name !== undefined) update.name = data.name.trim();
  if (data.category !== undefined) update.category = data.category;
  if (data.unit !== undefined) update.unit = data.unit;
  if (data.perAmount !== undefined) update.perAmount = data.perAmount;
  if (data.imageUrl !== undefined) update.imageUrl = data.imageUrl || null;
  if (data.calories !== undefined) update.calories = data.calories;
  if (data.protein !== undefined) update.protein = data.protein;
  if (data.carbs !== undefined) update.carbs = data.carbs;
  if (data.fat !== undefined) update.fat = data.fat;
  if (data.notes !== undefined) update.notes = data.notes || null;

  for (const field of EXTENDED_FIELDS) {
    if ((data as Record<string, unknown>)[field] !== undefined) {
      update[field] = (data as Record<string, unknown>)[field];
    }
  }

  const updated = await prisma.food.update({
    where: { id: params.id },
    data: update,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.food.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
