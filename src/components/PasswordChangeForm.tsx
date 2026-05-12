"use client";

import { useState } from "react";
import { useDict } from "./I18nProvider";

export default function PasswordChangeForm() {
  const t = useDict();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (next.length < 8) {
      setError(t.settings.passwordTooShort);
      return;
    }
    if (next !== confirm) {
      setError(t.settings.passwordsDontMatch);
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      const code = j?.error;
      if (code === "wrong_password") setError(t.settings.wrongPassword);
      else if (code === "same_password") setError(t.settings.samePassword);
      else if (code === "invalid_input") setError(t.settings.passwordTooShort);
      else setError(t.settings.couldNotChange);
      return;
    }

    setSuccess(true);
    setCurrent("");
    setNext("");
    setConfirm("");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="current">{t.settings.currentPassword}</label>
        <input
          id="current"
          type="password"
          autoComplete="current-password"
          required
          className="input mt-1"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
      </div>
      <div>
        <label className="label" htmlFor="new">{t.settings.newPassword}</label>
        <input
          id="new"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="input mt-1"
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
        <p className="mt-1 text-xs text-ink-500">{t.settings.passwordHint}</p>
      </div>
      <div>
        <label className="label" htmlFor="confirm">{t.settings.confirmNewPassword}</label>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="input mt-1"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {success && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          {t.settings.passwordChanged}
        </p>
      )}

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? t.settings.changing : t.settings.changePasswordCta}
      </button>
    </form>
  );
}
