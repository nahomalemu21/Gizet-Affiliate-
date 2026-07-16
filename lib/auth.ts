import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Session = {
  userId: string;
  email: string;
  role: "admin" | "creator";
  creatorId: string | null;
};

const COOKIE_NAME = "gizet_affiliate_session";

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters");
  return new TextEncoder().encode(value);
}

export async function signSession(session: Session) {
  return new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function readSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.role !== "admin" && payload.role !== "creator") return null;
    return {
      userId: String(payload.userId),
      email: String(payload.email),
      role: payload.role,
      creatorId: payload.creatorId ? String(payload.creatorId) : null,
    };
  } catch {
    return null;
  }
}

export async function setSession(session: Session) {
  const store = await cookies();
  store.set(COOKIE_NAME, await signSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function requireSession(role?: "admin" | "creator") {
  const session = await readSession();
  if (!session) redirect("/login");
  if (role && session.role !== role) redirect(session.role === "admin" ? "/admin" : "/creator");
  return session;
}
