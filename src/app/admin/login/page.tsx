import { Suspense } from "react";
import LoginForm from "../../login/LoginForm";
import { DumbbellIcon } from "@/components/Icon";
import { getDict } from "@/lib/i18n/server";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export const metadata = { title: "Coach sign-in — HD Coaching" };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const t = await getDict();
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10 bg-ink-gradient text-white">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-brand-400/15 blur-3xl" />
      </div>

      <div className="absolute end-4 top-4">
        <LocaleSwitcher tone="dark" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
            <DumbbellIcon size={26} />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">
            HD Coaching
          </h1>
          <p className="mt-1 text-sm text-white/60">{t.auth.coachAdmin}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 text-ink-900 shadow-soft">
          <h2 className="h-section">{t.auth.coachSignIn}</h2>
          <p className="mt-1 text-muted">{t.auth.coachSignInBlurb}</p>
          <div className="mt-5">
            <Suspense>
              <LoginForm callbackUrl="/admin" />
            </Suspense>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-white/50">
          {t.auth.askClient}{" "}
          <a href="/login" className="font-medium text-brand-500 hover:text-brand-600">
            {t.auth.clientSignIn}
          </a>
        </p>
      </div>
    </div>
  );
}
