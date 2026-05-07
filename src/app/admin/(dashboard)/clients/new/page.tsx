import Link from "next/link";
import NewClientForm from "./NewClientForm";
import { getDict } from "@/lib/i18n/server";

export const metadata = { title: "Add client — Admin" };
export const dynamic = "force-dynamic";

export default async function NewClientPage() {
  const t = await getDict();
  return (
    <div className="max-w-xl">
      <Link href="/admin/clients" className="text-sm text-brand-700 hover:underline">
        {t.admin.backToClients}
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">{t.admin.addClientTitle}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {t.admin.addClientBlurb}
      </p>
      <div className="card mt-6">
        <NewClientForm />
      </div>
    </div>
  );
}
