import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { unlink } from "fs/promises";
import path from "path";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const photo = await prisma.progressPhoto.findUnique({ where: { id: params.id } });
  if (!photo || photo.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.progressPhoto.delete({ where: { id: params.id } });

  if (photo.photoUrl.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", photo.photoUrl.replace(/^\//, ""));
    await unlink(filePath).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
