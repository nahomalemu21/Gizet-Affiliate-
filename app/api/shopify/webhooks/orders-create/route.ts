import { NextRequest, NextResponse } from "next/server";
import { extractAffiliateAttribution, verifyShopifyWebhook } from "@/lib/shopify";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const hmac = request.headers.get("x-shopify-hmac-sha256");
  if (process.env.SHOPIFY_WEBHOOK_SECRET && !verifyShopifyWebhook(rawBody, hmac)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  const order = JSON.parse(rawBody) as Record<string, unknown>;
  const attribution = extractAffiliateAttribution(order);

  // Production: insert immutable affiliate order attribution in the database.
  return NextResponse.json({ received: true, orderId: order.id ?? null, attribution });
}
