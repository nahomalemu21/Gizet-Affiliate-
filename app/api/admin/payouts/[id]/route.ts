import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/api-auth";
import { transaction } from "@/lib/db";

const schema = z.object({ status: z.enum(["approved", "paid"]), transactionReference: z.string().max(120).optional() });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("admin");
  if (auth.response) return auth.response;
  try {
    const { id } = await context.params;
    const input = schema.parse(await request.json());
    await transaction(async (client) => {
      const payout = await client.query("SELECT id FROM payouts WHERE id=$1 FOR UPDATE", [id]);
      if (!payout.rowCount) throw new Error("Payout not found");
      if (input.status === "approved") {
        await client.query("UPDATE payouts SET status='approved', approved_at=NOW(), transaction_reference=COALESCE($2,transaction_reference) WHERE id=$1", [id, input.transactionReference || null]);
      } else {
        await client.query("UPDATE payouts SET status='paid', approved_at=COALESCE(approved_at,NOW()), paid_at=NOW(), transaction_reference=COALESCE($2,transaction_reference) WHERE id=$1", [id, input.transactionReference || null]);
        await client.query("UPDATE affiliate_orders SET commission_status='paid', updated_at=NOW() WHERE payout_id=$1", [id]);
      }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Payout update failed" }, { status: 400 });
  }
}
