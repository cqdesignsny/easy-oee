/**
 * Operator session — signed HTTP-only cookie set after a successful PIN login.
 *
 * Why a custom cookie instead of Clerk: operators share a tablet on the shop
 * floor and don't have personal email/passwords. They authenticate by picking
 * their name and entering a 4-digit PIN.
 *
 * Cookie payload (JSON, base64url): { operatorId, companyId, exp }
 * Signature: HMAC-SHA256(payload, OPERATOR_SESSION_SECRET) → base64url
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "eo_op";
const TTL_HOURS = 12;

export type OperatorSession = {
  operatorId: string;
  companyId: string;
  exp: number; // unix seconds
};

function getSecret(): string {
  const s = process.env.OPERATOR_SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "OPERATOR_SESSION_SECRET must be set (>=16 chars). Add it to .env.local and Vercel.",
    );
  }
  return s;
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

export function encodeSession(s: OperatorSession): string {
  const payload = b64urlEncode(Buffer.from(JSON.stringify(s)));
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string | undefined): OperatorSession | null {
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
    const data = JSON.parse(b64urlDecode(payload).toString("utf8")) as OperatorSession;
    if (typeof data.exp !== "number" || data.exp * 1000 < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export async function setOperatorCookie(operatorId: string, companyId: string) {
  const exp = Math.floor(Date.now() / 1000) + TTL_HOURS * 3600;
  const token = encodeSession({ operatorId, companyId, exp });
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_HOURS * 3600,
  });
}

export async function clearOperatorCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getOperatorSession(): Promise<OperatorSession | null> {
  const jar = await cookies();
  return decodeSession(jar.get(COOKIE_NAME)?.value);
}

/** Throws on missing/invalid session — use inside server actions and protected pages. */
export async function requireOperator(): Promise<OperatorSession> {
  const s = await getOperatorSession();
  if (!s) throw new Error("Operator session required. Sign in at /pin.");
  return s;
}
