import { requireClient } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import WeightSection from "./WeightSection";
import MeasurementsSection from "./MeasurementsSection";
import PhotosSection from "./PhotosSection";
import { getDict } from "@/lib/i18n/server";

export const metadata = { title: "Progress — HD Coaching" };
export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const [user, t] = await Promise.all([requireClient(), getDict()]);

  const since = new Date();
  since.setDate(since.getDate() - 90);

  const [weightLogs, measurements, photos] = await Promise.all([
    prisma.weightLog.findMany({
      where: { userId: user.id, date: { gte: since } },
      orderBy: { date: "asc" },
    }),
    prisma.bodyMeasurement.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 20,
    }),
    prisma.progressPhoto.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 24,
    }),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">{t.progress.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.progress.blurb}</p>
      </header>

      <WeightSection
        logs={weightLogs.map((l) => ({
          id: l.id,
          date: l.date.toISOString(),
          weightKg: l.weightKg,
        }))}
      />

      <MeasurementsSection
        entries={measurements.map((m) => ({
          id: m.id,
          date: m.date.toISOString(),
          chest: m.chest,
          waist: m.waist,
          hips: m.hips,
          thighs: m.thighs,
          arms: m.arms,
        }))}
      />

      <PhotosSection
        photos={photos.map((p) => ({
          id: p.id,
          weekLabel: p.weekLabel,
          photoUrl: p.photoUrl,
          createdAt: p.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
