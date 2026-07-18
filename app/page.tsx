import Link from "next/link";
import { Icon } from "@/components/Icons";
import { Logo } from "@/components/Logo";
import { readSession } from "@/lib/auth";

export default async function Home() {
  const session = await readSession();
  const dashboard = session?.role === "admin" ? "/admin" : session?.role === "creator" ? "/creator" : "/login";
  return <main className="entry-page"><div className="entry-glow glow-one"/><div className="entry-glow glow-two"/><section className="entry-card"><Logo/><div className="entry-copy"><div className="entry-badge"><Icon name="spark" size={14}/> Gizet creator commerce</div><h1>Turn content into tracked income.</h1><p>Every click, delivered order and payout is recorded without relying on fragile UTM links alone.</p></div><div className="entry-options"><Link href={dashboard} className="entry-option primary"><div className="option-icon"><Icon name="trend"/></div><div><strong>{session ? "Open your dashboard" : "Sign in"}</strong><span>Secure creator and admin access</span></div><Icon name="arrow"/></Link></div><div className="entry-foot"><Icon name="check" size={15}/> Commission is earned only after successful delivery.</div></section></main>;
}
