import { creators } from "@/lib/demo-data";
import { compactNumber, formatEtb } from "@/lib/format";
import { Icon } from "@/components/Icons";
import { PageHeader, StatusPill } from "@/components/UI";

export default function AdminCreators() {
  return <div className="page-wrap"><PageHeader eyebrow="Creator management" title="Find who can actually sell." subtitle="Follower count matters less than delivered orders, delivery rate and content consistency." action={<button className="btn-primary"><Icon name="users" size={16}/> Invite creator</button>}/>
  <div className="toolbar"><div className="search-box"><Icon name="search" size={16}/><input placeholder="Search creators"/></div><button className="btn-secondary"><Icon name="filter" size={15}/> All tiers</button></div>
  <div className="table-card"><table><thead><tr><th>Creator</th><th>Audience</th><th>Tier</th><th>Delivered</th><th>Delivery rate</th><th>Commission</th><th>Available</th><th>Status</th></tr></thead><tbody>{creators.map(c=><tr key={c.id}><td><div className="table-person"><div className="creator-avatar">{c.name.split(" ").map(n=>n[0]).join("")}</div><div><strong>{c.name}</strong><span>{c.handle}</span></div></div></td><td>{compactNumber(c.followers)} · {c.platform}</td><td>{c.tier}</td><td>{c.deliveredOrders}</td><td>{c.deliveryRate}%</td><td className="money-cell">{c.commissionRate}%</td><td>{formatEtb(c.availableEarnings)}</td><td><StatusPill status={c.status}/></td></tr>)}</tbody></table></div>
  </div>;
}
