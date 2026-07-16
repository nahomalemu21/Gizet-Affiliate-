# Gizet Affiliate Portal

A separate affiliate system for Gizet creators and operations. It does not modify the vendor portal or mobile app repositories.

## Working MVP features

- Secure admin and creator login with signed session cookies
- PostgreSQL-backed creators, products, clicks, orders and payouts
- Admin creator account creation
- Shopify product synchronization
- Stable affiliate redirect links with unique click IDs
- Shopify cart-attribute tracking script
- Shopify order webhooks with HMAC verification
- Product-level commission calculation
- Manual delivery-status control before commission is released
- Auditable payout creation, approval and paid status
- Mobile-first creator and admin dashboards

## Vercel environment variables

```env
NEXT_PUBLIC_GIZET_STORE_URL=https://gizet.co
NEXT_PUBLIC_APP_URL=https://YOUR-VERCEL-DOMAIN
APP_URL=https://YOUR-VERCEL-DOMAIN
AFFILIATE_COOKIE_DAYS=30
DATABASE_URL=postgresql://...
SESSION_SECRET=minimum-32-character-random-secret
BOOTSTRAP_SECRET=another-random-secret
ADMIN_EMAIL=your-admin-email
ADMIN_PASSWORD=your-strong-admin-password
IP_HASH_SALT=random-value
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_...
SHOPIFY_WEBHOOK_SECRET=your-shopify-app-client-secret
SHOPIFY_API_VERSION=2026-04
```

## First-time setup

1. Create a PostgreSQL database and add `DATABASE_URL` to Vercel.
2. Add all security/admin variables above.
3. Redeploy.
4. Open `/setup` on the deployed portal.
5. Enter `BOOTSTRAP_SECRET` once to create the tables and admin login.
6. Sign in using `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
7. In the admin dashboard, click **Sync Shopify products** and **Connect Shopify webhooks**.

## Shopify storefront tracking script

Add this before `</body>` in the live Gizet Shopify theme:

```liquid
<script src="https://YOUR-VERCEL-DOMAIN/gizet-affiliate.js" defer></script>
```

The script reads the creator and click identifiers from the affiliate URL, stores them on `gizet.co`, and writes these Shopify cart attributes:

- `affiliate_creator_id`
- `affiliate_click_id`
- `affiliate_source`

Those attributes are included in the Shopify order webhook and become the financial source of truth for creator attribution.

## Validation

```bash
npm install
npm run lint
npm run build
```
