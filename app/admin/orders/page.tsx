import { orders } from "@/lib/demo-data";
import { formatEtb } from "@/lib/format";
import { Icon } from "@/components/Icons";
import { PageHeader, StatusPill } from "@/components/UI";

export default function AdminOrders() {
  return <div className="page-wrap"><PageHeader eyebrow="Order attribution" title="Audit every creator sale." subtitle="The creator ID is locked when the Shopify order is created, with manual correction available for exceptions."/>
  <div className="toolbar"><div className="search-box"><Icon name="search" size={16}/><input placeholder="Search order, creator or code"/></div><button className="btn-secondary"><Icon name="filter" size={15}/> Needs review</button></div>
  <div className="table-card"><table><thead><tr><th>Order</th><th>Creator</th><th>Product</th><th>Attribution</th><th>Status</th><th>Value</th><th>Commission</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td><strong>{o.id}</strong><span>{o.date}</span></td><td>{o.creator}</td><td>{o.product}</td><td>{o.source}</td><td><StatusPill status={o.status}/></td><td>{formatEtb(o.amount)}</td><td className="money-cell">{o.commission?formatEtb(o.commission):"—"}</td></tr>)}</tbody></table></div>
  </div>;
}
