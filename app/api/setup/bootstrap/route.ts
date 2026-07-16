import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { schemaStatements } from "@/lib/schema";
import { query, transaction } from "@/lib/db";

export async function POST(request: Request) {
  const supplied = request.headers.get("x-bootstrap-secret") || (await request.json().catch(() => ({}))).secret;
  if (!process.env.BOOTSTRAP_SECRET || supplied !== process.env.BOOTSTRAP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 10) {
    return NextResponse.json({ error: "ADMIN_EMAIL and ADMIN_PASSWORD (10+ characters) are required" }, { status: 400 });
  }
  try {
    await transaction(async (client) => {
      for (const statement of schemaStatements) await client.query(statement);
      const passwordHash = await hash(password, 12);
      await client.query(`
        INSERT INTO users (id, email, password_hash, role, status)
        VALUES ($1, LOWER($2), $3, 'admin', 'active')
        ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin', status = 'active'
      `, [`usr_${crypto.randomUUID()}`, email, passwordHash]);
    });
    const count = await query<{ count: string }>("SELECT COUNT(*)::text AS count FROM users");
    return NextResponse.json({ ok: true, users: Number(count.rows[0]?.count || 0) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Bootstrap failed" }, { status: 500 });
  }
}
