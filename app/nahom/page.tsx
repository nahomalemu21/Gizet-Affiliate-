import { NahomKidsStore, type StorefrontProduct } from "@/components/storefront/NahomKidsStore";

export const dynamic = "force-dynamic";

const STORE_URL = "https://gizet.co";

type ShopifyProduct = {
  id: number;
  title: string;
  handle: string;
  product_type?: string;
  images?: Array<{ src: string }>;
  variants?: Array<{
    id: number;
    title: string;
    price: string;
    compare_at_price?: string | null;
    available?: boolean;
  }>;
};

async function fetchCollection(handle: string, category: string): Promise<StorefrontProduct[]> {
  try {
    const response = await fetch(`${STORE_URL}/collections/${handle}/products.json?limit=20`, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return [];
    const data = (await response.json()) as { products?: ShopifyProduct[] };
    return (data.products ?? []).flatMap((product) => {
      const variant = product.variants?.find((item) => item.available !== false) ?? product.variants?.[0];
      if (!variant) return [];
      return [{
        id: String(product.id),
        variantId: String(variant.id),
        title: product.title,
        handle: product.handle,
        category,
        price: Number(variant.price || 0),
        compareAtPrice: variant.compare_at_price ? Number(variant.compare_at_price) : null,
        image: product.images?.[0]?.src ?? "",
        available: variant.available !== false,
      } satisfies StorefrontProduct];
    });
  } catch {
    return [];
  }
}

const fallbackProducts: StorefrontProduct[] = [
  { id: "car-racing", variantId: "", title: "CAR RACING ADVENTURE TOYS", handle: "car-racing-adventure-toys", category: "Toys", price: 9500, compareAtPrice: null, image: "", available: true },
  { id: "magnetic-game", variantId: "", title: "4-in-1 Magnetic Board Game Set", handle: "4-in-1-magnetic-board-game-set", category: "Games", price: 4700, compareAtPrice: 6200, image: "", available: true },
  { id: "kids-keyboard", variantId: "", title: "49 Key Kids Keyboard", handle: "49-key-kids-keyboard", category: "Music", price: 5500, compareAtPrice: 7200, image: "", available: true },
  { id: "car-seat", variantId: "", title: "360 Degree Rotate Car Seat", handle: "360-degree-rotate-car-seat", category: "Baby", price: 28500, compareAtPrice: 37100, image: "", available: true },
];

export default async function NahomStorefrontPage() {
  const [kids, entertainment] = await Promise.all([
    fetchCollection("children", "Kids"),
    fetchCollection("entertainment", "Play & Learn"),
  ]);

  const unique = new Map<string, StorefrontProduct>();
  [...kids, ...entertainment].forEach((product) => unique.set(product.id, product));
  const products = Array.from(unique.values()).slice(0, 10);

  return <NahomKidsStore products={products.length ? products : fallbackProducts} storeUrl={STORE_URL} />;
}
