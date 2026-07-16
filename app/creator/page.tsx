import Link from "next/link";
import { Icon } from "@/components/Icons";
import { PageHeader, StatCard, StatusPill } from "@/components/UI";
import { requireSession } from "@/lib/auth";
import { getCreator, listOrders, listProducts } from "@/lib/data";
import { formatEtb } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CreatorDashboard() {
  const session = await requireSession("creator");
  if (!session.creatorId) throw new Error("Creator account is not linked correctly");
  const [creator, orders, products] = await Promise.all([getCreator(session.creatorId), listOrders(session.creatorId), listProducts(true)]);
  if (!creator) throw new Error("Creator profile not found");
  const delivered = orders.filter((order) => order.order_status === "delivered");
  const deliveredRevenue = delivered.reduce((sum, order) => sum + order.eligible_revenue, 0);
  const rate = Number(creator.commission_rate);
  const nextThreshold = rate < 8 ? 5 : rate < 9 ? 15 : 30;
  const remaining = Math.max(0, nextThreshold - Number(creator.delivered_orders || 0));
  const progress = Math.min(100, Math.round(Number(creator.delivered_orders || 0) / nextThreshold * 100));

  return <div className="page-wrap"><PageHeader eyebrow="Creator command center" title={`Welcome back, ${creator.name.split(" ")[0]}.`} subtitle="Your real earnings, attributed orders and product links." action={<Link href="/creator/products" className="btn-primary"><Icon name="products" size={16}/> Find products</Link>}/>
    <section className="creator-hero"><div><div className="hero-kicker"><Icon name="wallet" size={15}/> Available to withdraw</div><div className="hero-amount">{formatEtb(Number(creator.available_earnings || 0))}</div><p>{formatEtb(Number(creator.pending_earnings || 0))} is pending until orders are delivered.</p><div className="hero-actions"><Link href="/creator/payouts" className="btn-lime">View payouts <Icon name="arrow" size={15}/></Link><Link href="/creator/links" className="btn-ghost">Share your link</Link></div></div><div className="tier-card"><div className="tier-head"><span>{creator.tier} tier</span><strong>{rate}%</strong></div><div className="progress-track"><div style={{width:`${progress}%`}}/></div><p>{rate >= 10 ? <strong>Top commission tier unlocked.</strong> : <><strong>{remaining} more delivered orders</strong> to unlock {Math.min(10,rate+1)}% commission.</>}</p><div className="tier-scale"><span>7%</span><span>8%</span><span>9%</span><span>10%</span></div></div></section>
    <section className="stats-grid"><StatCard label="Delivered orders" value={String(creator.delivered_orders || 0)} hint="All tracked deliveries" icon="check" tone="mint"/><StatCard label="Delivered revenue" value={formatEtb(deliveredRevenue)} hint="Eligible product value" icon="trend" tone="lime"/><StatCard label="Delivery rate" value={`${creator.delivery_rate || 0}%`} hint="Rejected orders do not pay" icon="orders" tone="amber"/><StatCard label="Active products" value={String(products.length)} hint="Ready to promote" icon="products" tone="blue"/></section>
    <section className="dashboard-grid"><div className="panel"><div className="panel-head"><div><h2>Recent attributed orders</h2><p>Commission becomes available after delivery.</p></div><Link href="/creator/orders">View all</Link></div><div className="order-list">{orders.slice(0,5).map(order=><div className="order-row" key={order.id}><div className="order-product"><div className="mini-avatar">{order.order_name.slice(-2)}</div><div><strong>{order.order_name}</strong><span>{order.customer_name || "Customer"} · {new Date(order.attributed_at).toLocaleDateString()}</span></div></div><div className="order-middle"><span>{formatEtb(order.eligible_revenue)}</span><small>{order.source || order.attribution_method}</small></div><div className="order-end"><StatusPill status={order.order_status.replaceAll("_"," ")}/><strong>{order.commission_amount ? `+${formatEtb(order.commission_amount)}` : "—"}</strong></div></div>)}{orders.length===0&&<div className="empty-state"><strong>No attributed orders yet</strong><span>Your first tracked order will appear here.</span></div>}</div></div><div className="panel"><div className="panel-head"><div><h2>Products to promote</h2><p>Exact payout shown per delivered order.</p></div></div><div className="compact-products">{products.slice(0,4).map(product=><div key={product.id} className="compact-product"><div className="product-badge">{product.title.slice(0,2).toUpperCase()}</div><div><strong>{product.title}</strong><span>Earn {formatEtb(product.price*product.commission_rate/100)}</span></div><Link href={`/creator/links?product=${product.slug}`}><Icon name="arrow" size={16}/></Link></div>)}</div></div></section>
  </div>;
}
