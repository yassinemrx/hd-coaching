import { Suspense } from "react";
import LoginForm from "./LoginForm";
import { DumbbellIcon } from "@/components/Icon";
import { getDict } from "@/lib/i18n/server";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export const metadata = { title: "Sign in — HD Coaching" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const t = await getDict();
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10 bg-ink-50">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-brand-500/15 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-brand-400/15 blur-3xl" />
      </div>

      <div className="absolute end-4 top-4">
        <LocaleSwitcher />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
            <DumbbellIcon size={26} />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink-900">
            HD Coaching
          </h1>
          <p className="mt-1 text-sm text-ink-500">{t.auth.clientPortal}</p>
        </div>
        <div className="card">
          <h2 className="h-section">{t.auth.signInToAccount}</h2>
          <p className="mt-1 text-muted">{t.auth.signInBlurb}</p>
          <div className="mt-5">
            <Suspense>
              <LoginForm callbackUrl="/dashboard/progress" />
            </Suspense>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-ink-500">
          {t.auth.askCoach}{" "}
          <a href="/admin/login" className="font-medium text-brand-700 hover:text-brand-600">
            {t.auth.adminSignIn}
          </a>
        </p>
      </div>
    </div>
  );
}
