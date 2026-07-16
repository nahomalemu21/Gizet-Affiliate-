import { CopyButton } from "@/components/CopyButton";
import { Icon } from "@/components/Icons";
import { PageHeader } from "@/components/UI";
import { requireSession } from "@/lib/auth";
import { getCreator, listProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function CreatorLinks() {
  const session = await requireSession("creator");
  if (!session.creatorId) throw new Error("Creator profile missing");
  const [creator, products] = await Promise.all([getCreator(session.creatorId), listProducts(true)]);
  if (!creator) throw new Error("Creator not found");
  const base = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "https://gizet-affiliate.vercel.app";
  const mainLink = `${base}/c/${creator.handle}`;
  return <div className="page-wrap">
    <PageHeader eyebrow="Tracking center" title="Links that keep your attribution." subtitle="The creator ID is preserved in the Gizet cart and final Shopify order."/>
    <section className="link-hero"><div><div className="link-label">Your main creator link</div><div className="main-link">{mainLink}</div><p>Use this in your TikTok or Instagram bio.</p></div><CopyButton value={mainLink}/></section>
    <div className="link-grid">
      <section className="panel"><div className="panel-head"><div><h2>Your discount code</h2><p>Backup attribution when a link is shared.</p></div></div><div className="code-card"><strong>{creator.discount_code || creator.handle.toUpperCase()}</strong><CopyButton value={creator.discount_code || creator.handle.toUpperCase()}/></div></section>
      <section className="panel"><div className="panel-head"><div><h2>Tracking health</h2><p>The live attribution layers.</p></div></div><div className="health-list"><div><Icon name="check"/><span>Unique click ID</span><strong>Active</strong></div><div><Icon name="check"/><span>Shopify cart attributes</span><strong>Theme script required</strong></div><div><Icon name="check"/><span>Discount-code fallback</span><strong>Active</strong></div><div><Icon name="check"/><span>Server-side order record</span><strong>Active</strong></div></div></section>
    </div>
    <section className="panel"><div className="panel-head"><div><h2>Product-specific links</h2><p>Send followers directly to the product.</p></div></div><div className="link-list">{products.map((product) => { const link = `${base}/c/${creator.handle}/${product.slug}`; return <div className="link-row" key={product.id}><div className="product-badge small">{product.title.slice(0,2).toUpperCase()}</div><div><strong>{product.title}</strong><span>{link}</span></div><CopyButton value={link}/></div>; })}</div></section>
  </div>;
}
