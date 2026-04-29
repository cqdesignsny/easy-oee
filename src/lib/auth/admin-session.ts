/**
 * Admin (manager) session — HMAC-signed cookie.
 *
 * Stand-in for Clerk while we ship the rest of the app. Used by both the
 * legacy single-password demo gate (`ADMIN_PASSWORD` env var) and the
 * self-serve signup flow that creates a real per-company manager user.
 *
 * Cookie payload: { role: "admin", userId, companyId, exp } signed HMAC-SHA256.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "eo_admin";
const TTL_HOURS = 24 * 14; // 14 days

export type AdminSession = {
  role: "admin";
  userId: string;
  companyId: string;
  exp: number;
};

function getSecret(): string {
  // Reuse the operator session secret since both are HMAC-signed cookies.
  // It's already set in all 3 Vercel envs.
  const s = process.env.OPERATOR_SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("OPERATOR_SESSION_SECRET must be set (>=16 chars).");
  }
  return s;
}

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

function b64urlEncode(buf: Buffer): string {
  return buf.toString("base64").replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}
function b64urlDecode(str: string): Buffer {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  return Buffer.from(str.replaceAll("-", "+").replaceAll("_", "/") + pad, "base64");
}
function sign(payload: string): string {
  return b64urlEncode(createHmac("sha256", getSecret()).update(payload).digest());
}

export function encodeAdminSession(s: AdminSession): string {
  const payload = b64urlEncode(Buffer.from(JSON.stringify(s)));
  return `${payload}.${sign(payload)}`;
}

export function decodeAdminSession(token: string | undefined): AdminSession | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  let expected: string;
  try {
    expected = sign(payload);
  } catch {
    return null;
  }
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(b64urlDecode(payload).toString("utf8")) as AdminSession;
    if (data.role !== "admin") return null;
    if (typeof data.userId !== "string" || typeof data.companyId !== "string") return null;
    if (typeof data.exp !== "number" || data.exp * 1000 < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export async function setAdminCookie(userId: string, companyId: string) {
  const exp = Math.floor(Date.now() / 1000) + TTL_HOURS * 3600;
  const token = encodeAdminSession({ role: "admin", userId, companyId, exp });
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_HOURS * 3600,
  });
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  return decodeAdminSession(jar.get(COOKIE_NAME)?.value);
}

/** Constant-time check against ADMIN_PASSWORD env var (legacy demo backdoor). */
export function verifyAdminPassword(input: string): boolean {
  const expected = getAdminPassword();
  if (!expected) return false;
  if (input.length !== expected.length) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
