import { Icon } from "@/components/Icons";
import { PageHeader, StatusPill } from "@/components/UI";
import { requireSession } from "@/lib/auth";
import { listOrders } from "@/lib/data";
import { formatEtb } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CreatorOrders() {
  const session = await requireSession("creator");
  if (!session.creatorId) throw new Error("Creator profile missing");
  const orders = await listOrders(session.creatorId);
  return <div className="page-wrap">
    <PageHeader eyebrow="Order attribution" title="Every order, clearly explained." subtitle="See when commission moves from pending to available."/>
    <div className="toolbar"><div className="search-box"><Icon name="search" size={16}/><input placeholder="Search order"/></div></div>
    <div className="table-card"><table><thead><tr><th>Order</th><th>Customer</th><th>Attribution</th><th>Order value</th><th>Status</th><th>Commission</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><strong>{order.order_name}</strong><span>{new Date(order.attributed_at).toLocaleString()}</span></td><td>{order.customer_name || "—"}</td><td>{order.source || order.attribution_method}</td><td>{formatEtb(order.eligible_revenue)}</td><td><StatusPill status={order.order_status.replaceAll("_", " ")}/></td><td className="money-cell">{order.commission_status === "void" ? "—" : formatEtb(order.commission_amount)}</td></tr>)}</tbody></table></div>
  </div>;
}
