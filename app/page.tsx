import Link from "next/link";
import { Icon } from "@/components/Icons";
import { Logo } from "@/components/Logo";

export default function Home() {
  return (
    <main className="entry-page">
      <div className="entry-glow glow-one"/><div className="entry-glow glow-two"/>
      <section className="entry-card">
        <Logo />
        <div className="entry-copy">
          <div className="entry-badge"><Icon name="spark" size={14}/> Built for Gizet creators</div>
          <h1>Turn content into a real monthly income.</h1>
          <p>Track every click, delivered order and payout without relying on fragile UTM links.</p>
        </div>
        <div className="entry-options">
          <Link href="/creator" className="entry-option primary"><div className="option-icon"><Icon name="trend"/></div><div><strong>Creator portal</strong><span>Links, products, earnings and payouts</span></div><Icon name="arrow"/></Link>
          <Link href="/admin" className="entry-option"><div className="option-icon"><Icon name="shield"/></div><div><strong>Gizet admin</strong><span>Creators, commissions and order attribution</span></div><Icon name="arrow"/></Link>
        </div>
        <div className="entry-foot"><Icon name="check" size={15}/> Demo data is included. Shopify connection is environment-ready.</div>
      </section>
    </main>
  );
}
