import { Suspense } from "react";
import LoginForm from "../../login/LoginForm";

export const metadata = { title: "Coach sign-in — HD Coaching" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">HD Coaching</h1>
          <p className="mt-1 text-sm text-slate-500">Coach admin</p>
        </div>
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Coach sign-in</h2>
          <Suspense>
            <LoginForm callbackUrl="/admin" />
          </Suspense>
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">
          Client? <a href="/login" className="text-brand-700 hover:underline">Client sign-in</a>
        </p>
      </div>
    </div>
  );
}
