import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { extractAffiliateAttribution, verifyShopifyWebhook } from "@/lib/shopify";

type ShopifyLine = { product_id?: number | string; price?: string; quantity?: number; total_discount?: string };
type ShopifyOrder = {
  id?: number | string;
  name?: string;
  current_subtotal_price?: string;
  subtotal_price?: string;
  discount_codes?: Array<{ code?: string }>;
  note_attributes?: Array<{ name?: string; value?: string }>;
  line_items?: ShopifyLine[];
};

type CreatorRow = { id: string; commission_rate: string; discount_code: string | null };
type ProductRate = { shopify_product_id: string; commission_rate: string };

async function findCreator(rawCreator: string | null, discountCode: string | null) {
  if (rawCreator) {
    const result = await query<CreatorRow>(`
      SELECT id, commission_rate, discount_code FROM creators
      WHERE id=$1 OR LOWER(handle)=LOWER($1) OR LOWER(handle)=LOWER(REPLACE($1,'@',''))
      LIMIT 1
    `, [rawCreator]);
    if (result.rows[0]) return { creator: result.rows[0], method: "link" };
  }
  if (discountCode) {
    const result = await query<CreatorRow>(
      "SELECT id, commission_rate, discount_code FROM creators WHERE UPPER(discount_code)=UPPER($1) LIMIT 1",
      [discountCode],
    );
    if (result.rows[0]) return { creator: result.rows[0], method: "code" };
  }
  return { creator: null, method: "unattributed" };
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

    const attribution = extractAffiliateAttribution(order as Record<string, unknown>);
    const resolved = await findCreator(attribution.creatorId, attribution.discountCode);
    const creator = resolved.creator;
    const lines = order.line_items || [];
    const productIds = lines
      .filter((line) => line.product_id != null)
      .map((line) => `gid://shopify/Product/${line.product_id}`);

    const rateRows = creator && productIds.length
      ? await query<ProductRate>(`
          SELECT ap.shopify_product_id,
            COALESCE(cp.custom_rate, ap.commission_rate, c.commission_rate) AS commission_rate
          FROM affiliate_products ap
          LEFT JOIN creator_products cp
            ON cp.product_id = ap.id AND cp.creator_id = $2 AND cp.active = TRUE
          JOIN creators c ON c.id = $2
          WHERE ap.shopify_product_id = ANY($1::text[]) AND ap.active = TRUE
        `, [productIds, creator.id])
      : { rows: [] as ProductRate[] };

    const rateMap = new Map(rateRows.rows.map((row) => [row.shopify_product_id, Number(row.commission_rate)]));
    let eligibleRevenue = 0;
    let commissionAmount = 0;

    for (const line of lines) {
      const rate = rateMap.get(`gid://shopify/Product/${line.product_id}`);
      if (rate == null) continue;
      const revenue = Math.max(0, Number(line.price || 0) * Number(line.quantity || 0) - Number(line.total_discount || 0));
      eligibleRevenue += revenue;
      commissionAmount += revenue * rate / 100;
    }

    const effectiveRate = eligibleRevenue > 0 ? commissionAmount / eligibleRevenue * 100 : 0;
    const clickExists = attribution.clickId
      ? await query<{ id: string }>("SELECT id FROM affiliate_clicks WHERE id=$1 LIMIT 1", [attribution.clickId])
      : null;
    const internalId = `ord_${order.id}`;

    await query(`
      INSERT INTO affiliate_orders
        (id, shopify_order_id, order_name, creator_id, click_id, discount_code, attribution_method, source,
         eligible_revenue, commission_rate, commission_amount, order_status,
         commission_status, raw_payload, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'confirmed','pending',$12,NOW())
      ON CONFLICT (shopify_order_id) DO UPDATE SET
        order_name=EXCLUDED.order_name,
        creator_id=CASE WHEN affiliate_orders.locked THEN affiliate_orders.creator_id ELSE EXCLUDED.creator_id END,
        click_id=CASE WHEN affiliate_orders.locked THEN affiliate_orders.click_id ELSE EXCLUDED.click_id END,
        discount_code=EXCLUDED.discount_code,
        eligible_revenue=EXCLUDED.eligible_revenue,
        commission_rate=EXCLUDED.commission_rate,
        commission_amount=EXCLUDED.commission_amount,
        raw_payload=EXCLUDED.raw_payload,
        updated_at=NOW()
    `, [internalId, String(order.id), order.name || `#${order.id}`, creator?.id || null,
      clickExists?.rows[0]?.id || null, attribution.discountCode, resolved.method, attribution.source,
      eligibleRevenue, effectiveRate, commissionAmount, JSON.stringify(order)]);

    return NextResponse.json({
      received: true,
      orderId: order.id,
      creatorId: creator?.id || null,
      eligibleRevenue,
      commissionAmount,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Webhook processing failed" }, { status: 500 });
  }
}
