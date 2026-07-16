import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

function safeStoreUrl() {
  return process.env.NEXT_PUBLIC_GIZET_STORE_URL || "https://gizet.co";
}

export async function GET(request: NextRequest, context: { params: Promise<{ creator: string; slug: string }> }) {
  const { creator: rawCreator, slug } = await context.params;
  const creatorHandle = rawCreator.replace(/^@/, "").toLowerCase();
  const clickId = `clk_${crypto.randomUUID().replaceAll("-", "").slice(0, 18)}`;
  let creatorId: string | null = null;
  let productId: string | null = null;

  try {
    const creatorResult = await query<{ id: string }>("SELECT id FROM creators WHERE LOWER(handle)=LOWER($1) AND status='active' LIMIT 1", [creatorHandle]);
    creatorId = creatorResult.rows[0]?.id || null;
    const productResult = await query<{ id: string }>("SELECT id FROM affiliate_products WHERE slug=$1 AND active=TRUE LIMIT 1", [slug]);
    productId = productResult.rows[0]?.id || null;
    if (creatorId) {
      const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
      const ipHash = forwarded ? createHash("sha256").update(`${forwarded}:${process.env.IP_HASH_SALT || "gizet"}`).digest("hex") : null;
      await query(`
        INSERT INTO affiliate_clicks (id, creator_id, product_id, source, medium, campaign, landing_url, referrer, user_agent, ip_hash, expires_at)
        VALUES ($1,$2,$3,$4,'affiliate',$5,$6,$7,$8,$9,NOW() + (($10::text || ' days')::interval))
      `, [clickId, creatorId, productId, request.nextUrl.searchParams.get("utm_source") || "creator", creatorHandle,
        request.url, request.headers.get("referer"), request.headers.get("user-agent"), ipHash, Number(process.env.AFFILIATE_COOKIE_DAYS || 30)]);
    }
  } catch {
    // Tracking should never block the customer from reaching the store.
  }

  const target = new URL(`/products/${slug}`, safeStoreUrl());
  target.searchParams.set("affiliate_creator", creatorHandle);
  target.searchParams.set("affiliate_click", clickId);
  target.searchParams.set("utm_source", request.nextUrl.searchParams.get("utm_source") || "creator");
  target.searchParams.set("utm_medium", "affiliate");
  target.searchParams.set("utm_campaign", creatorHandle);

  const response = NextResponse.redirect(target);
  const days = Number(process.env.AFFILIATE_COOKIE_DAYS || 30);
  const cookieOptions = { httpOnly: true, secure: true, sameSite: "lax" as const, maxAge: days * 24 * 60 * 60, path: "/" };
  response.cookies.set("gizet_affiliate_creator", creatorHandle, cookieOptions);
  response.cookies.set("gizet_affiliate_click", clickId, cookieOptions);
  response.headers.set("x-gizet-affiliate-click", clickId);
  return response;
}
