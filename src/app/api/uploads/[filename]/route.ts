import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export const dynamic = "force-dynamic";

const SAFE_NAME = /^[a-zA-Z0-9_\-.]+$/;

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".heic": "image/heic",
  ".heif": "image/heif",
};

export async function GET(
  _req: Request,
  { params }: { params: { filename: string } }
) {
  const filename = params.filename;
  if (!SAFE_NAME.test(filename) || filename.includes("..")) {
    return new NextResponse("Bad request", { status: 400 });
  }

  const filePath = path.join(UPLOAD_DIR, filename);

  try {
    await stat(filePath);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  const data = await readFile(filePath);
  const ext = path.extname(filename).toLowerCase();
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";

  return new NextResponse(data, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
