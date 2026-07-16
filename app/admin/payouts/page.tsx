import { payouts } from "@/lib/demo-data";
import { formatEtb } from "@/lib/format";
import { Icon } from "@/components/Icons";
import { PageHeader, StatusPill } from "@/components/UI";

export default function AdminPayouts() {
  const pending = payouts.filter(p=>p.status!=="Paid").reduce((s,p)=>s+p.amount,0);
  return <div className="page-wrap"><PageHeader eyebrow="Finance control" title="Approve clean, auditable payouts." subtitle="Each payout is backed by delivered orders and excludes rejected, cancelled and returned orders." action={<button className="btn-primary"><Icon name="check" size={16}/> Approve selected</button>}/>
  <section className="admin-hero slim"><div><div className="hero-kicker"><Icon name="wallet" size={15}/> Outstanding creator payouts</div><div className="hero-amount">{formatEtb(pending)}</div></div><div className="admin-hero-metrics"><div><span>Schedule</span><strong>Twice monthly</strong></div><div><span>Minimum</span><strong>1,000 ETB</strong></div></div></section>
  <div className="table-card"><table><thead><tr><th>Payout</th><th>Creator</th><th>Date</th><th>Orders</th><th>Method</th><th>Status</th><th>Amount</th></tr></thead><tbody>{payouts.map(p=><tr key={p.id}><td><strong>{p.id}</strong></td><td>{p.creator}</td><td>{p.date}</td><td>{p.orders}</td><td>{p.method}</td><td><StatusPill status={p.status}/></td><td className="money-cell">{formatEtb(p.amount)}</td></tr>)}</tbody></table></div>
  </div>;
}
