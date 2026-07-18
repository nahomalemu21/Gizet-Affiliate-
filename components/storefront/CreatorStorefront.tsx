"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./CreatorStorefront.module.css";

type Creator = {
  id: string;
  name: string;
  handle: string;
  platform: string;
  followers: number;
  storefront_title: string | null;
  storefront_bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  discount_code: string | null;
};

type Product = {
  id: string;
  shopify_variant_id: string | null;
  title: string;
  slug: string;
  category: string | null;
  image_url: string | null;
  price: number;
  stock: number;
  featured?: boolean;
};

type Cart = Record<string, number>;

function money(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value) + " ETB";
}

export function CreatorStorefront({ creator, products, storeUrl }: {
  creator: Creator;
  products: Product[];
  storeUrl: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<Cart>({});
  const [clickId, setClickId] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    const storageKey = `gizet_creator_click_${creator.handle}`;
    const existing = window.localStorage.getItem(storageKey);
    if (existing) setClickId(existing);

    fetch("/api/affiliate/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creator: creator.handle, source: "storefront" }),
    }).then(async (response) => {
      if (!response.ok) return;
      const body = await response.json();
      if (body.clickId) {
        setClickId(body.clickId);
        window.localStorage.setItem(storageKey, body.clickId);
        window.localStorage.setItem("gizet_affiliate_creator", creator.id);
        window.localStorage.setItem("gizet_affiliate_click", body.clickId);
      }
    }).catch(() => {});
  }, [creator.handle, creator.id]);

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((product) => product.category || "Other")))], [products]);
  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter((product) => {
      if (category !== "All" && (product.category || "Other") !== category) return false;
      if (!term) return true;
      return product.title.toLowerCase().includes(term) || (product.category || "").toLowerCase().includes(term);
    });
  }, [products, query, category]);

  const quantities = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const total = products.reduce((sum, product) => sum + Number(product.price) * (cart[product.id] || 0), 0);

  function add(productId: string) {
    setCart((current) => ({ ...current, [productId]: (current[productId] || 0) + 1 }));
  }

  function remove(productId: string) {
    setCart((current) => {
      const next = { ...current };
      if ((next[productId] || 0) <= 1) delete next[productId];
      else next[productId] -= 1;
      return next;
    });
  }

  function checkout() {
    const items = products.flatMap((product) => {
      const quantity = cart[product.id] || 0;
      const variantId = product.shopify_variant_id?.split("/").pop();
      return quantity > 0 && variantId ? [`${variantId}:${quantity}`] : [];
    });
    if (!items.length) return;

    setCheckingOut(true);
    const params = new URLSearchParams();
    params.set("attributes[affiliate_creator_id]", creator.id);
    params.set("attributes[affiliate_creator_handle]", creator.handle);
    params.set("attributes[affiliate_click_id]", clickId);
    params.set("attributes[affiliate_source]", "creator-storefront");
    if (creator.discount_code) params.set("discount", creator.discount_code);
    window.location.href = `${storeUrl.replace(/\/$/, "")}/cart/${items.join(",")}?checkout&${params.toString()}`;
  }

  async function shareStore() {
    const data = { title: creator.storefront_title || `${creator.name}'s Picks`, text: creator.storefront_bio || `Shop ${creator.name}'s recommended products on Gizet.`, url: window.location.href };
    if (navigator.share) await navigator.share(data).catch(() => {});
    else await navigator.clipboard.writeText(window.location.href);
  }

  return <main className={styles.page}>
    <header className={styles.topbar}>
      <a href="https://gizet.co" className={styles.brand}><span>G</span><strong>Gizet</strong></a>
      <button className={styles.share} onClick={shareStore}>Share store</button>
    </header>

    <section className={styles.hero} style={creator.banner_url ? { backgroundImage: `linear-gradient(90deg, rgba(5,37,32,.94), rgba(5,37,32,.68)), url(${creator.banner_url})` } : undefined}>
      <div className={styles.profile}>
        <div className={styles.avatar} style={creator.avatar_url ? { backgroundImage: `url(${creator.avatar_url})` } : undefined}>
          {!creator.avatar_url && creator.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
        </div>
        <div>
          <div className={styles.verified}>Verified Gizet creator</div>
          <h1>{creator.storefront_title || `${creator.name}'s Picks`}</h1>
          <p>{creator.storefront_bio || `Products selected by ${creator.name}, fulfilled and delivered by Gizet.`}</p>
          <div className={styles.creatorMeta}>@{creator.handle} · {creator.platform}{creator.followers ? ` · ${new Intl.NumberFormat("en-US", { notation: "compact" }).format(creator.followers)} followers` : ""}</div>
        </div>
      </div>
      <div className={styles.trustRow}><span>Same-day Addis delivery</span><span>Gizet checkout</span><span>Order support</span></div>
    </section>

    <section className={styles.controls}>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${creator.name}'s products`} />
      <div className={styles.categories}>{categories.map((item) => <button key={item} className={item === category ? styles.activeCategory : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
    </section>

    <section className={styles.content}>
      <div className={styles.sectionHeading}><div><span>Creator collection</span><h2>{visible.length} recommended products</h2></div><p>Every purchase is handled by Gizet.</p></div>
      <div className={styles.grid}>
        {visible.map((product) => {
          const quantity = cart[product.id] || 0;
          const soldOut = product.stock === 0;
          const addToBagDisabled = !product.shopify_variant_id || soldOut;
          return <article className={styles.card} key={product.id}>
            <a href={`/c/${creator.handle}/${product.slug}`} className={styles.image} style={product.image_url ? { backgroundImage: `url(${product.image_url})` } : undefined}>
              {!product.image_url && <span>{product.title.slice(0, 2).toUpperCase()}</span>}
              {product.featured && <b>Creator favorite</b>}
            </a>
            <div className={styles.cardBody}>
              <span className={styles.category}>{product.category || "Gizet"}</span>
              <a href={`/c/${creator.handle}/${product.slug}`} className={styles.productTitle}>{product.title}</a>
              <strong className={styles.price}>{money(Number(product.price))}</strong>
              {quantity === 0 ? <button className={styles.addButton} disabled={addToBagDisabled} onClick={() => add(product.id)}>{soldOut ? "Sold out" : "Add to bag"}</button> :
                <div className={styles.quantity}><button onClick={() => remove(product.id)}>−</button><strong>{quantity}</strong><button onClick={() => add(product.id)}>+</button></div>}
            </div>
          </article>;
        })}
      </div>
      {visible.length === 0 && <div className={styles.empty}>No products match your search.</div>}
    </section>

    <section className={styles.delivery}>
      <div><strong>Delivered by Gizet</strong><span>Products, checkout, order tracking and customer support stay under Gizet.</span></div>
      <div><strong>Creator attribution protected</strong><span>Your cart remains connected to @{creator.handle} through checkout.</span></div>
      <div><strong>Pay based on Gizet policy</strong><span>Available payment and delivery options appear during checkout.</span></div>
    </section>

    {quantities > 0 && <div className={styles.cartBar}>
      <div><strong>{quantities} {quantities === 1 ? "item" : "items"}</strong><span>{money(total)}</span></div>
      <button onClick={checkout} disabled={checkingOut}>{checkingOut ? "Opening checkout…" : "Go to checkout"}</button>
    </div>}
  </main>;
}
