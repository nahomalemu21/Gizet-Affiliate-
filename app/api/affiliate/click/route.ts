import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";

const schema = z.object({ creator: z.string().min(1), productSlug: z.string().optional(), source: z.string().optional() });

export async function POST(request: NextRequest) {
  try {
    const input = schema.parse(await request.json());
    const creator = await query<{ id: string }>("SELECT id FROM creators WHERE id=$1 OR LOWER(handle)=LOWER($1) LIMIT 1", [input.creator.replace(/^@/, "")]);
    if (!creator.rows[0]) return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    const product = input.productSlug ? await query<{ id: string }>("SELECT id FROM affiliate_products WHERE slug=$1 LIMIT 1", [input.productSlug]) : null;
    const clickId = `clk_${crypto.randomUUID().replaceAll("-", "").slice(0, 18)}`;
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
    const ipHash = forwarded ? createHash("sha256").update(`${forwarded}:${process.env.IP_HASH_SALT || "gizet"}`).digest("hex") : null;
    await query(`INSERT INTO affiliate_clicks (id,creator_id,product_id,source,medium,campaign,landing_url,referrer,user_agent,ip_hash,expires_at)
      VALUES ($1,$2,$3,$4,'affiliate',$5,$6,$7,$8,$9,NOW() + (($10::text || ' days')::interval))`,
      [clickId, creator.rows[0].id, product?.rows[0]?.id || null, input.source || "creator", input.creator, request.url,
        request.headers.get("referer"), request.headers.get("user-agent"), ipHash, Number(process.env.AFFILIATE_COOKIE_DAYS || 30)]);
    return NextResponse.json({ clickId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Click tracking failed" }, { status: 400 });
  }
}
