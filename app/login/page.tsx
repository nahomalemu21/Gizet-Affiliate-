import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { Logo } from "@/components/Logo";
import { readSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await readSession();
  if (session) redirect(session.role === "admin" ? "/admin" : "/creator");
  return <main className="entry-page"><section className="entry-card login-card"><Logo/><div className="entry-copy"><div className="entry-badge">Gizet Affiliate Portal</div><h1>Sign in to your earnings.</h1><p>Creators see their tracked sales and payouts. Gizet admins manage commissions and delivery status.</p></div><Suspense><LoginForm/></Suspense></section></main>;
}
