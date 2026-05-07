"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDict } from "@/components/I18nProvider";

export default function NewClientForm() {
  const t = useDict();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(typeof j.error === "string" ? j.error : t.admin.couldNotCreate);
      return;
    }
    router.push("/admin/clients");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="name">{t.admin.fullName}</label>
        <input
          id="name"
          required
          className="input mt-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="label" htmlFor="email">{t.admin.emailLogin}</label>
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
        <label className="label" htmlFor="password">{t.admin.initialPassword}</label>
        <input
          id="password"
          type="text"
          required
          minLength={6}
          className="input mt-1"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t.admin.atLeast6}
        />
      </div>
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? t.admin.creating : t.admin.createClient}
      </button>
    </form>
  );
}
