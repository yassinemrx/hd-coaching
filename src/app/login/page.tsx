import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in — HD Coaching" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">HD Coaching</h1>
          <p className="mt-1 text-sm text-slate-500">Client portal</p>
        </div>
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Sign in</h2>
          <Suspense>
            <LoginForm callbackUrl="/dashboard/progress" />
          </Suspense>
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">
          Coach? <a href="/admin/login" className="text-brand-700 hover:underline">Admin sign-in</a>
        </p>
      </div>
    </div>
  );
}
