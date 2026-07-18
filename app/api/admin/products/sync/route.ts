import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/api-auth";
import { query } from "@/lib/db";
import { shopifyAdmin } from "@/lib/shopify-admin";

const PRODUCTS_QUERY = `#graphql
  query AffiliateProducts($cursor: String) {
    products(first: 100, after: $cursor, query: "status:active") {
      pageInfo { hasNextPage endCursor }
      nodes {
        id title handle productType totalInventory
        featuredImage { url }
        variants(first: 1) {
          nodes {
            id
            price
            availableForSale
            inventoryQuantity
            inventoryPolicy
          }
        }
      }
    }
  }
`;

type ShopifyVariant = {
  id: string;
  price: string;
  availableForSale: boolean;
  inventoryQuantity: number | null;
  inventoryPolicy: "CONTINUE" | "DENY";
};

type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  productType: string;
  totalInventory: number | null;
  featuredImage: { url: string } | null;
  variants: { nodes: ShopifyVariant[] };
};

type ShopifyProductPage = {
  products: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: ShopifyProduct[];
  };
};

function stockForProduct(product: ShopifyProduct, variant: ShopifyVariant | undefined) {
  if (!variant) return 0;

  const canOversell = variant.inventoryPolicy === "CONTINUE";
  if (!variant.availableForSale && !canOversell) return 0;

  if (typeof variant.inventoryQuantity === "number" && variant.inventoryQuantity > 0) {
    return variant.inventoryQuantity;
  }
  if (canOversell) return 1;
  if (typeof product.totalInventory === "number" && product.totalInventory > 0) {
    return product.totalInventory;
  }
  return 1;
}

export async function POST() {
  const auth = await requireApiRole("admin");
  if (auth.response) return auth.response;
  try {
    let cursor: string | null = null;
    let synced = 0;
    do {
      const data: ShopifyProductPage = await shopifyAdmin<ShopifyProductPage>(PRODUCTS_QUERY, { cursor });
      for (const product of data.products.nodes) {
        const variant = product.variants.nodes[0];
        await query(`
          INSERT INTO affiliate_products
            (id, shopify_product_id, shopify_variant_id, title, slug, category, image_url, price, commission_rate, stock, active, updated_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,7,$9,TRUE,NOW())
          ON CONFLICT (shopify_product_id) DO UPDATE SET
            shopify_variant_id=EXCLUDED.shopify_variant_id, title=EXCLUDED.title, slug=EXCLUDED.slug,
            category=EXCLUDED.category, image_url=EXCLUDED.image_url, price=EXCLUDED.price,
            stock=EXCLUDED.stock, active=TRUE, updated_at=NOW()
        `, [`prod_${product.id.split("/").pop()}`, product.id, variant?.id || null, product.title, product.handle,
          product.productType || null, product.featuredImage?.url || null, Number(variant?.price || 0), stockForProduct(product, variant)]);
        synced += 1;
      }
      cursor = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null;
    } while (cursor && synced < 1000);
    return NextResponse.json({ ok: true, synced });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Sync failed" }, { status: 500 });
  }
}
