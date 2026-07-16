import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyShopifyWebhook(rawBody: string, hmacHeader: string | null) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret || !hmacHeader) return false;
  const digest = createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  const left = Buffer.from(digest);
  const right = Buffer.from(hmacHeader);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function extractAffiliateAttribution(order: Record<string, unknown>) {
  const attributes = Array.isArray(order.note_attributes) ? order.note_attributes : [];
  const map = new Map<string, string>();
  for (const attribute of attributes) {
    if (attribute && typeof attribute === "object" && "name" in attribute && "value" in attribute) {
      map.set(String(attribute.name), String(attribute.value));
    }
  }

  const discountCodes = Array.isArray(order.discount_codes) ? order.discount_codes : [];
  const code = discountCodes[0] && typeof discountCodes[0] === "object" && "code" in discountCodes[0]
    ? String(discountCodes[0].code)
    : null;

  return {
    creatorId: map.get("affiliate_creator_id") ?? null,
    clickId: map.get("affiliate_click_id") ?? null,
    source: map.get("affiliate_source") ?? null,
    discountCode: code,
  };
}
