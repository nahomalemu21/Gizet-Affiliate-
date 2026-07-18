import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { Icon } from "@/components/Icons";
import { PageHeader } from "@/components/UI";
import { requireSession } from "@/lib/auth";
import { getCreator, listCreatorProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function CreatorLinks() {
  const session = await requireSession("creator");
  if (!session.creatorId) throw new Error("Creator profile missing");
  const [creator, products] = await Promise.all([getCreator(session.creatorId), listCreatorProducts(session.creatorId)]);
  if (!creator) throw new Error("Creator not found");

  const base = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "https://gizet-affiliate.vercel.app").replace(/\/$/, "");
  const mainLink = `${base}/${creator.handle}`;

  return <div className="page-wrap">
    <PageHeader eyebrow="Your creator store" title="One bio link for your whole collection." subtitle="Customers can browse several products, build one cart and check out without losing your attribution." action={<Link href={`/${creator.handle}`} className="btn-primary" target="_blank">Open my store</Link>} />
    <section className="link-hero"><div><div className="link-label">Your personal storefront</div><div className="main-link">{mainLink}</div><p>Use this as your TikTok, Instagram or Telegram bio link.</p></div><CopyButton value={mainLink}/></section>
    <div className="link-grid">
      <section className="panel"><div className="panel-head"><div><h2>Your discount code</h2><p>Backup attribution when someone types your code manually.</p></div></div><div className="code-card"><strong>{creator.discount_code || creator.handle.toUpperCase()}</strong><CopyButton value={creator.discount_code || creator.handle.toUpperCase()}/></div></section>
      <section className="panel"><div className="panel-head"><div><h2>Tracking health</h2><p>The live attribution layers.</p></div></div><div className="health-list"><div><Icon name="check"/><span>Storefront click ID</span><strong>Active</strong></div><div><Icon name="check"/><span>First-party creator cookie</span><strong>Active</strong></div><div><Icon name="check"/><span>Shopify cart attributes</span><strong>Active</strong></div><div><Icon name="check"/><span>Server-side order record</span><strong>Active</strong></div></div></section>
    </div>
    <section className="panel"><div className="panel-head"><div><h2>Product-specific links</h2><p>Only products currently selected for your storefront are shown here.</p></div></div><div className="link-list">{products.map((product) => { const link = `${base}/c/${creator.handle}/${product.slug}`; return <div className="link-row" key={product.id}><div className="product-badge small">{product.title.slice(0,2).toUpperCase()}</div><div><strong>{product.title}</strong><span>{link}</span></div><CopyButton value={link}/></div>; })}{products.length === 0 && <div className="empty-state"><strong>Your store has no products yet.</strong><span>Add products from the Products tab first.</span></div>}</div></section>
  </div>;
}
