import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { setSession } from "@/lib/auth";

const inputSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

type UserRow = { id: string; email: string; password_hash: string; role: "admin" | "creator"; creator_id: string | null; status: string };

export async function POST(request: Request) {
  try {
    const input = inputSchema.parse(await request.json());
    const result = await query<UserRow>("SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1", [input.email]);
    const user = result.rows[0];
    if (!user || user.status !== "active" || !(await compare(input.password, user.password_hash))) {
      return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
    }
    await query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [user.id]);
    await setSession({ userId: user.id, email: user.email, role: user.role, creatorId: user.creator_id });
    return NextResponse.json({ ok: true, role: user.role });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json({ error: message.includes("DATABASE_URL") ? "The portal database has not been configured yet." : "Login failed" }, { status: 400 });
  }
}
