import { products } from "@/lib/demo-data";
import { formatEtb } from "@/lib/format";
import { Icon } from "@/components/Icons";
import { PageHeader } from "@/components/UI";

export default function AdminProducts() {
  return <div className="page-wrap"><PageHeader eyebrow="Commission catalog" title="Control the economics product by product." subtitle="Set the creator payout based on margin, historical CAC and product conversion." action={<button className="btn-primary"><Icon name="products" size={16}/> Add eligible product</button>}/>
  <div className="table-card"><table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Store margin</th><th>Creator rate</th><th>Payout/order</th><th>Stock</th><th>Conversion</th></tr></thead><tbody>{products.map(p=><tr key={p.id}><td><div className="table-product"><div className="product-badge small">{p.image}</div><strong>{p.title}</strong></div></td><td>{p.category}</td><td>{formatEtb(p.price)}</td><td>18%</td><td className="money-cell">{p.commissionRate}%</td><td>{formatEtb(p.payout)}</td><td>{p.stock}</td><td>{p.conversionRate}%</td></tr>)}</tbody></table></div>
  <div className="margin-warning"><Icon name="shield"/><div><strong>Margin guardrail</strong><span>Products cannot be assigned a commission higher than the remaining safe margin after delivery, discounts and payment costs.</span></div></div>
  </div>;
}
