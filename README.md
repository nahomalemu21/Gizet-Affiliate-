# Gizet Affiliate Portal

A separate, mobile-first affiliate system for Gizet creators and operations. This repository is independent from `gizet-vendor-portal` and does not modify it.

## Included

- Creator dashboard with earnings, tiers and delivery rate
- Affiliate product marketplace with exact ETB payout per delivered order
- Stable creator URLs: `/c/:creator/:product`
- First-party creator and click cookies
- UTM parameters for analytics only
- Discount-code fallback model
- Creator order and payout views
- Gizet admin dashboards for creators, products, attribution and payouts
- Shopify webhook signature validation and attribution extraction
- PostgreSQL production schema
- 7% base commission with tier-ready support up to 10%

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Tracking flow

1. Creator shares `https://your-domain.com/c/hana/portable-smoothie-blender`.
2. The route creates a unique click ID and stores first-party cookies.
3. The customer is redirected to the Gizet product with UTM parameters and affiliate identifiers.
4. The storefront must copy `affiliate_creator_id` and `affiliate_click_id` into Shopify cart attributes.
5. Shopify creates the order and calls `/api/shopify/webhooks/orders-create`.
6. Attribution is locked in `affiliate_orders`.
7. Delivery updates move commission from pending to available.
8. Paid orders are grouped into auditable payouts.

## Storefront cart attributes

Add these when creating or updating the Shopify cart:

```json
{
  "affiliate_creator_id": "hana",
  "affiliate_click_id": "clk_...",
  "affiliate_source": "tiktok"
}
```

## Environment variables

- `NEXT_PUBLIC_GIZET_STORE_URL` — Gizet Shopify storefront URL
- `AFFILIATE_COOKIE_DAYS` — default 30
- `SHOPIFY_WEBHOOK_SECRET` — Shopify webhook signing secret
- `DATABASE_URL` — PostgreSQL connection string

## Production work remaining

- Connect authentication for creators/admins
- Replace demo data with PostgreSQL queries
- Add Shopify product sync
- Add delivery-status webhook/source
- Add payout approval actions and transaction references
- Add fraud review rules
