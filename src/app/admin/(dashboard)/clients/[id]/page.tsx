import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/week";
import WeightChart from "@/components/WeightChart";
import { getDict } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const [client, t] = await Promise.all([
    prisma.user.findUnique({ where: { id: params.id } }),
    getDict(),
  ]);
  if (!client || client.role !== "USER") notFound();

  const since = new Date();
  since.setDate(since.getDate() - 90);

  const [weightLogs, measurements, photos, dietPlan, program] = await Promise.all([
    prisma.weightLog.findMany({
      where: { userId: client.id, date: { gte: since } },
      orderBy: { date: "asc" },
    }),
    prisma.bodyMeasurement.findMany({
      where: { userId: client.id },
      orderBy: { date: "desc" },
      take: 12,
    }),
    prisma.progressPhoto.findMany({
      where: { userId: client.id },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.dietPlan.findUnique({ where: { userId: client.id } }),
    prisma.trainingProgram.findUnique({ where: { userId: client.id } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/clients" className="text-sm text-brand-700 hover:underline">
          {t.admin.backToClients}
        </Link>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-bold text-slate-900">{client.name}</h1>
            <p className="break-all text-sm text-slate-500">{client.email}</p>
            <p className="mt-1 text-xs text-slate-400">
              {t.admin.joined} {formatDate(client.createdAt)}
              {client.lastLoginAt
                ? ` · ${t.admin.lastLoginText} ${formatDate(client.lastLoginAt)}`
                : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/clients/${client.id}/edit`}
              className="btn btn-secondary flex-1 sm:flex-none"
            >
              {t.admin.editAccount}
            </Link>
            <Link
              href={`/admin/clients/${client.id}/diet`}
              className="btn btn-secondary flex-1 sm:flex-none"
            >
              {dietPlan ? t.admin.editDietPlan : t.admin.addDietPlan}
            </Link>
            <Link
              href={`/admin/clients/${client.id}/training`}
              className="btn btn-primary flex-1 sm:flex-none"
            >
              {program ? t.admin.editTrainingProgram : t.admin.addTrainingProgram}
            </Link>
          </div>
        </div>
      </div>

      <section className="card">
        <h2 className="text-lg font-semibold">{t.admin.weight90}</h2>
        <div className="mt-4">
          <WeightChart
            data={weightLogs.map((l) => ({
              date: l.date.toISOString(),
              weightKg: l.weightKg,
            }))}
          />
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">{t.admin.recentMeasurements}</h2>
        {measurements.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">{t.admin.noMeasurementsYet}</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-md ring-1 ring-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2">{t.common.date}</th>
                  <th className="px-4 py-2">{t.progress.chest}</th>
                  <th className="px-4 py-2">{t.progress.waist}</th>
                  <th className="px-4 py-2">{t.progress.hips}</th>
                  <th className="px-4 py-2">{t.progress.thighs}</th>
                  <th className="px-4 py-2">{t.progress.arms}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {measurements.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-2 text-slate-700">{formatDate(m.date)}</td>
                    <td className="px-4 py-2">{m.chest?.toFixed(1) ?? "—"}</td>
                    <td className="px-4 py-2">{m.waist?.toFixed(1) ?? "—"}</td>
                    <td className="px-4 py-2">{m.hips?.toFixed(1) ?? "—"}</td>
                    <td className="px-4 py-2">{m.thighs?.toFixed(1) ?? "—"}</td>
                    <td className="px-4 py-2">{m.arms?.toFixed(1) ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">{t.admin.recentPhotos}</h2>
        {photos.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">{t.admin.noPhotosUploaded}</p>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {photos.map((p) => (
              <div
                key={p.id}
                className="overflow-hidden rounded-lg ring-1 ring-slate-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.photoUrl}
                  alt={p.weekLabel}
                  className="aspect-square w-full object-cover"
                />
                <p className="bg-white px-2 py-1 text-xs text-slate-500">
                  {p.weekLabel}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
