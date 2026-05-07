import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { formatDate } from "@/lib/week";

export const metadata = { title: "Admin — HD Coaching" };
export const dynamic = "force-dynamic";

export default async function AdminHome() {
  await requireAdmin();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [clientCount, recentLogs, recentPhotos] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.weightLog.count({ where: { date: { gte: sevenDaysAgo } } }),
    prisma.progressPhoto.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
  ]);

  const latestClients = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
          <p className="mt-1 text-sm text-slate-500">Quick snapshot of your coaching practice.</p>
        </div>
        <Link href="/admin/clients" className="btn btn-primary">
          Manage clients
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total clients" value={clientCount} />
        <StatCard label="Weight logs (7d)" value={recentLogs} />
        <StatCard label="New photos (7d)" value={recentPhotos} />
      </div>

      <section className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent clients</h2>
          <Link href="/admin/clients" className="text-sm text-brand-700 hover:underline">
            View all
          </Link>
        </div>
        {latestClients.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">
            No clients yet.{" "}
            <Link href="/admin/clients/new" className="text-brand-700 hover:underline">
              Add your first client
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {latestClients.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-3">
                <div>
                  <Link
                    href={`/admin/clients/${c.id}`}
                    className="font-medium text-slate-900 hover:text-brand-700"
                  >
                    {c.name}
                  </Link>
                  <p className="text-xs text-slate-500">{c.email}</p>
                </div>
                <span className="text-xs text-slate-400">
                  Added {formatDate(c.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
