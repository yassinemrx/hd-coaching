import { writeFile, mkdir, readFile, stat } from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { NextResponse } from "next/server";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Legacy progress-photo upload — saves to public/uploads/ untouched.
 * Kept for /api/photos. New code should use saveImageUpload().
 */
export async function saveUpload(file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Unsupported file type");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("File too large (max 8 MB)");
  }
  await mkdir(UPLOAD_ROOT, { recursive: true });
  const ext = mimeToExt(file.type);
  const id = crypto.randomBytes(12).toString("hex");
  const filename = `${Date.now()}-${id}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_ROOT, filename), buffer);
  return `/api/uploads/${filename}`;
}

/**
 * Resize + compress + save an uploaded image into a sub-folder under public/uploads/.
 * Output is always WebP for size, max dimension `maxSize` (default 800 px), quality 82.
 * Returns the public URL served via /api/uploads/<subdir>/<filename>.
 */
export async function saveImageUpload(
  file: File,
  subdir: "foods" | "meals",
  maxSize = 800
): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Unsupported file type");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("File too large (max 8 MB)");
  }

  const dir = path.join(UPLOAD_ROOT, subdir);
  await mkdir(dir, { recursive: true });

  const id = crypto.randomBytes(8).toString("hex");
  const filename = `${Date.now()}-${id}.webp`;
  const inputBuffer = Buffer.from(await file.arrayBuffer());

  const output = await sharp(inputBuffer)
    .rotate() // honour EXIF orientation
    .resize({ width: maxSize, height: maxSize, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  await writeFile(path.join(dir, filename), output);
  return `/api/uploads/${subdir}/${filename}`;
}

/**
 * Save a remote/raw image buffer (used by scripts that fetch from Pexels etc.).
 * Same compression rules as saveImageUpload; bypasses File API.
 */
export async function saveRemoteImage(
  buffer: Buffer,
  subdir: "foods" | "meals",
  maxSize = 800
): Promise<string> {
  const dir = path.join(UPLOAD_ROOT, subdir);
  await mkdir(dir, { recursive: true });

  const id = crypto.randomBytes(8).toString("hex");
  const filename = `${Date.now()}-${id}.webp`;

  const output = await sharp(buffer)
    .rotate()
    .resize({ width: maxSize, height: maxSize, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  await writeFile(path.join(dir, filename), output);
  return `/api/uploads/${subdir}/${filename}`;
}

const SAFE_NAME = /^[a-zA-Z0-9_\-.]+$/;
const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".heic": "image/heic",
  ".heif": "image/heif",
};

/** Shared file-serving handler used by /api/uploads/[filename] and the subfolder variants. */
export async function serveUpload(
  filename: string,
  subdir?: "foods" | "meals"
): Promise<NextResponse> {
  if (!SAFE_NAME.test(filename) || filename.includes("..")) {
    return new NextResponse("Bad request", { status: 400 });
  }
  const filePath = subdir
    ? path.join(UPLOAD_ROOT, subdir, filename)
    : path.join(UPLOAD_ROOT, filename);
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

function mimeToExt(mime: string) {
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/heic":
      return ".heic";
    case "image/heif":
      return ".heif";
    default:
      return "";
  }
}
