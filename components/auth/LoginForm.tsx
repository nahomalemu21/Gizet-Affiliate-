"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/Icons";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });
    const body = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setError(body.error || "Login failed");
      return;
    }
    const requested = params.get("next");
    router.replace(requested || (body.role === "admin" ? "/admin" : "/creator"));
    router.refresh();
  }

  return (
    <form className="login-form" onSubmit={submit}>
      <label>Email<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
      <label>Password<input name="password" type="password" autoComplete="current-password" required minLength={8} placeholder="Your password" /></label>
      {error && <div className="form-error">{error}</div>}
      <button className="btn-primary login-button" disabled={loading}><Icon name="shield" size={16}/>{loading ? "Signing in…" : "Sign in securely"}</button>
    </form>
  );
}
