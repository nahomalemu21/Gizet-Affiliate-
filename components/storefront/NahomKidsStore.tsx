"use client";

import { useMemo, useState } from "react";
import styles from "./NahomKidsStore.module.css";

export type StorefrontProduct = {
  id: string;
  variantId: string;
  title: string;
  handle: string;
  category: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  available: boolean;
};

type CartLine = StorefrontProduct & { quantity: number };

function formatEtb(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value) + " ETB";
}

export function NahomKidsStore({ products, storeUrl }: { products: StorefrontProduct[]; storeUrl: string }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [cartOpen, setCartOpen] = useState(false);

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((product) => product.category)))], [products]);
  const filtered = useMemo(() => products.filter((product) => {
    const matchesCategory = category === "All" || product.category === category;
    const matchesSearch = product.title.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesSearch;
  }), [products, category, query]);
  const lines = Object.values(cart);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  function add(product: StorefrontProduct) {
    setCart((current) => ({
      ...current,
      [product.id]: { ...product, quantity: (current[product.id]?.quantity ?? 0) + 1 },
    }));
  }

  function change(productId: string, amount: number) {
    setCart((current) => {
      const line = current[productId];
      if (!line) return current;
      const nextQuantity = line.quantity + amount;
      if (nextQuantity <= 0) {
        const next = { ...current };
        delete next[productId];
        return next;
      }
      return { ...current, [productId]: { ...line, quantity: nextQuantity } };
    });
  }

  function checkout() {
    const purchasable = lines.filter((line) => line.variantId);
    if (!purchasable.length) {
      window.location.href = `${storeUrl}/collections/children?affiliate_creator=nahom&utm_source=creator&utm_medium=storefront&utm_campaign=nahom`;
      return;
    }
    const cartPath = purchasable.map((line) => `${line.variantId}:${line.quantity}`).join(",");
    const params = new URLSearchParams();
    params.set("checkout", "");
    params.set("attributes[affiliate_creator_id]", "nahom");
    params.set("attributes[affiliate_source]", "creator-storefront");
    params.set("attributes[affiliate_storefront]", "nahom");
    params.set("utm_source", "creator");
    params.set("utm_medium", "storefront");
    params.set("utm_campaign", "nahom");
    window.location.href = `${storeUrl}/cart/${cartPath}?${params.toString()}`;
  }

  const pageUrl = typeof window === "undefined" ? "https://gizet.co/nahom" : window.location.href;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(pageUrl)}`;

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <a className={styles.brand} href={storeUrl}><span className={styles.brandMark}>G</span><strong>Gizet</strong></a>
        <button className={styles.cartButton} onClick={() => setCartOpen(true)} aria-label="Open cart">
          <span>Bag</span><b>{itemCount}</b>
        </button>
      </header>

      <section className={styles.hero}>
        <div className={styles.creatorRow}>
          <div className={styles.avatar}>N</div>
          <div><span className={styles.verified}>Gizet verified creator</span><h1>Nahom’s Kids Picks</h1><p>@nahom · Products I would actually pick for kids and families.</p></div>
        </div>
        <div className={styles.heroMessage}>
          <span>Curated by Nahom</span>
          <h2>Play more. Learn more. Make family time easier.</h2>
          <p>Ten hand-picked kids, baby and entertainment products from Gizet—with fast delivery and Gizet customer support.</p>
          <div className={styles.trustStrip}><span>✓ 24-hour Addis delivery</span><span>✓ Pay on delivery</span><span>✓ Gizet support</span></div>
        </div>
      </section>

      <section className={styles.controls}>
        <label className={styles.search}><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Nahom’s picks" /></label>
        <div className={styles.categories}>{categories.map((item) => <button key={item} className={item === category ? styles.activeCategory : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}><div><span>THE MINI SHOP</span><h2>Nahom’s recommended products</h2></div><p>{filtered.length} products</p></div>
        <div className={styles.grid}>
          {filtered.map((product, index) => (
            <article className={styles.productCard} key={product.id}>
              <a className={styles.imageWrap} href={`${storeUrl}/products/${product.handle}?affiliate_creator=nahom&utm_source=creator&utm_medium=storefront&utm_campaign=nahom`}>
                {product.image ? <img src={product.image} alt={product.title} /> : <div className={styles.imageFallback}>{product.title.slice(0, 2).toUpperCase()}</div>}
                {index < 3 && <span className={styles.pickBadge}>Nahom’s top pick</span>}
                {product.compareAtPrice && product.compareAtPrice > product.price && <span className={styles.saleBadge}>Sale</span>}
              </a>
              <div className={styles.productInfo}>
                <span className={styles.productCategory}>{product.category}</span>
                <a className={styles.productTitle} href={`${storeUrl}/products/${product.handle}?affiliate_creator=nahom&utm_source=creator&utm_medium=storefront&utm_campaign=nahom`}>{product.title}</a>
                <div className={styles.priceRow}><strong>{formatEtb(product.price)}</strong>{product.compareAtPrice && product.compareAtPrice > product.price && <del>{formatEtb(product.compareAtPrice)}</del>}</div>
                <button className={styles.addButton} onClick={() => add(product)} disabled={!product.available}>{product.available ? "+ Add to bag" : "Unavailable"}</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.about}>
        <div><span className={styles.aboutEyebrow}>WHY THIS STORE EXISTS</span><h2>A personal recommendation, backed by Gizet.</h2><p>I choose the products. Gizet handles checkout, delivery, customer support and order tracking.</p></div>
        <div className={styles.aboutCards}><div><b>01</b><strong>Personally selected</strong><span>Only products I chose for this mini-store.</span></div><div><b>02</b><strong>One combined checkout</strong><span>Add several items and buy them together.</span></div><div><b>03</b><strong>Delivered by Gizet</strong><span>Gizet remains responsible for the customer experience.</span></div></div>
      </section>

      <section className={styles.shareCard}>
        <div><span>SHARE THE STORE</span><h2>Scan to open Nahom’s Kids Picks</h2><p>This QR code can be used in videos, posters, events or livestreams.</p><button onClick={() => navigator.clipboard.writeText(pageUrl)}>Copy storefront link</button></div>
        <img src={qrUrl} alt="QR code for Nahom's Gizet storefront" />
      </section>

      <footer className={styles.footer}><div className={styles.brand}><span className={styles.brandMark}>G</span><strong>Gizet</strong></div><p>Creator storefront demo · Delivered and supported by Gizet.</p></footer>

      {itemCount > 0 && <button className={styles.stickyCart} onClick={() => setCartOpen(true)}><span>{itemCount} {itemCount === 1 ? "item" : "items"} · {formatEtb(total)}</span><strong>View bag →</strong></button>}

      {cartOpen && <div className={styles.drawerBackdrop} onClick={() => setCartOpen(false)}><aside className={styles.drawer} onClick={(event) => event.stopPropagation()}>
        <div className={styles.drawerHead}><div><span>NAHOM’S PICKS</span><h2>Your bag</h2></div><button onClick={() => setCartOpen(false)}>×</button></div>
        <div className={styles.drawerLines}>{lines.length === 0 ? <div className={styles.emptyBag}>Your bag is empty.</div> : lines.map((line) => <div className={styles.cartLine} key={line.id}>{line.image ? <img src={line.image} alt="" /> : <div className={styles.cartFallback}>N</div>}<div><strong>{line.title}</strong><span>{formatEtb(line.price)}</span><div className={styles.quantity}><button onClick={() => change(line.id, -1)}>−</button><b>{line.quantity}</b><button onClick={() => change(line.id, 1)}>+</button></div></div></div>)}</div>
        <div className={styles.drawerBottom}><div><span>Total</span><strong>{formatEtb(total)}</strong></div><button onClick={checkout} disabled={!lines.length}>Go directly to checkout</button><p>Affiliate attribution for Nahom is attached automatically.</p></div>
      </aside></div>}
    </main>
  );
}
