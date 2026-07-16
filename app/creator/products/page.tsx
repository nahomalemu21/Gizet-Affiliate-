import { products } from "@/lib/demo-data";
import { formatEtb } from "@/lib/format";
import { Icon } from "@/components/Icons";
import { PageHeader } from "@/components/UI";
import { CopyButton } from "@/components/CopyButton";

export default function CreatorProducts() {
  return <div className="page-wrap"><PageHeader eyebrow="Product marketplace" title="Choose products worth posting." subtitle="Every product shows the exact ETB payout for a successfully delivered order."/>
    <div className="toolbar"><div className="search-box"><Icon name="search" size={16}/><input placeholder="Search products or categories"/></div><button className="btn-secondary"><Icon name="filter" size={15}/> Filters</button></div>
    <div className="product-grid">{products.map((product)=><article className="product-card" key={product.id}><div className="product-visual"><span>{product.image}</span>{product.featured&&<div className="featured-chip"><Icon name="spark" size={12}/> Recommended</div>}</div><div className="product-content"><div className="product-meta"><span>{product.category}</span><span>{product.stock} in stock</span></div><h2>{product.title}</h2><div className="product-price">{formatEtb(product.price)}</div><div className="commission-box"><div><span>You earn</span><strong>{formatEtb(product.payout)}</strong></div><div><span>Rate</span><strong>{product.commissionRate}%</strong></div></div><div className="product-performance"><span>Conversion</span><strong>{product.conversionRate}%</strong></div><CopyButton value={`https://gizet.com/c/hana/${product.slug}`} label="Copy affiliate link"/></div></article>)}</div>
  </div>;
}
