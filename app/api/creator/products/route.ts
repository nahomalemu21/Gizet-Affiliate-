import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/api-auth";
import { query } from "@/lib/db";
import { listProductsForCreatorEditor } from "@/lib/data";

const inputSchema = z.object({
  productId: z.string().min(1),
  selected: z.boolean(),
  featured: z.boolean().optional().default(false),
});

export async function GET() {
  const auth = await requireApiRole("creator");
  if (auth.response) return auth.response;
  if (!auth.session.creatorId) return NextResponse.json({ error: "Creator profile missing" }, { status: 400 });
  return NextResponse.json({ products: await listProductsForCreatorEditor(auth.session.creatorId) });
}

export async function POST(request: Request) {
  const auth = await requireApiRole("creator");
  if (auth.response) return auth.response;
  if (!auth.session.creatorId) return NextResponse.json({ error: "Creator profile missing" }, { status: 400 });

  try {
    const input = inputSchema.parse(await request.json());
    const product = await query<{ id: string }>(
      "SELECT id FROM affiliate_products WHERE id = $1 AND active = TRUE LIMIT 1",
      [input.productId],
    );
    if (!product.rows[0]) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    if (input.selected) {
      await query(`
        INSERT INTO creator_products (creator_id, product_id, active, featured, position)
        VALUES (
          $1,
          $2,
          TRUE,
          $3,
          (SELECT COALESCE(MAX(position), -1) + 1 FROM creator_products WHERE creator_id = $1)
        )
        ON CONFLICT (creator_id, product_id) DO UPDATE SET
          active = TRUE,
          featured = EXCLUDED.featured
      `, [auth.session.creatorId, input.productId, input.featured]);
    } else {
      await query(
        "UPDATE creator_products SET active = FALSE, featured = FALSE WHERE creator_id = $1 AND product_id = $2",
        [auth.session.creatorId, input.productId],
      );
    }

    return NextResponse.json({ ok: true, productId: input.productId, selected: input.selected });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update storefront" }, { status: 400 });
  }
}
