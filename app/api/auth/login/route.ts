import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { setSession } from "@/lib/auth";

const inputSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("admin"), email: z.string().email(), password: z.string().min(8) }),
  z.object({ mode: z.literal("creator"), code: z.string().min(2).max(40), pin: z.string().regex(/^\d{4}$/) }),
]);

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  role: "admin" | "creator";
  creator_id: string | null;
  status: string;
  failed_login_attempts: number;
  locked_until: string | null;
};

async function recordFailure(user: UserRow | undefined) {
  if (!user) return false;
  const attempts = Number(user.failed_login_attempts || 0) + 1;
  const shouldLock = attempts >= 5;
  await query(
    `UPDATE users
     SET failed_login_attempts=$2,
         locked_until=CASE WHEN $3 THEN NOW() + INTERVAL '15 minutes' ELSE locked_until END
     WHERE id=$1`,
    [user.id, shouldLock ? 0 : attempts, shouldLock],
  );
  return shouldLock;
}

export async function POST(request: Request) {
  try {
    const input = inputSchema.parse(await request.json());
    let user: UserRow | undefined;
    let secretValue: string;

    if (input.mode === "admin") {
      const result = await query<UserRow>(
        "SELECT * FROM users WHERE role='admin' AND LOWER(email)=LOWER($1) LIMIT 1",
        [input.email],
      );
      user = result.rows[0];
      secretValue = input.password;
    } else {
      const result = await query<UserRow>(
        `SELECT u.* FROM users u
         JOIN creators c ON c.id=u.creator_id
         WHERE u.role='creator'
           AND (LOWER(c.handle)=LOWER($1) OR UPPER(c.discount_code)=UPPER($1))
         LIMIT 1`,
        [input.code.trim().replace(/^@/, "")],
      );
      user = result.rows[0];
      secretValue = input.pin;
    }

    if (user?.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
      return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
    }

    if (!user || user.status !== "active" || !(await compare(secretValue, user.password_hash))) {
      const locked = await recordFailure(user);
      return NextResponse.json(
        { error: locked ? "Too many attempts. Try again in 15 minutes." : input.mode === "creator" ? "Incorrect creator code or PIN" : "Incorrect email or password" },
        { status: locked ? 429 : 401 },
      );
    }

    await query(
      "UPDATE users SET last_login_at=NOW(), failed_login_attempts=0, locked_until=NULL WHERE id=$1",
      [user.id],
    );
    await setSession({ userId: user.id, email: user.email, role: user.role, creatorId: user.creator_id });
    return NextResponse.json({ ok: true, role: user.role });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json(
      { error: message.includes("DATABASE_URL") ? "The portal database has not been configured yet." : "Login failed" },
      { status: 400 },
    );
  }
}
