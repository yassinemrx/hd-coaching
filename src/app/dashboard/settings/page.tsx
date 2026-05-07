import { requireClient } from "@/lib/session";
import { getDict } from "@/lib/i18n/server";
import PasswordChangeForm from "@/components/PasswordChangeForm";

export const metadata = { title: "Settings — HD Coaching" };
export const dynamic = "force-dynamic";

export default async function ClientSettingsPage() {
  const [user, t] = await Promise.all([requireClient(), getDict()]);

  return (
    <div className="max-w-xl space-y-6 animate-fade-in">
      <header>
        <h1 className="h-page">{t.settings.title}</h1>
        <p className="mt-1 text-muted">{t.settings.blurb}</p>
      </header>

      <section className="card">
        <h2 className="h-section">{t.settings.account}</h2>
        <div className="mt-3 grid gap-2 text-sm">
          <Row label={t.common.name} value={user.name ?? "—"} />
          <Row label={t.common.email} value={user.email ?? "—"} />
        </div>
      </section>

      <section className="card">
        <h2 className="h-section">{t.settings.changePassword}</h2>
        <p className="mt-1 text-muted text-sm">{t.settings.changePasswordBlurb}</p>
        <div className="mt-4">
          <PasswordChangeForm />
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-ink-50 px-3 py-2">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</span>
      <span className="font-medium text-ink-800">{value}</span>
    </div>
  );
}
