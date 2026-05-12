/**
 * Download one photo per food from Pexels, resize to 800px webp, and save to
 * public/uploads/foods/. Updates food.imageUrl in the DB.
 *
 * Usage:
 *   PEXELS_API_KEY=... npx tsx scripts/fetch-food-images.ts
 *
 * Get a free Pexels API key (no card): https://www.pexels.com/api/new/
 */

import { PrismaClient } from "@prisma/client";
import { saveRemoteImage } from "../src/lib/upload";

const prisma = new PrismaClient();

const API_KEY = process.env.PEXELS_API_KEY;
const SEARCH_URL = "https://api.pexels.com/v1/search";

if (!API_KEY) {
  console.error("PEXELS_API_KEY is not set. Get a free key at https://www.pexels.com/api/new/");
  process.exit(1);
}

async function findPhoto(name: string): Promise<string | null> {
  // Append "food" to bias results toward edible photos rather than e.g. people named "Apple".
  const query = `${name} food`;
  const params = new URLSearchParams({
    query,
    per_page: "1",
    orientation: "square",
  });
  const res = await fetch(`${SEARCH_URL}?${params.toString()}`, {
    headers: { Authorization: API_KEY! },
  });
  if (!res.ok) {
    if (res.status === 429) {
      throw new Error("Pexels rate limit hit. Wait an hour and re-run.");
    }
    throw new Error(`Pexels search failed: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as {
    photos?: Array<{ src: { large: string; medium: string; original: string } }>;
  };
  const photo = json.photos?.[0];
  return photo?.src.large ?? null;
}

async function download(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image download failed: ${res.status}`);
  const arr = await res.arrayBuffer();
  return Buffer.from(arr);
}

async function main() {
  const foods = await prisma.food.findMany({ orderBy: { name: "asc" } });
  console.log(`Found ${foods.length} foods. Fetching photos from Pexels…`);

  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const food of foods) {
    if (food.imageUrl) {
      console.log(`  ↪  ${food.name}: already has image, skipping`);
      skipped++;
      continue;
    }

    try {
      const srcUrl = await findPhoto(food.name);
      if (!srcUrl) {
        console.warn(`  ✗  ${food.name}: no Pexels result`);
        failed++;
        continue;
      }
      const buf = await download(srcUrl);
      const url = await saveRemoteImage(buf, "foods", 800);
      await prisma.food.update({ where: { id: food.id }, data: { imageUrl: url } });
      console.log(`  ✓  ${food.name} → ${url}`);
      ok++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗  ${food.name}: ${msg}`);
      failed++;
    }

    // Pexels free tier: 200 req/hr. Sleep 200ms between to stay well under.
    await new Promise((r) => setTimeout(r, 250));
  }

  console.log(`\nDone. downloaded=${ok}  skipped=${skipped}  failed=${failed}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
