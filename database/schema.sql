-- Gizet Affiliate Portal PostgreSQL schema
CREATE TABLE creators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  handle TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  tier TEXT NOT NULL DEFAULT 'starter',
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 7.00,
  discount_code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE affiliate_products (
  id TEXT PRIMARY KEY,
  shopify_product_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  commission_rate NUMERIC(5,2) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE creator_products (
  creator_id TEXT NOT NULL REFERENCES creators(id),
  product_id TEXT NOT NULL REFERENCES affiliate_products(id),
  custom_rate NUMERIC(5,2),
  PRIMARY KEY (creator_id, product_id)
);

CREATE TABLE affiliate_clicks (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES creators(id),
  product_id TEXT REFERENCES affiliate_products(id),
  source TEXT,
  landing_url TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE affiliate_orders (
  id TEXT PRIMARY KEY,
  shopify_order_id TEXT NOT NULL UNIQUE,
  order_name TEXT NOT NULL,
  creator_id TEXT REFERENCES creators(id),
  click_id TEXT REFERENCES affiliate_clicks(id),
  attribution_method TEXT NOT NULL,
  eligible_revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  commission_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  order_status TEXT NOT NULL DEFAULT 'pending',
  commission_status TEXT NOT NULL DEFAULT 'pending',
  attributed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  locked BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE payouts (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES creators(id),
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  method TEXT,
  transaction_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE TABLE payout_orders (
  payout_id TEXT NOT NULL REFERENCES payouts(id),
  affiliate_order_id TEXT NOT NULL REFERENCES affiliate_orders(id),
  PRIMARY KEY (payout_id, affiliate_order_id)
);

CREATE INDEX idx_clicks_creator_created ON affiliate_clicks(creator_id, created_at DESC);
CREATE INDEX idx_orders_creator_status ON affiliate_orders(creator_id, commission_status);
