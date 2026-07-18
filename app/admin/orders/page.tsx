import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { Icon } from "@/components/Icons";
import { PageHeader } from "@/components/UI";
import { listOrders } from "@/lib/data";
import { formatEtb } from "@/lib/format";

export const dynamic="force-dynamic";
export default async function AdminOrders(){const orders=await listOrders();return <div className="page-wrap"><PageHeader eyebrow="Order attribution" title="Audit every creator sale." subtitle="Mark orders delivered here to release the creator commission."/><div className="toolbar"><div className="search-box"><Icon name="search" size={16}/><input placeholder="Search order or creator"/></div></div><div className="table-card"><table><thead><tr><th>Order</th><th>Creator</th><th>Customer</th><th>Attribution</th><th>Status</th><th>Value</th><th>Commission</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td><strong>{o.order_name}</strong><span>{new Date(o.attributed_at).toLocaleString()}</span></td><td>{o.creator_name||"Unattributed"}</td><td>{o.customer_name||"—"}</td><td>{o.source||o.attribution_method}</td><td><OrderStatusSelect id={o.id} status={o.order_status}/></td><td>{formatEtb(o.eligible_revenue)}</td><td className="money-cell">{o.commission_status==="void"?"—":formatEtb(o.commission_amount)}</td></tr>)}</tbody></table></div></div>}
