import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/week";
import ClientRowActions from "./ClientRowActions";

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
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage client accounts and view their progress.
          </p>
        </div>
        <Link href="/admin/clients/new" className="btn btn-primary">
          + Add client
        </Link>
      </header>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Last login</th>
              <th className="px-4 py-3">Last weight log</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {clients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                  No clients yet.
                </td>
              </tr>
            )}
            {clients.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/clients/${c.id}`}
                    className="font-medium text-slate-900 hover:text-brand-700"
                  >
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{c.email}</td>
                <td className="px-4 py-3 text-slate-500">
                  {c.lastLoginAt ? formatDate(c.lastLoginAt) : "—"}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {c.weightLogs[0] ? formatDate(c.weightLogs[0].date) : "—"}
                </td>
                <td className="px-4 py-3">
                  <ClientRowActions id={c.id} name={c.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
