import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { formatDate } from "@/lib/week";
import { UsersIcon, ChartIcon, CameraIcon, DumbbellIcon, SaladIcon, PlusIcon, ChevronRightIcon } from "@/components/Icon";
import { getDict } from "@/lib/i18n/server";

export const metadata = { title: "Admin — HD Coaching" };
export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [, t] = await Promise.all([requireAdmin(), getDict()]);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [clientCount, recentLogs, recentPhotos, exerciseCount, foodCount] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.weightLog.count({ where: { date: { gte: sevenDaysAgo } } }),
    prisma.progressPhoto.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.exerciseLibrary.count(),
    prisma.food.count(),
  ]);

  const latestClients = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            {t.admin.coachDashboard}
          </p>
          <h1 className="mt-1 h-page">{t.admin.hello}</h1>
          <p className="mt-1 text-muted">{t.admin.blurb}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/clients/new" className="btn btn-primary">
            <PlusIcon size={16} /> {t.admin.newClient}
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={t.admin.clientsCount}
          value={clientCount}
          icon={<UsersIcon size={18} />}
          accent="bg-brand-50 text-brand-700"
        />
        <StatCard
          label={t.admin.logs7d}
          value={recentLogs}
          icon={<ChartIcon size={18} />}
          accent="bg-blue-50 text-blue-700"
        />
        <StatCard
          label={t.admin.photos7d}
          value={recentPhotos}
          icon={<CameraIcon size={18} />}
          accent="bg-purple-50 text-purple-700"
        />
        <StatCard
          label={t.admin.libraryItems}
          value={exerciseCount + foodCount}
          icon={<DumbbellIcon size={18} />}
          accent="bg-amber-50 text-amber-700"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="h-section">{t.admin.recentClients}</h2>
            <Link href="/admin/clients" className="text-sm font-medium text-brand-700 hover:text-brand-600">
              {t.admin.viewAll}
            </Link>
          </div>
          {latestClients.length === 0 ? (
            <div className="empty-state mt-4">
              <UsersIcon size={28} className="text-ink-300" />
              <p className="mt-3 font-medium text-ink-700">{t.admin.noClients}</p>
              <p className="mt-1 text-muted">{t.admin.noClientsSub}</p>
              <Link href="/admin/clients/new" className="btn btn-primary mt-4">
                <PlusIcon size={16} /> {t.admin.addClient}
              </Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-ink-100">
              {latestClients.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/admin/clients/${c.id}`}
                    className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-ink-50/40 -mx-2 px-2 rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
                        {c.name.slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate font-medium text-ink-900">{c.name}</div>
                        <div className="truncate text-xs text-ink-500">{c.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="hidden text-xs text-ink-400 sm:inline">
                        {t.admin.addedOn} {formatDate(c.createdAt)}
                      </span>
                      <ChevronRightIcon size={16} className="text-ink-300" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2 className="h-section">{t.admin.quickActions}</h2>
          <div className="mt-4 space-y-2">
            <QuickLink href="/admin/clients/new" icon={<PlusIcon size={16} />} label={t.admin.addNewClient} />
            <QuickLink href="/admin/exercises" icon={<DumbbellIcon size={16} />} label={t.admin.manageExercises} hint={`${exerciseCount} ${t.admin.itemsSuffix}`} />
            <QuickLink href="/admin/foods" icon={<SaladIcon size={16} />} label={t.admin.manageFoods} hint={`${foodCount} ${t.admin.itemsSuffix}`} />
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="card-tight">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${accent}`}>{icon}</span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold tracking-tight text-ink-900">{value}</p>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  label,
  hint,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  hint?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-lg p-3 ring-1 ring-ink-100 transition-all hover:bg-ink-50/60 hover:ring-ink-200"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-100">
          {icon}
        </span>
        <span className="text-sm font-medium text-ink-700 group-hover:text-ink-900">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {hint && <span className="text-xs text-ink-400">{hint}</span>}
        <ChevronRightIcon size={16} className="text-ink-300 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
