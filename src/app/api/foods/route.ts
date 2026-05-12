import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { foodCreateSchema } from "@/lib/foodSchema";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const json = await req.json().catch(() => null);
  const parsed = foodCreateSchema.safeParse(json);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data;
  const food = await prisma.food.create({
    data: {
      ...data,
      name: data.name.trim(),
      notes: data.notes || null,
      imageUrl: data.imageUrl || null,
    },
  });
  return NextResponse.json(food, { status: 201 });
}
