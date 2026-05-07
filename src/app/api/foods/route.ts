import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1).max(120),
  category: z.string().min(1).max(50),
  unit: z.string().min(1).max(20),
  perAmount: z.coerce.number().positive().max(100000),
  calories: z.coerce.number().min(0).max(100000),
  protein: z.coerce.number().min(0).max(10000),
  carbs: z.coerce.number().min(0).max(10000),
  fat: z.coerce.number().min(0).max(10000),
  notes: z.string().max(500).optional().nullable(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const food = await prisma.food.create({
    data: {
      ...parsed.data,
      name: parsed.data.name.trim(),
      notes: parsed.data.notes || null,
    },
  });
  return NextResponse.json(food, { status: 201 });
}
