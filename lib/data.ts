import { query } from "@/lib/db";

export type CreatorRecord = {
  id: string;
  name: string;
  handle: string;
  platform: string;
  followers: number;
  status: string;
  tier: string;
  commission_rate: number;
  discount_code: string | null;
  payout_method: string | null;
  payout_details: string | null;
  delivered_orders?: number;
  delivery_rate?: number;
  pending_earnings?: number;
  available_earnings?: number;
};

export type ProductRecord = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  image_url: string | null;
  price: number;
  commission_rate: number;
  stock: number;
  active: boolean;
};

export type OrderRecord = {
  id: string;
  order_name: string;
  creator_id: string | null;
  creator_name: string | null;
  customer_name: string | null;
  eligible_revenue: number;
  commission_rate: number;
  commission_amount: number;
  order_status: string;
  commission_status: string;
  source: string | null;
  attribution_method: string;
  attributed_at: string;
  delivered_at: string | null;
};

export type PayoutRecord = {
  id: string;
  creator_id: string;
  creator_name: string;
  amount: number;
  status: string;
  method: string | null;
  transaction_reference: string | null;
  created_at: string;
  paid_at: string | null;
  order_count: number;
};

function numeric<T extends Record<string, unknown>>(row: T, keys: Array<keyof T>) {
  for (const key of keys) if (row[key] != null) row[key] = Number(row[key]) as T[keyof T];
  return row;
}

export async function getCreator(creatorId: string) {
  const result = await query<CreatorRecord>(`
    SELECT c.*,
      COUNT(o.id) FILTER (WHERE o.order_status = 'delivered')::int AS delivered_orders,
      COALESCE(ROUND(100.0 * COUNT(o.id) FILTER (WHERE o.order_status = 'delivered') / NULLIF(COUNT(o.id) FILTER (WHERE o.order_status NOT IN ('pending')), 0), 0), 0)::int AS delivery_rate,
      COALESCE(SUM(o.commission_amount) FILTER (WHERE o.commission_status = 'pending'), 0) AS pending_earnings,
      COALESCE(SUM(o.commission_amount) FILTER (WHERE o.commission_status = 'available'), 0) AS available_earnings
    FROM creators c
    LEFT JOIN affiliate_orders o ON o.creator_id = c.id
    WHERE c.id = $1
    GROUP BY c.id
  `, [creatorId]);
  const row = result.rows[0];
  return row ? numeric(row, ["followers", "commission_rate", "delivered_orders", "delivery_rate", "pending_earnings", "available_earnings"]) : null;
}

export async function listCreators() {
  const result = await query<CreatorRecord>(`
    SELECT c.*,
      COUNT(o.id) FILTER (WHERE o.order_status = 'delivered')::int AS delivered_orders,
      COALESCE(ROUND(100.0 * COUNT(o.id) FILTER (WHERE o.order_status = 'delivered') / NULLIF(COUNT(o.id) FILTER (WHERE o.order_status NOT IN ('pending')), 0), 0), 0)::int AS delivery_rate,
      COALESCE(SUM(o.commission_amount) FILTER (WHERE o.commission_status = 'available'), 0) AS available_earnings
    FROM creators c LEFT JOIN affiliate_orders o ON o.creator_id = c.id
    GROUP BY c.id ORDER BY delivered_orders DESC, c.created_at DESC
  `);
  return result.rows.map((row) => numeric(row, ["followers", "commission_rate", "delivered_orders", "delivery_rate", "available_earnings"]));
}

export async function listProducts(activeOnly = true) {
  const result = await query<ProductRecord>(`
    SELECT id, title, slug, category, image_url, price, commission_rate, stock, active
    FROM affiliate_products
    ${activeOnly ? "WHERE active = TRUE" : ""}
    ORDER BY updated_at DESC, title ASC
  `);
  return result.rows.map((row) => numeric(row, ["price", "commission_rate", "stock"]));
}

export async function listOrders(creatorId?: string) {
  const values: unknown[] = [];
  const where = creatorId ? "WHERE o.creator_id = $1" : "";
  if (creatorId) values.push(creatorId);
  const result = await query<OrderRecord>(`
    SELECT o.id, o.order_name, o.creator_id, c.name AS creator_name, o.customer_name,
      o.eligible_revenue, o.commission_rate, o.commission_amount, o.order_status,
      o.commission_status, o.source, o.attribution_method, o.attributed_at, o.delivered_at
    FROM affiliate_orders o
    LEFT JOIN creators c ON c.id = o.creator_id
    ${where}
    ORDER BY o.attributed_at DESC
    LIMIT 250
  `, values);
  return result.rows.map((row) => numeric(row, ["eligible_revenue", "commission_rate", "commission_amount"]));
}

export async function listPayouts(creatorId?: string) {
  const values: unknown[] = [];
  const where = creatorId ? "WHERE p.creator_id = $1" : "";
  if (creatorId) values.push(creatorId);
  const result = await query<PayoutRecord>(`
    SELECT p.*, c.name AS creator_name, COUNT(o.id)::int AS order_count
    FROM payouts p
    JOIN creators c ON c.id = p.creator_id
    LEFT JOIN affiliate_orders o ON o.payout_id = p.id
    ${where}
    GROUP BY p.id, c.name
    ORDER BY p.created_at DESC
  `, values);
  return result.rows.map((row) => numeric(row, ["amount", "order_count"]));
}
