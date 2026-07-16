import Link from "next/link";
import { currentCreator, orders, products } from "@/lib/demo-data";
import { formatEtb } from "@/lib/format";
import { Icon } from "@/components/Icons";
import { PageHeader, StatCard, StatusPill } from "@/components/UI";

export default function CreatorDashboard() {
  const deliveredRevenue = orders.filter((order) => order.status === "Delivered").reduce((sum, order) => sum + order.amount, 0);
  return <div className="page-wrap">
    <PageHeader eyebrow="Creator command center" title={`Welcome back, ${currentCreator.name.split(" ")[0]}.`} subtitle="Your earnings, links and sales performance in one place." action={<Link href="/creator/products" className="btn-primary"><Icon name="products" size={16}/> Find products</Link>}/>

    <section className="creator-hero">
      <div>
        <div className="hero-kicker"><Icon name="wallet" size={15}/> Available to withdraw</div>
        <div className="hero-amount">{formatEtb(currentCreator.availableEarnings)}</div>
        <p>{formatEtb(currentCreator.pendingEarnings)} is pending until orders are delivered.</p>
        <div className="hero-actions"><Link href="/creator/payouts" className="btn-lime">Request payout <Icon name="arrow" size={15}/></Link><Link href="/creator/links" className="btn-ghost">Share your link</Link></div>
      </div>
      <div className="tier-card">
        <div className="tier-head"><span>{currentCreator.tier} tier</span><strong>{currentCreator.commissionRate}%</strong></div>
        <div className="progress-track"><div style={{ width: "60%" }}/></div>
        <p><strong>12 more delivered orders</strong> to unlock 9% commission.</p>
        <div className="tier-scale"><span>7%</span><span>8%</span><span>9%</span><span>10%</span></div>
      </div>
    </section>

    <section className="stats-grid">
      <StatCard label="Delivered orders" value={String(currentCreator.deliveredOrders)} hint="This month" icon="check" tone="mint"/>
      <StatCard label="Delivered revenue" value={formatEtb(deliveredRevenue)} hint="Eligible product value" icon="trend" tone="lime"/>
      <StatCard label="Delivery rate" value={`${currentCreator.deliveryRate}%`} hint="Keep this above 65%" icon="orders" tone="amber"/>
      <StatCard label="Active products" value={String(products.length)} hint="Ready to promote" icon="products" tone="blue"/>
    </section>

    <section className="dashboard-grid">
      <div className="panel">
        <div className="panel-head"><div><h2>Recent attributed orders</h2><p>Commission becomes available after delivery.</p></div><Link href="/creator/orders">View all</Link></div>
        <div className="order-list">
          {orders.slice(0,4).map((order) => <div className="order-row" key={order.id}><div className="order-product"><div className="mini-avatar">{order.product.slice(0,2).toUpperCase()}</div><div><strong>{order.product}</strong><span>{order.id} · {order.date}</span></div></div><div className="order-middle"><span>{formatEtb(order.amount)}</span><small>{order.source}</small></div><div className="order-end"><StatusPill status={order.status}/><strong>{order.commission ? `+${formatEtb(order.commission)}` : "—"}</strong></div></div>)}
        </div>
      </div>
      <div className="panel">
        <div className="panel-head"><div><h2>Top products for you</h2><p>High conversion and strong payouts.</p></div></div>
        <div className="compact-products">{products.filter(p=>p.featured).map(product=><div key={product.id} className="compact-product"><div className="product-badge">{product.image}</div><div><strong>{product.title}</strong><span>Earn {formatEtb(product.payout)} per delivery</span></div><Link href={`/creator/links?product=${product.slug}`}><Icon name="arrow" size={16}/></Link></div>)}</div>
      </div>
    </section>
  </div>;
}
