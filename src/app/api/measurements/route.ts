import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  date: z.string().datetime().optional(),
  chest: z.coerce.number().positive().max(300).nullable().optional(),
  waist: z.coerce.number().positive().max(300).nullable().optional(),
  hips: z.coerce.number().positive().max(300).nullable().optional(),
  thighs: z.coerce.number().positive().max(300).nullable().optional(),
  arms: z.coerce.number().positive().max(300).nullable().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const date = parsed.data.date ? new Date(parsed.data.date) : new Date();
  date.setHours(12, 0, 0, 0);

  const m = await prisma.bodyMeasurement.create({
    data: {
      userId: session.user.id,
      date,
      chest: parsed.data.chest ?? null,
      waist: parsed.data.waist ?? null,
      hips: parsed.data.hips ?? null,
      thighs: parsed.data.thighs ?? null,
      arms: parsed.data.arms ?? null,
    },
  });
  return NextResponse.json(m, { status: 201 });
}
