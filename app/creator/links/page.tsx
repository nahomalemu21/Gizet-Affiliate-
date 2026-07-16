import { products } from "@/lib/demo-data";
import { PageHeader } from "@/components/UI";
import { CopyButton } from "@/components/CopyButton";
import { Icon } from "@/components/Icons";

export default function CreatorLinks() {
  const mainLink = "https://gizet.com/c/hana";
  return <div className="page-wrap"><PageHeader eyebrow="Tracking center" title="Links that do not lose your sales." subtitle="Gizet stores your creator ID in the browser, Shopify cart and final order."/>
    <section className="link-hero"><div><div className="link-label">Your main creator link</div><div className="main-link">{mainLink}</div><p>Use this in your TikTok or Instagram bio. It tracks all eligible products for 30 days.</p></div><CopyButton value={mainLink}/></section>
    <div className="link-grid">
      <section className="panel"><div className="panel-head"><div><h2>Your discount code</h2><p>Backup attribution when links are shared or cookies are cleared.</p></div></div><div className="code-card"><strong>HANA</strong><CopyButton value="HANA"/></div><div className="info-note"><Icon name="shield" size={17}/><span>Manual code entry wins over link attribution.</span></div></section>
      <section className="panel"><div className="panel-head"><div><h2>Tracking health</h2><p>All required tracking layers are active.</p></div></div><div className="health-list"><div><Icon name="check"/><span>First-party affiliate cookie</span><strong>Active</strong></div><div><Icon name="check"/><span>Shopify cart attributes</span><strong>Active</strong></div><div><Icon name="check"/><span>Discount-code fallback</span><strong>Active</strong></div><div><Icon name="check"/><span>Server-side order record</span><strong>Active</strong></div></div></section>
    </div>
    <section className="panel"><div className="panel-head"><div><h2>Product-specific links</h2><p>Send followers directly to the product from your video.</p></div></div><div className="link-list">{products.map(product=>{const link=`https://gizet.com/c/hana/${product.slug}`;return <div className="link-row" key={product.id}><div className="product-badge small">{product.image}</div><div><strong>{product.title}</strong><span>{link}</span></div><CopyButton value={link}/></div>})}</div></section>
  </div>;
}
