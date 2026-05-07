import Link from "next/link";
import NewClientForm from "./NewClientForm";

export const metadata = { title: "Add client — Admin" };

export default function NewClientPage() {
  return (
    <div className="max-w-xl">
      <Link href="/admin/clients" className="text-sm text-brand-700 hover:underline">
        ← Back to clients
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Add client</h1>
      <p className="mt-1 text-sm text-slate-500">
        Create the client&apos;s account. Share the email and password with them.
      </p>
      <div className="card mt-6">
        <NewClientForm />
      </div>
    </div>
  );
}
