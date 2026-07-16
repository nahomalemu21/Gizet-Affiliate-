import { orders } from "@/lib/demo-data";
import { formatEtb } from "@/lib/format";
import { Icon } from "@/components/Icons";
import { PageHeader, StatusPill } from "@/components/UI";

export default function CreatorOrders() {
  return <div className="page-wrap"><PageHeader eyebrow="Order attribution" title="Every order, clearly explained." subtitle="See which link or code generated the order and when commission becomes payable."/>
  <div className="toolbar"><div className="search-box"><Icon name="search" size={16}/><input placeholder="Search order or product"/></div><button className="btn-secondary"><Icon name="filter" size={15}/> All statuses</button></div>
  <div className="table-card"><table><thead><tr><th>Order</th><th>Product</th><th>Source</th><th>Order value</th><th>Status</th><th>Commission</th></tr></thead><tbody>{orders.map(order=><tr key={order.id}><td><strong>{order.id}</strong><span>{order.date}</span></td><td>{order.product}</td><td>{order.source}</td><td>{formatEtb(order.amount)}</td><td><StatusPill status={order.status}/></td><td className="money-cell">{order.commission?formatEtb(order.commission):"—"}</td></tr>)}</tbody></table></div>
  </div>;
}
