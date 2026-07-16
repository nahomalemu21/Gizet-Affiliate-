import { currentCreator, payouts } from "@/lib/demo-data";
import { formatEtb } from "@/lib/format";
import { Icon } from "@/components/Icons";
import { PageHeader, StatCard, StatusPill } from "@/components/UI";

export default function CreatorPayouts() {
  const own = payouts.filter(p=>p.creator===currentCreator.name);
  return <div className="page-wrap"><PageHeader eyebrow="Creator wallet" title="Payouts you can trust." subtitle="Only delivered, non-returned orders are included in the available balance." action={<button className="btn-primary"><Icon name="wallet" size={16}/> Request {formatEtb(currentCreator.availableEarnings)}</button>}/>
  <section className="stats-grid three"><StatCard label="Available" value={formatEtb(currentCreator.availableEarnings)} hint="Ready to withdraw" icon="wallet" tone="lime"/><StatCard label="Pending" value={formatEtb(currentCreator.pendingEarnings)} hint="Waiting for delivery" icon="clock" tone="amber"/><StatCard label="Payout method" value="Bank transfer" hint="Ending in 2041" icon="shield" tone="blue"/></section>
  <section className="panel"><div className="panel-head"><div><h2>Payout history</h2><p>Each payment is tied to a fixed group of delivered orders.</p></div></div><div className="table-card embedded"><table><thead><tr><th>Payout</th><th>Date</th><th>Orders</th><th>Method</th><th>Status</th><th>Amount</th></tr></thead><tbody>{own.map(p=><tr key={p.id}><td><strong>{p.id}</strong></td><td>{p.date}</td><td>{p.orders}</td><td>{p.method}</td><td><StatusPill status={p.status}/></td><td className="money-cell">{formatEtb(p.amount)}</td></tr>)}</tbody></table></div></section>
  </div>;
}
