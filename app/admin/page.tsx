import Link from "next/link";
import { creators, orders, payouts } from "@/lib/demo-data";
import { formatEtb } from "@/lib/format";
import { Icon } from "@/components/Icons";
import { PageHeader, StatCard, StatusPill } from "@/components/UI";

export default function AdminDashboard() {
  const revenue = orders.filter(o=>o.status==="Delivered").reduce((s,o)=>s+o.amount,0);
  const liability = creators.reduce((s,c)=>s+c.availableEarnings,0);
  return <div className="page-wrap"><PageHeader eyebrow="Gizet affiliate operations" title="Creator sales, under control." subtitle="Manage attribution, delivery-adjusted commissions and payouts from one place." action={<Link href="/admin/creators" className="btn-primary"><Icon name="users" size={16}/> Add creator</Link>}/>
  <section className="admin-hero"><div><div className="hero-kicker"><Icon name="trend" size={15}/> Affiliate delivered revenue</div><div className="hero-amount">{formatEtb(revenue)}</div><p>Commission is calculated only on delivered eligible product revenue.</p></div><div className="admin-hero-metrics"><div><span>Base rate</span><strong>7%</strong></div><div><span>Maximum rate</span><strong>10%</strong></div><div><span>Store margin</span><strong>18%</strong></div></div></section>
  <section className="stats-grid"><StatCard label="Active creators" value={String(creators.filter(c=>c.status==="Active").length)} hint={`${creators.length} total creators`} icon="users" tone="mint"/><StatCard label="Payout liability" value={formatEtb(liability)} hint="Approved delivered earnings" icon="wallet" tone="amber"/><StatCard label="Pending payouts" value={String(payouts.filter(p=>p.status==="Pending").length)} hint="Needs admin review" icon="clock" tone="blue"/><StatCard label="Avg delivery rate" value="71%" hint="Across active creators" icon="check" tone="lime"/></section>
  <section className="dashboard-grid"><div className="panel"><div className="panel-head"><div><h2>Creator performance</h2><p>Ranked by delivered orders.</p></div><Link href="/admin/creators">Manage</Link></div><div className="creator-list">{[...creators].sort((a,b)=>b.deliveredOrders-a.deliveredOrders).slice(0,4).map(c=><div className="creator-row" key={c.id}><div className="creator-avatar">{c.name.split(" ").map(n=>n[0]).join("")}</div><div><strong>{c.name}</strong><span>{c.handle} · {c.tier}</span></div><div><strong>{c.deliveredOrders}</strong><span>delivered</span></div><div><strong>{c.commissionRate}%</strong><span>rate</span></div><StatusPill status={c.status}/></div>)}</div></div>
  <div className="panel"><div className="panel-head"><div><h2>Attribution health</h2><p>Last 30 days.</p></div></div><div className="health-score"><div className="score-ring">96<span>%</span></div><div><strong>Tracking is healthy</strong><p>4 orders need manual attribution review.</p></div></div><div className="health-list compact"><div><span>Orders with creator ID</span><strong>98.4%</strong></div><div><span>Orders with click ID</span><strong>95.7%</strong></div><div><span>Code-only attribution</span><strong>8.2%</strong></div><div><span>Manual corrections</span><strong>1.1%</strong></div></div></div></section>
  </div>;
}
