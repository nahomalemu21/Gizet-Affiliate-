import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, context: { params: Promise<{ creator: string; slug: string }> }) {
  const { creator, slug } = await context.params;
  const clickId = `clk_${crypto.randomUUID().replaceAll("-", "").slice(0, 18)}`;
  const storeUrl = process.env.NEXT_PUBLIC_GIZET_STORE_URL || "https://gizet.com";
  const target = new URL(`/products/${slug}`, storeUrl);
  target.searchParams.set("affiliate_creator", creator);
  target.searchParams.set("affiliate_click", clickId);
  target.searchParams.set("utm_source", "creator");
  target.searchParams.set("utm_medium", "affiliate");
  target.searchParams.set("utm_campaign", creator);

  const response = NextResponse.redirect(target);
  const days = Number(process.env.AFFILIATE_COOKIE_DAYS || 30);
  const cookieOptions = { httpOnly: true, secure: true, sameSite: "lax" as const, maxAge: days * 24 * 60 * 60, path: "/" };
  response.cookies.set("gizet_affiliate_creator", creator, cookieOptions);
  response.cookies.set("gizet_affiliate_click", clickId, cookieOptions);
  response.headers.set("x-gizet-affiliate-click", clickId);
  return response;
}
