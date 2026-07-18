import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/api-auth";
import { query } from "@/lib/db";

const schema = z.object({ status: z.enum(["pending", "confirmed", "out_for_delivery", "delivered", "rejected", "cancelled", "returned"]) });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("admin");
  if (auth.response) return auth.response;
  try {
    const { id } = await context.params;
    const { status } = schema.parse(await request.json());
    const commissionStatus = status === "delivered" ? "available" : ["rejected", "cancelled", "returned"].includes(status) ? "void" : "pending";
    const result = await query(`
      UPDATE affiliate_orders SET order_status=$2, commission_status=$3,
        delivered_at=CASE WHEN $2='delivered' THEN COALESCE(delivered_at,NOW()) ELSE delivered_at END,
        updated_at=NOW()
      WHERE id=$1 RETURNING id, order_status, commission_status
    `, [id, status, commissionStatus]);
    if (!result.rowCount) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ ok: true, order: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Update failed" }, { status: 400 });
  }
}
