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

function cookieValue(name: string) {
  return document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`))
    ?.slice(name.length + 1) || "";
}

export function CreatorStorefront({ creator, products }: {
  creator: Creator;
  products: Product[];
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

  async function checkout() {
    const items = products.flatMap((product) => {
      const quantity = cart[product.id] || 0;
      const variantId = product.shopify_variant_id?.split("/").pop();
      return quantity > 0 && variantId ? [{
        variantId,
        quantity,
        productId: product.id,
        title: product.title,
        price: Number(product.price),
        imageUrl: product.image_url || "",
      }] : [];
    });
    if (!items.length) return;

    setCheckingOut(true);
    try {
      const storageKey = `gizet_creator_click_${creator.handle}`;
      let checkoutClickId = clickId || window.localStorage.getItem(storageKey) || "";
      if (!checkoutClickId) {
        const response = await fetch("/api/affiliate/click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ creator: creator.handle, source: "storefront-checkout" }),
        });
        if (!response.ok) throw new Error("Creator attribution could not be created");
        const body = await response.json();
        checkoutClickId = body.clickId || "";
        if (!checkoutClickId) throw new Error("Creator attribution is missing");
        setClickId(checkoutClickId);
        window.localStorage.setItem(storageKey, checkoutClickId);
      }

      const currentParams = new URLSearchParams(window.location.search);
      const payload = {
        items,
        affiliateCreatorId: creator.id,
        affiliateCreatorHandle: creator.handle,
        affiliateClickId: checkoutClickId,
        affiliateSource: "creator-storefront",
        utmSource: "creator",
        utmMedium: "affiliate",
        utmCampaign: creator.handle,
        discountCode: creator.discount_code || "",
        utmContent: currentParams.get("utm_content") || "",
        utmTerm: currentParams.get("utm_term") || "",
        utmId: currentParams.get("utm_id") || "",
        fbclid: currentParams.get("fbclid") || "",
        gclid: currentParams.get("gclid") || "",
        ttclid: currentParams.get("ttclid") || "",
        msclkid: currentParams.get("msclkid") || "",
        campaignId: currentParams.get("campaign_id") || "",
        adsetId: currentParams.get("adset_id") || "",
        adId: currentParams.get("ad_id") || "",
        fbp: cookieValue("_fbp"),
        fbc: cookieValue("_fbc"),
        landingPage: window.location.href,
        referrer: document.referrer || "direct",
      };
      const checkoutBaseUrl = process.env.NEXT_PUBLIC_GIZET_CHECKOUT_URL || "https://checkout.gizet.co";
      const checkoutUrl = new URL("/creator-order.html", checkoutBaseUrl);
      checkoutUrl.searchParams.set("cart", JSON.stringify(payload));
      window.location.assign(checkoutUrl.toString());
    } catch {
      setCheckingOut(false);
      window.alert("We could not open checkout. Please try again.");
    }
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
