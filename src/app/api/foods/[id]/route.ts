import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1).max(120).optional(),
  category: z.string().min(1).max(50).optional(),
  unit: z.string().min(1).max(20).optional(),
  perAmount: z.coerce.number().positive().max(100000).optional(),
  calories: z.coerce.number().min(0).max(100000).optional(),
  protein: z.coerce.number().min(0).max(10000).optional(),
  carbs: z.coerce.number().min(0).max(10000).optional(),
  fat: z.coerce.number().min(0).max(10000).optional(),
  notes: z.string().max(500).optional().nullable(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data;
  const updated = await prisma.food.update({
    where: { id: params.id },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.unit !== undefined && { unit: data.unit }),
      ...(data.perAmount !== undefined && { perAmount: data.perAmount }),
      ...(data.calories !== undefined && { calories: data.calories }),
      ...(data.protein !== undefined && { protein: data.protein }),
      ...(data.carbs !== undefined && { carbs: data.carbs }),
      ...(data.fat !== undefined && { fat: data.fat }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
    },
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
