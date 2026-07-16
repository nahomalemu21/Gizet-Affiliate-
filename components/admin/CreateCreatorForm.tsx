"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateCreatorForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    setOpen(false); router.refresh();
  }

  if (!open) return <button className="btn-primary" onClick={() => setOpen(true)}>Invite creator</button>;
  return <div className="modal-backdrop"><div className="modal-card"><div className="panel-head"><div><h2>Create creator account</h2><p>They can log in immediately with the password you set.</p></div><button className="icon-button" onClick={() => setOpen(false)}>×</button></div><form className="admin-form" onSubmit={submit}>
    <label>Name<input name="name" required /></label><label>Handle<input name="handle" required placeholder="hanalifestyle" /></label>
    <label>Email<input name="email" type="email" required /></label><label>Temporary password<input name="password" type="password" minLength={8} required /></label>
    <label>Platform<select name="platform" defaultValue="TikTok"><option>TikTok</option><option>Instagram</option><option>YouTube</option></select></label>
    <label>Followers<input name="followers" type="number" min="0" defaultValue="0" /></label>
    <label>Commission %<input name="commissionRate" type="number" min="1" max="10" step="0.5" defaultValue="7" /></label>
    <label>Discount code<input name="discountCode" required placeholder="HANA" /></label>
    {error && <div className="form-error form-wide">{error}</div>}
    <div className="form-actions form-wide"><button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" disabled={loading}>{loading ? "Creating…" : "Create account"}</button></div>
  </form></div></div>;
}
