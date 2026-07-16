import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";

export async function requireApiRole(role: "admin" | "creator") {
  const session = await readSession();
  if (!session || session.role !== role) {
    return { session: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } as const;
  }
  return { session, response: null } as const;
}
