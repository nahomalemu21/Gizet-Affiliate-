import { CopyButton } from "@/components/CopyButton";
import { Icon } from "@/components/Icons";
import { PageHeader } from "@/components/UI";
import { requireSession } from "@/lib/auth";
import { getCreator, listProducts } from "@/lib/data";
import { formatEtb } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CreatorProducts() {
  const session=await requireSession("creator"); if(!session.creatorId) throw new Error("Creator profile missing");
  const [creator,products]=await Promise.all([getCreator(session.creatorId),listProducts(true)]); if(!creator) throw new Error("Creator not found");
  const appUrl=process.env.APP_URL||process.env.NEXT_PUBLIC_APP_URL||"https://gizet-affiliate.vercel.app";
  return <div className="page-wrap"><PageHeader eyebrow="Product marketplace" title="Choose products worth posting." subtitle="Every product shows your exact payout for a successfully delivered order."/><div className="toolbar"><div className="search-box"><Icon name="search" size={16}/><input placeholder="Search products or categories"/></div></div><div className="product-grid">{products.map(product=>{const rate=Number(product.commission_rate||creator.commission_rate);const payout=product.price*rate/100;return <article className="product-card" key={product.id}><div className="product-visual" style={product.image_url?{backgroundImage:`url(${product.image_url})`,backgroundSize:"cover",backgroundPosition:"center"}:undefined}>{!product.image_url&&<span>{product.title.slice(0,3).toUpperCase()}</span>}</div><div className="product-content"><div className="product-meta"><span>{product.category||"Gizet"}</span><span>{product.stock} in stock</span></div><h2>{product.title}</h2><div className="product-price">{formatEtb(product.price)}</div><div className="commission-box"><div><span>You earn</span><strong>{formatEtb(payout)}</strong></div><div><span>Rate</span><strong>{rate}%</strong></div></div><CopyButton value={`${appUrl}/c/${creator.handle}/${product.slug}`} label="Copy affiliate link"/></div></article>})}{products.length===0&&<div className="panel"><strong>No products synced yet.</strong><p>Ask Gizet admin to sync Shopify products.</p></div>}</div></div>;
}
