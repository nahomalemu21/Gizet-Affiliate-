import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { Logo } from "@/components/Logo";
import { readSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await readSession();
  if (session) redirect(session.role === "admin" ? "/admin" : "/creator");
  return <main className="entry-page"><section className="entry-card login-card"><Logo/><div className="entry-copy"><div className="entry-badge">Gizet Creator Access</div><h1>Your earnings, one tap away.</h1><p>Open your creator link and enter a 4-digit PIN. Gizet remembers your device for 30 days.</p></div><Suspense><LoginForm/></Suspense></section></main>;
}
