"use client";

import { useMemo, useState } from "react";
import { formatEtb } from "@/lib/format";

type Product = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  image_url: string | null;
  price: number;
  commission_rate: number;
  custom_rate?: number | null;
  stock: number;
  selected?: boolean;
};

export function ProductLibrary({ products: initialProducts, creatorHandle, appUrl }: {
  products: Product[];
  creatorHandle: string;
  appUrl: string;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [selectedOnly, setSelectedOnly] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter((product) => {
      if (selectedOnly && !product.selected) return false;
      if (!term) return true;
      return product.title.toLowerCase().includes(term) || (product.category || "").toLowerCase().includes(term);
    });
  }, [products, query, selectedOnly]);

  async function toggle(product: Product) {
    setBusyId(product.id);
    setMessage("");
    const selected = !product.selected;
    const response = await fetch("/api/creator/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, selected }),
    });
    const body = await response.json().catch(() => ({}));
    setBusyId(null);
    if (!response.ok) {
      setMessage(body.error || "Could not update your storefront");
      return;
    }
    setProducts((current) => current.map((item) => item.id === product.id ? { ...item, selected } : item));
    setMessage(selected ? "Product added to your storefront." : "Product removed from your storefront.");
  }

  async function copyLink(product: Product) {
    await navigator.clipboard.writeText(`${appUrl.replace(/\/$/, "")}/c/${creatorHandle}/${product.slug}`);
    setMessage("Product link copied.");
  }

  const selectedCount = products.filter((product) => product.selected).length;

  return <>
    <div className="toolbar">
      <div className="search-box"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products or categories" /></div>
      <button className={`btn-secondary ${selectedOnly ? "active-filter" : ""}`} onClick={() => setSelectedOnly((value) => !value)}>
        My store ({selectedCount})
      </button>
    </div>
    {message && <div className={message.includes("Could not") ? "form-error" : "form-success"}>{message}</div>}
    <div className="product-grid">
      {visible.map((product) => {
        const rate = Number(product.custom_rate ?? product.commission_rate);
        const payout = Number(product.price) * rate / 100;
        return <article className={`product-card ${product.selected ? "selected-product" : ""}`} key={product.id}>
          <div className="product-visual" style={product.image_url ? { backgroundImage: `url(${product.image_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
            {!product.image_url && <span>{product.title.slice(0, 3).toUpperCase()}</span>}
            {product.selected && <div className="featured-chip">In your store</div>}
          </div>
          <div className="product-content">
            <div className="product-meta"><span>{product.category || "Gizet"}</span><span>{product.stock} in stock</span></div>
            <h2>{product.title}</h2>
            <div className="product-price">{formatEtb(Number(product.price))}</div>
            <div className="commission-box"><div><span>You earn</span><strong>{formatEtb(payout)}</strong></div><div><span>Rate</span><strong>{rate}%</strong></div></div>
            <div className="creator-product-actions">
              <button className={product.selected ? "btn-secondary" : "btn-primary"} disabled={busyId === product.id} onClick={() => toggle(product)}>
                {busyId === product.id ? "Saving…" : product.selected ? "Remove" : "Add to my store"}
              </button>
              {product.selected && <button className="btn-secondary" onClick={() => copyLink(product)}>Copy link</button>}
            </div>
          </div>
        </article>;
      })}
      {visible.length === 0 && <div className="panel"><strong>No matching products.</strong><p>Try another search or sync more products from Shopify.</p></div>}
    </div>
  </>;
}
