import { NextRequest, NextResponse } from "next/server";
import { verifyShopifyWebhook } from "@/lib/shopify";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const hmac = request.headers.get("x-shopify-hmac-sha256");
  if (process.env.SHOPIFY_WEBHOOK_SECRET && !verifyShopifyWebhook(rawBody, hmac)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  const order = JSON.parse(rawBody) as Record<string, unknown>;
  // Production: map Shopify + delivery status to Pending/Delivered/Rejected/Returned,
  // then move commission from pending to available only after successful delivery.
  return NextResponse.json({ received: true, orderId: order.id ?? null });
}
