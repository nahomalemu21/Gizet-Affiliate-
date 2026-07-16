import { PageHeader, StatCard, StatusPill } from "@/components/UI";
import { requireSession } from "@/lib/auth";
import { getCreator, listPayouts } from "@/lib/data";
import { formatEtb } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CreatorPayouts() {
  const session = await requireSession("creator");
  if (!session.creatorId) throw new Error("Creator profile missing");
  const [creator, payouts] = await Promise.all([getCreator(session.creatorId), listPayouts(session.creatorId)]);
  if (!creator) throw new Error("Creator not found");
  return <div className="page-wrap">
    <PageHeader eyebrow="Creator wallet" title="Payouts you can trust." subtitle="Only delivered, non-returned orders are included in your available balance."/>
    <section className="stats-grid three"><StatCard label="Available" value={formatEtb(Number(creator.available_earnings || 0))} hint="Ready for next payout" icon="wallet" tone="lime"/><StatCard label="Pending" value={formatEtb(Number(creator.pending_earnings || 0))} hint="Waiting for delivery" icon="clock" tone="amber"/><StatCard label="Payout method" value={creator.payout_method || "Not set"} hint={creator.payout_details || "Contact Gizet admin"} icon="shield" tone="blue"/></section>
    <section className="panel"><div className="panel-head"><div><h2>Payout history</h2><p>Each payment is tied to delivered orders.</p></div></div><div className="table-card embedded"><table><thead><tr><th>Payout</th><th>Date</th><th>Orders</th><th>Method</th><th>Status</th><th>Amount</th></tr></thead><tbody>{payouts.map((payout) => <tr key={payout.id}><td><strong>{payout.id}</strong></td><td>{new Date(payout.created_at).toLocaleDateString()}</td><td>{payout.order_count}</td><td>{payout.method || "—"}</td><td><StatusPill status={payout.status}/></td><td className="money-cell">{formatEtb(payout.amount)}</td></tr>)}</tbody></table></div></section>
  </div>;
}
