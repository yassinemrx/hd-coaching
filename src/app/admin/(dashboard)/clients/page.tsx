import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/week";
import ClientRowActions from "./ClientRowActions";
import { PlusIcon, UsersIcon, ChevronRightIcon } from "@/components/Icon";

export const metadata = { title: "Clients — Admin" };
export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      lastLoginAt: true,
      weightLogs: {
        select: { date: true },
        orderBy: { date: "desc" },
        take: 1,
      },
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Workspace</p>
          <h1 className="mt-1 h-page">Clients</h1>
          <p className="mt-1 text-muted">Manage client accounts and view their progress.</p>
        </div>
        <Link href="/admin/clients/new" className="btn btn-primary">
          <PlusIcon size={16} /> Add client
        </Link>
      </header>

      {clients.length === 0 ? (
        <div className="empty-state">
          <UsersIcon size={28} className="text-ink-300" />
          <p className="mt-3 font-medium text-ink-700">No clients yet</p>
          <p className="mt-1 text-muted">Add your first client to get started.</p>
          <Link href="/admin/clients/new" className="btn btn-primary mt-4">
            <PlusIcon size={16} /> Add client
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => (
            <article
              key={c.id}
              className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-soft ring-1 ring-ink-100 transition-all hover:-translate-y-0.5 hover:ring-brand-200"
            >
              <Link
                href={`/admin/clients/${c.id}`}
                className="absolute inset-0 z-0"
                aria-label={`Open ${c.name}`}
              />
              <div className="relative z-10 flex items-start gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-gradient text-base font-bold text-white shadow-soft">
                  {c.name.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-ink-900">{c.name}</h3>
                  <p className="truncate text-xs text-ink-500">{c.email}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <Mini label="Last login" value={c.lastLoginAt ? formatDate(c.lastLoginAt) : "—"} />
                    <Mini label="Last log" value={c.weightLogs[0] ? formatDate(c.weightLogs[0].date) : "—"} />
                  </div>
                </div>
                <ChevronRightIcon size={16} className="mt-2 text-ink-300 transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="relative z-10 mt-3 -mb-2 flex justify-end">
                <ClientRowActions id={c.id} name={c.name} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-ink-50 px-2 py-1.5">
      <div className="text-[10px] font-medium uppercase tracking-wide text-ink-500">{label}</div>
      <div className="truncate font-semibold text-ink-800">{value}</div>
    </div>
  );
}
