"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/Icons";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const creatorFromLink = params.get("creator") || "";
  const [mode, setMode] = useState<"creator" | "admin">("creator");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = mode === "creator"
      ? { mode, code: form.get("code"), pin: form.get("pin") }
      : { mode, email: form.get("email"), password: form.get("password") };
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
    <div>
      <div role="tablist" aria-label="Sign in type" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, borderRadius: 13, background: "var(--surface-soft)", padding: 5, marginBottom: 16 }}>
        <button type="button" onClick={() => { setMode("creator"); setError(""); }} style={{ minHeight: 38, border: 0, borderRadius: 9, cursor: "pointer", fontSize: 10, fontWeight: 850, background: mode === "creator" ? "white" : "transparent", color: mode === "creator" ? "var(--brand-dark)" : "var(--ink-soft)", boxShadow: mode === "creator" ? "var(--shadow-sm)" : "none" }}>Creator</button>
        <button type="button" onClick={() => { setMode("admin"); setError(""); }} style={{ minHeight: 38, border: 0, borderRadius: 9, cursor: "pointer", fontSize: 10, fontWeight: 850, background: mode === "admin" ? "white" : "transparent", color: mode === "admin" ? "var(--brand-dark)" : "var(--ink-soft)", boxShadow: mode === "admin" ? "var(--shadow-sm)" : "none" }}>Gizet admin</button>
      </div>
      <form className="login-form" onSubmit={submit} key={mode}>
        {mode === "creator" ? <>
          <label>Creator code or handle<input name="code" defaultValue={creatorFromLink} autoComplete="username" required placeholder="HANA or @hanalifestyle" /></label>
          <label>4-digit PIN<input name="pin" style={{ fontSize: 24, fontWeight: 900, letterSpacing: ".35em", textAlign: "center", paddingLeft: "calc(12px + .35em)" }} type="password" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{4}" minLength={4} maxLength={4} required placeholder="••••" /></label>
          <div style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--ink-soft)", fontSize: 9.5, lineHeight: 1.5 }}><Icon name="check" size={14}/> This device stays signed in for 30 days.</div>
        </> : <>
          <label>Email<input name="email" type="email" autoComplete="email" required placeholder="you@gizet.co" /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" required minLength={8} placeholder="Your password" /></label>
        </>}
        {error && <div className="form-error">{error}</div>}
        <button className="btn-primary login-button" disabled={loading}><Icon name={mode === "creator" ? "arrow" : "shield"} size={16}/>{loading ? "Signing in…" : mode === "creator" ? "Open my dashboard" : "Sign in securely"}</button>
      </form>
    </div>
  );
}
