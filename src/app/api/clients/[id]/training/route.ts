import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const exerciseSchema = z.object({
  name: z.string().min(1).max(100),
  sets: z.coerce.number().int().min(1).max(50),
  reps: z.string().min(1).max(50),
  rest: z.string().max(50).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

const daySchema = z.object({
  dayLabel: z.string().min(1).max(100),
  exercises: z.array(exerciseSchema).max(50),
});

const schema = z.object({
  title: z.string().min(1).max(200),
  notes: z.string().max(2000).optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  days: z.array(daySchema).max(14),
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

  const { title, notes, startDate, days } = parsed.data;
  const start = startDate ? new Date(startDate) : null;

  const program = await prisma.$transaction(async (tx) => {
    const existing = await tx.trainingProgram.findUnique({ where: { userId: params.id } });
    if (existing) {
      await tx.trainingDay.deleteMany({ where: { programId: existing.id } });
      return tx.trainingProgram.update({
        where: { id: existing.id },
        data: {
          title,
          notes: notes ?? null,
          startDate: start,
          days: {
            create: days.map((d, i) => ({
              dayLabel: d.dayLabel,
              order: i,
              exercises: {
                create: d.exercises.map((e, j) => ({
                  name: e.name,
                  sets: e.sets,
                  reps: e.reps,
                  rest: e.rest ?? null,
                  notes: e.notes ?? null,
                  order: j,
                })),
              },
            })),
          },
        },
      });
    }
    return tx.trainingProgram.create({
      data: {
        userId: params.id,
        title,
        notes: notes ?? null,
        startDate: start,
        days: {
          create: days.map((d, i) => ({
            dayLabel: d.dayLabel,
            order: i,
            exercises: {
              create: d.exercises.map((e, j) => ({
                name: e.name,
                sets: e.sets,
                reps: e.reps,
                rest: e.rest ?? null,
                notes: e.notes ?? null,
                order: j,
              })),
            },
          })),
        },
      },
    });
  });

  return NextResponse.json(program);
}
