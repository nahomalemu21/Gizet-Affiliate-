import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyShopifyWebhook } from "@/lib/shopify";

type ShopifyOrder = {
  id?: number | string;
  cancelled_at?: string | null;
  financial_status?: string | null;
  fulfillment_status?: string | null;
};

function mapStatus(order: ShopifyOrder) {
  if (order.cancelled_at) return "cancelled";
  if (order.financial_status === "refunded" || order.financial_status === "partially_refunded") return "returned";
  if (order.fulfillment_status === "fulfilled" || order.fulfillment_status === "partial") return "out_for_delivery";
  return "confirmed";
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const hmac = request.headers.get("x-shopify-hmac-sha256");
  if (process.env.SHOPIFY_WEBHOOK_SECRET && !verifyShopifyWebhook(rawBody, hmac)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  try {
    const order = JSON.parse(rawBody) as ShopifyOrder;
    if (!order.id) return NextResponse.json({ error: "Order ID missing" }, { status: 400 });
    const status = mapStatus(order);
    const commissionStatus = ["cancelled", "returned"].includes(status) ? "void" : "pending";
    await query(`
      UPDATE affiliate_orders SET order_status=$2,
        commission_status=CASE WHEN commission_status IN ('available','processing','paid') THEN commission_status ELSE $3 END,
        updated_at=NOW()
      WHERE shopify_order_id=$1
    `, [String(order.id), status, commissionStatus]);
    return NextResponse.json({ received: true, orderId: order.id, status });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Webhook processing failed" }, { status: 500 });
  }
}
