import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CreatorStorefront } from "@/components/storefront/CreatorStorefront";
import { getCreatorByHandle, listCreatorProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const creator = await getCreatorByHandle(handle).catch(() => null);
  if (!creator) return { title: "Creator Store | Gizet" };
  const title = creator.storefront_title || `${creator.name}'s Picks`;
  const description = creator.storefront_bio || `Shop products recommended by ${creator.name}, delivered by Gizet.`;
  return { title: `${title} | Gizet`, description };
}

export default async function PublicCreatorStore({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const creator = await getCreatorByHandle(handle);
  if (!creator) notFound();

  const products = await listCreatorProducts(creator.id);
  const storeUrl = process.env.NEXT_PUBLIC_GIZET_STORE_URL || "https://gizet.co";

  return <CreatorStorefront
    creator={{
      id: creator.id,
      name: creator.name,
      handle: creator.handle,
      platform: creator.platform,
      followers: Number(creator.followers || 0),
      storefront_title: creator.storefront_title,
      storefront_bio: creator.storefront_bio,
      avatar_url: creator.avatar_url,
      banner_url: creator.banner_url,
      discount_code: creator.discount_code,
    }}
    products={products.map((product) => ({
      id: product.id,
      shopify_variant_id: product.shopify_variant_id,
      title: product.title,
      slug: product.slug,
      category: product.category,
      image_url: product.image_url,
      price: Number(product.price),
      stock: Number(product.stock),
      featured: Boolean(product.featured),
    }))}
    storeUrl={storeUrl}
  />;
}
