import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, context: { params: Promise<{ creator: string }> }) {
  const { creator } = await context.params;
  const handle = creator.replace(/^@/, "").toLowerCase();
  const target = new URL(`/${encodeURIComponent(handle)}`, request.nextUrl.origin);
  target.searchParams.set("utm_source", request.nextUrl.searchParams.get("utm_source") || "creator");
  target.searchParams.set("utm_medium", "affiliate");
  target.searchParams.set("utm_campaign", handle);
  return NextResponse.redirect(target);
}
