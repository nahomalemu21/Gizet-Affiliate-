import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  if (!body.creatorId) return NextResponse.json({ error: "creatorId is required" }, { status: 400 });
  const clickId = `clk_${crypto.randomUUID().replaceAll("-", "").slice(0, 18)}`;

  // Replace this response-only implementation with a database insert using database/schema.sql.
  return NextResponse.json({
    clickId,
    creatorId: body.creatorId,
    productId: body.productId ?? null,
    source: body.source ?? "unknown",
    createdAt: new Date().toISOString(),
  }, { status: 201 });
}
