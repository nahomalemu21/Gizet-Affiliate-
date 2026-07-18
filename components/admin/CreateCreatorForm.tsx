"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CopyButton } from "@/components/CopyButton";

export function CreateCreatorForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginUrl, setLoginUrl] = useState("");

  function close() {
    setOpen(false);
    setLoginUrl("");
    setError("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/creators", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    const body = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) { setError(body.error || "Could not create creator"); return; }
    setLoginUrl(body.loginUrl);
    router.refresh();
  }

  if (!open) return <button className="btn-primary" onClick={() => setOpen(true)}>Invite creator</button>;

  return <div className="modal-backdrop"><div className="modal-card"><div className="panel-head"><div><h2>{loginUrl ? "Creator access is ready" : "Create creator account"}</h2><p>{loginUrl ? "Send this link and the four-digit PIN you chose." : "Creators use a short code and PIN instead of a normal password."}</p></div><button className="icon-button" onClick={close}>×</button></div>
    {loginUrl ? <div style={{ display: "grid", gap: 14 }}><div style={{ display: "grid", gap: 7, border: "1px solid #cfe2d7", borderRadius: 14, background: "#f5faf7", padding: 14 }}><span>Creator login link</span><strong>{loginUrl}</strong><CopyButton value={loginUrl} label="Copy link"/></div><div style={{ color: "var(--ink-soft)", fontSize: 9.5, lineHeight: 1.5 }}>The creator code is already filled in. They enter the PIN once, and the device stays signed in for 30 days.</div><div className="form-actions"><button className="btn-primary" onClick={close}>Done</button></div></div> : <form className="admin-form" onSubmit={submit}>
      <label>Name<input name="name" required /></label><label>Handle<input name="handle" required placeholder="hanalifestyle" /></label>
      <label>Email for recovery <span style={{ color: "var(--ink-faint)", fontSize: 8, fontWeight: 600 }}>Optional</span><input name="email" type="email" placeholder="creator@example.com" /></label>
      <label>4-digit PIN<input name="pin" type="password" inputMode="numeric" pattern="[0-9]{4}" minLength={4} maxLength={4} required placeholder="Four digits" /></label>
      <label>Platform<select name="platform" defaultValue="TikTok"><option>TikTok</option><option>Instagram</option><option>YouTube</option></select></label>
      <label>Followers<input name="followers" type="number" min="0" defaultValue="0" /></label>
      <label>Commission %<input name="commissionRate" type="number" min="1" max="10" step="0.5" defaultValue="7" /></label>
      <label>Creator code<input name="discountCode" required placeholder="HANA" /></label>
      {error && <div className="form-error form-wide">{error}</div>}
      <div className="form-actions form-wide"><button type="button" className="btn-secondary" onClick={close}>Cancel</button><button className="btn-primary" disabled={loading}>{loading ? "Creating…" : "Create access"}</button></div>
    </form>}
  </div></div>;
}
