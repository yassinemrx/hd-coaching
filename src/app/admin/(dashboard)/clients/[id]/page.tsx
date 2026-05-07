import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/week";
import WeightChart from "@/components/WeightChart";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = await prisma.user.findUnique({ where: { id: params.id } });
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
          ← Back to clients
        </Link>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
            <p className="text-sm text-slate-500">{client.email}</p>
            <p className="mt-1 text-xs text-slate-400">
              Joined {formatDate(client.createdAt)}
              {client.lastLoginAt
                ? ` · Last login ${formatDate(client.lastLoginAt)}`
                : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/admin/clients/${client.id}/edit`}
              className="btn btn-secondary"
            >
              Edit account
            </Link>
            <Link
              href={`/admin/clients/${client.id}/diet`}
              className="btn btn-secondary"
            >
              {dietPlan ? "Edit diet" : "+ Diet plan"}
            </Link>
            <Link
              href={`/admin/clients/${client.id}/training`}
              className="btn btn-primary"
            >
              {program ? "Edit training" : "+ Training program"}
            </Link>
          </div>
        </div>
      </div>

      <section className="card">
        <h2 className="text-lg font-semibold">Weight (last 90 days)</h2>
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
        <h2 className="text-lg font-semibold">Recent body measurements</h2>
        {measurements.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No measurements yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-md ring-1 ring-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Chest</th>
                  <th className="px-4 py-2">Waist</th>
                  <th className="px-4 py-2">Hips</th>
                  <th className="px-4 py-2">Thighs</th>
                  <th className="px-4 py-2">Arms</th>
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
        <h2 className="text-lg font-semibold">Recent photos</h2>
        {photos.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No photos uploaded.</p>
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
