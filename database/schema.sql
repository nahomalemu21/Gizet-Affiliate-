-- Gizet Affiliate Portal PostgreSQL schema
CREATE TABLE IF NOT EXISTS creators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  handle TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL DEFAULT 'TikTok',
  followers INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  tier TEXT NOT NULL DEFAULT 'starter',
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 7.00,
  discount_code TEXT UNIQUE,
  payout_method TEXT,
  payout_details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','creator')),
  creator_id TEXT REFERENCES creators(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS affiliate_products (
  id TEXT PRIMARY KEY,
  shopify_product_id TEXT UNIQUE,
  shopify_variant_id TEXT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT,
  image_url TEXT,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 7.00,
  stock INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS creator_products (
  creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES affiliate_products(id) ON DELETE CASCADE,
  custom_rate NUMERIC(5,2),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (creator_id, product_id)
);

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES affiliate_products(id) ON DELETE SET NULL,
  source TEXT,
  medium TEXT,
  campaign TEXT,
  landing_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS affiliate_orders (
  id TEXT PRIMARY KEY,
  shopify_order_id TEXT NOT NULL UNIQUE,
  order_name TEXT NOT NULL,
  creator_id TEXT REFERENCES creators(id) ON DELETE SET NULL,
  click_id TEXT REFERENCES affiliate_clicks(id) ON DELETE SET NULL,
  discount_code TEXT,
  attribution_method TEXT NOT NULL DEFAULT 'unattributed',
  source TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  eligible_revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  commission_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  order_status TEXT NOT NULL DEFAULT 'pending',
  commission_status TEXT NOT NULL DEFAULT 'pending',
  payout_id TEXT,
  raw_payload JSONB,
  attributed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS payouts (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  method TEXT,
  transaction_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_clicks_creator_created ON affiliate_clicks(creator_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_creator_status ON affiliate_orders(creator_id, commission_status);
CREATE INDEX IF NOT EXISTS idx_orders_payout ON affiliate_orders(payout_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON affiliate_products(active, updated_at DESC);
