import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const photos = await prisma.progressPhoto.findMany({
    where: { photoUrl: { startsWith: "/uploads/" } },
  });
  console.log(`Found ${photos.length} photo(s) with the old URL pattern.`);
  for (const p of photos) {
    const next = p.photoUrl.replace("/uploads/", "/api/uploads/");
    await prisma.progressPhoto.update({
      where: { id: p.id },
      data: { photoUrl: next },
    });
    console.log(`  ${p.id}: ${p.photoUrl}  →  ${next}`);
  }
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
