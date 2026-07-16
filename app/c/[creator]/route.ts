import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, context: { params: Promise<{ creator: string }> }) {
  const { creator } = await context.params;
  const target = new URL(process.env.NEXT_PUBLIC_GIZET_STORE_URL || "https://gizet.co");
  target.searchParams.set("affiliate_creator", creator.replace(/^@/, "").toLowerCase());
  target.searchParams.set("affiliate_click", `clk_${crypto.randomUUID().replaceAll("-", "").slice(0, 18)}`);
  target.searchParams.set("utm_source", "creator");
  target.searchParams.set("utm_medium", "affiliate");
  target.searchParams.set("utm_campaign", creator.replace(/^@/, "").toLowerCase());
  return NextResponse.redirect(target);
}
