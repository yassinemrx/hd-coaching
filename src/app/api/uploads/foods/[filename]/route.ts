import { serveUpload } from "@/lib/upload";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { filename: string } }
) {
  return serveUpload(params.filename, "foods");
}
