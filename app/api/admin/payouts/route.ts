import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/api-auth";
import { transaction } from "@/lib/db";
import { listPayouts } from "@/lib/data";

const schema = z.object({ creatorId: z.string().min(1) });

export async function GET() {
  const auth = await requireApiRole("admin");
  if (auth.response) return auth.response;
  return NextResponse.json({ payouts: await listPayouts() });
}

export async function POST(request: Request) {
  const auth = await requireApiRole("admin");
  if (auth.response) return auth.response;
  try {
    const { creatorId } = schema.parse(await request.json());
    const payoutId = `po_${crypto.randomUUID()}`;
    const result = await transaction(async (client) => {
      const orders = await client.query<{ id: string; commission_amount: string }>(`
        SELECT id, commission_amount FROM affiliate_orders
        WHERE creator_id=$1 AND commission_status='available' AND payout_id IS NULL
        ORDER BY delivered_at ASC FOR UPDATE
      `, [creatorId]);
      const amount = orders.rows.reduce((sum, order) => sum + Number(order.commission_amount), 0);
      if (!orders.rowCount || amount < 1) throw new Error("No available delivered commissions for this creator");
      const creator = await client.query<{ payout_method: string | null }>("SELECT payout_method FROM creators WHERE id=$1", [creatorId]);
      await client.query(`INSERT INTO payouts (id, creator_id, amount, status, method) VALUES ($1,$2,$3,'pending',$4)`, [payoutId, creatorId, amount, creator.rows[0]?.payout_method || null]);
      await client.query(`UPDATE affiliate_orders SET payout_id=$1, commission_status='processing', updated_at=NOW() WHERE id = ANY($2::text[])`, [payoutId, orders.rows.map((order) => order.id)]);
      return { amount, orders: orders.rowCount };
    });
    return NextResponse.json({ ok: true, payoutId, ...result }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create payout" }, { status: 400 });
  }
}
