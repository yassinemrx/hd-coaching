import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  date: z.string().datetime().optional(),
  weightKg: z.coerce.number().positive().max(500),
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

  const log = await prisma.weightLog.create({
    data: {
      userId: session.user.id,
      date,
      weightKg: parsed.data.weightKg,
    },
  });
  return NextResponse.json(log, { status: 201 });
}
