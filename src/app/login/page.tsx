import { Suspense } from "react";
import LoginForm from "./LoginForm";
import { DumbbellIcon } from "@/components/Icon";

export const metadata = { title: "Sign in — HD Coaching" };

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10 bg-ink-50">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-emerald-100/60 blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
            <DumbbellIcon size={26} />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink-900">
            HD Coaching
          </h1>
          <p className="mt-1 text-sm text-ink-500">Client portal</p>
        </div>
        <div className="card">
          <h2 className="h-section">Sign in to your account</h2>
          <p className="mt-1 text-muted">Track your progress and view your plans.</p>
          <div className="mt-5">
            <Suspense>
              <LoginForm callbackUrl="/dashboard/progress" />
            </Suspense>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-ink-500">
          Coach?{" "}
          <a href="/admin/login" className="font-medium text-brand-700 hover:text-brand-600">
            Admin sign-in
          </a>
        </p>
      </div>
    </div>
  );
}
