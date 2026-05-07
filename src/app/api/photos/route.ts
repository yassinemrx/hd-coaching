import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/upload";
import { currentWeekLabel } from "@/lib/week";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid form" }, { status: 400 });

  const file = form.get("file");
  const weekLabel = (form.get("weekLabel") as string | null)?.trim() || currentWeekLabel();

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  let url: string;
  try {
    url = await saveUpload(file);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const photo = await prisma.progressPhoto.create({
    data: {
      userId: session.user.id,
      weekLabel,
      photoUrl: url,
    },
  });
  return NextResponse.json(photo, { status: 201 });
}
