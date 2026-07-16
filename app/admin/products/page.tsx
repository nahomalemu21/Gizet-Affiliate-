import { SyncProductsButton } from "@/components/admin/SyncProductsButton";
import { Icon } from "@/components/Icons";
import { PageHeader } from "@/components/UI";
import { listProducts } from "@/lib/data";
import { formatEtb } from "@/lib/format";

export const dynamic="force-dynamic";
export default async function AdminProducts(){const products=await listProducts(false);return <div className="page-wrap"><PageHeader eyebrow="Commission catalog" title="Control the economics product by product." subtitle="Shopify products sync here. Default affiliate commission starts at 7%." action={<SyncProductsButton/>}/><div className="table-card"><table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Creator rate</th><th>Payout/order</th><th>Stock</th><th>Status</th></tr></thead><tbody>{products.map(p=><tr key={p.id}><td><div className="table-product"><div className="product-badge small">{p.title.slice(0,2).toUpperCase()}</div><strong>{p.title}</strong></div></td><td>{p.category||"—"}</td><td>{formatEtb(p.price)}</td><td className="money-cell">{p.commission_rate}%</td><td>{formatEtb(p.price*p.commission_rate/100)}</td><td>{p.stock}</td><td>{p.active?"Active":"Paused"}</td></tr>)}</tbody></table></div><div className="margin-warning"><Icon name="shield"/><div><strong>Margin guardrail</strong><span>Review products above 7% carefully because Gizet’s store margin is around 18% before operating costs.</span></div></div></div>}
