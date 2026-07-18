import { CreateCreatorForm } from "@/components/admin/CreateCreatorForm";
import { CreatePayoutButton } from "@/components/admin/CreatePayoutButton";
import { Icon } from "@/components/Icons";
import { PageHeader, StatusPill } from "@/components/UI";
import { listCreators } from "@/lib/data";
import { compactNumber, formatEtb } from "@/lib/format";

export const dynamic="force-dynamic";
export default async function AdminCreators(){const creators=await listCreators();return <div className="page-wrap"><PageHeader eyebrow="Creator management" title="Manage creators who can sell." subtitle="Create logins, assign rates and turn delivered earnings into payouts." action={<CreateCreatorForm/>}/><div className="toolbar"><div className="search-box"><Icon name="search" size={16}/><input placeholder="Search creators"/></div></div><div className="table-card"><table><thead><tr><th>Creator</th><th>Audience</th><th>Tier</th><th>Delivered</th><th>Delivery rate</th><th>Commission</th><th>Available</th><th>Status</th><th>Action</th></tr></thead><tbody>{creators.map(c=><tr key={c.id}><td><div className="table-person"><div className="creator-avatar">{c.name.split(" ").map(n=>n[0]).join("")}</div><div><strong>{c.name}</strong><span>@{c.handle}</span></div></div></td><td>{compactNumber(c.followers)} · {c.platform}</td><td>{c.tier}</td><td>{c.delivered_orders||0}</td><td>{c.delivery_rate||0}%</td><td className="money-cell">{c.commission_rate}%</td><td>{formatEtb(Number(c.available_earnings||0))}</td><td><StatusPill status={c.status}/></td><td><CreatePayoutButton creatorId={c.id}/></td></tr>)}</tbody></table></div></div>}
