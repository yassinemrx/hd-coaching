import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1).max(120).optional(),
  category: z.string().min(1).max(50).optional(),
  muscleGroup: z.string().max(50).optional().nullable(),
  equipment: z.string().max(50).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  defaultSets: z.coerce.number().int().min(1).max(50).optional().nullable(),
  defaultReps: z.string().max(50).optional().nullable(),
  defaultRest: z.string().max(50).optional().nullable(),
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
  const updated = await prisma.exerciseLibrary.update({
    where: { id: params.id },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.muscleGroup !== undefined && { muscleGroup: data.muscleGroup || null }),
      ...(data.equipment !== undefined && { equipment: data.equipment || null }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
      ...(data.defaultSets !== undefined && { defaultSets: data.defaultSets ?? null }),
      ...(data.defaultReps !== undefined && { defaultReps: data.defaultReps || null }),
      ...(data.defaultRest !== undefined && { defaultRest: data.defaultRest || null }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.exerciseLibrary.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
