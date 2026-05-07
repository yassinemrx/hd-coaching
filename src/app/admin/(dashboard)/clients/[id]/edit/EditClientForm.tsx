"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDict } from "@/components/I18nProvider";

export default function EditClientForm({
  id,
  defaults,
}: {
  id: string;
  defaults: { name: string; email: string };
}) {
  const t = useDict();
  const router = useRouter();
  const [name, setName] = useState(defaults.name);
  const [email, setEmail] = useState(defaults.email);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);
    setSubmitting(true);
    const body: Record<string, string> = { name, email };
    if (password.length > 0) body.password = password;
    const res = await fetch(`/api/clients/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    setSubmitting(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(typeof j.error === "string" ? j.error : t.admin.couldNotUpdate);
      return;
    }
    setPassword("");
    setOk(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="name">{t.admin.nameField}</label>
        <input
          id="name"
          required
          className="input mt-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="label" htmlFor="email">{t.admin.emailField}</label>
        <input
          id="email"
          type="email"
          required
          className="input mt-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="label" htmlFor="password">{t.admin.newPasswordOptional}</label>
        <input
          id="password"
          type="text"
          minLength={6}
          className="input mt-1"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t.admin.leaveBlankPassword}
        />
      </div>
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {ok && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          {t.admin.changesSaved}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? t.admin.savingDots : t.admin.saveChangesBtn}
      </button>
    </form>
  );
}
