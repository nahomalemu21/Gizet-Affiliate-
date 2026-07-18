import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/api-auth";
import { transaction } from "@/lib/db";
import { listCreators } from "@/lib/data";

const inputSchema = z.object({
  name: z.string().min(2),
  handle: z.string().min(2),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  platform: z.string().default("TikTok"),
  followers: z.coerce.number().int().min(0).default(0),
  commissionRate: z.coerce.number().min(1).max(10).default(7),
  discountCode: z.string().min(2).max(30),
  pin: z.string().regex(/^\d{4}$/),
});

function normalizeHandle(value: string) {
  return value.trim().replace(/^@/, "").toLowerCase().replace(/[^a-z0-9._-]/g, "");
}

export async function GET() {
  const auth = await requireApiRole("admin");
  if (auth.response) return auth.response;
  return NextResponse.json({ creators: await listCreators() });
}

export async function POST(request: Request) {
  const auth = await requireApiRole("admin");
  if (auth.response) return auth.response;
  try {
    const input = inputSchema.parse(await request.json());
    const creatorId = `cr_${crypto.randomUUID()}`;
    const userId = `usr_${crypto.randomUUID()}`;
    const handle = normalizeHandle(input.handle);
    if (!handle) return NextResponse.json({ error: "Enter a valid creator handle" }, { status: 400 });

    const pinHash = await hash(input.pin, 12);
    const email = input.email?.trim() || `${handle}.${userId.slice(-8)}@creator.gizet.local`;
    const code = input.discountCode.toUpperCase();

    await transaction(async (client) => {
      await client.query(`
        INSERT INTO creators (id, name, handle, platform, followers, status, tier, commission_rate, discount_code)
        VALUES ($1,$2,$3,$4,$5,'active','starter',$6,$7)
      `, [creatorId, input.name.trim(), handle, input.platform, input.followers, input.commissionRate, code]);
      await client.query(`
        INSERT INTO users (id, email, password_hash, role, creator_id, status)
        VALUES ($1, LOWER($2), $3, 'creator', $4, 'active')
      `, [userId, email, pinHash, creatorId]);
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || new URL(request.url).origin;
    return NextResponse.json({
      ok: true,
      creatorId,
      handle,
      code,
      loginUrl: `${appUrl.replace(/\/$/, "")}/login?creator=${encodeURIComponent(code)}`,
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create creator";
    return NextResponse.json({ error: message.includes("duplicate key") ? "Email, handle or code already exists" : message }, { status: 400 });
  }
}
