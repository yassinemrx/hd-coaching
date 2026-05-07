import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1).max(120),
  category: z.string().min(1).max(50),
  muscleGroup: z.string().max(50).optional().nullable(),
  equipment: z.string().max(50).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  defaultSets: z.coerce.number().int().min(1).max(50).optional().nullable(),
  defaultReps: z.string().max(50).optional().nullable(),
  defaultRest: z.string().max(50).optional().nullable(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const ex = await prisma.exerciseLibrary.create({
    data: {
      name: parsed.data.name.trim(),
      category: parsed.data.category,
      muscleGroup: parsed.data.muscleGroup || null,
      equipment: parsed.data.equipment || null,
      notes: parsed.data.notes || null,
      defaultSets: parsed.data.defaultSets ?? null,
      defaultReps: parsed.data.defaultReps || null,
      defaultRest: parsed.data.defaultRest || null,
    },
  });
  return NextResponse.json(ex, { status: 201 });
}
