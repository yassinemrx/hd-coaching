import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditClientForm from "./EditClientForm";
import { getDict } from "@/lib/i18n/server";

export const metadata = { title: "Edit client — Admin" };
export const dynamic = "force-dynamic";

export default async function EditClientPage({ params }: { params: { id: string } }) {
  const [client, t] = await Promise.all([
    prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, email: true, role: true },
    }),
    getDict(),
  ]);
  if (!client || client.role !== "USER") notFound();

  return (
    <div className="max-w-xl">
      <Link
        href={`/admin/clients/${client.id}`}
        className="text-sm text-brand-700 hover:underline"
      >
        {t.admin.backToClient.replace("{name}", client.name)}
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">{t.admin.editClientTitle}</h1>
      <div className="card mt-6">
        <EditClientForm
          id={client.id}
          defaults={{ name: client.name, email: client.email }}
        />
      </div>
    </div>
  );
}
