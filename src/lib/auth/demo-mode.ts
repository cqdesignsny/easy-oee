/**
 * Demo mode marker cookie. Presence of this cookie means the user is in a
 * Louis-style sales demo: they get the seeded Maple Manufacturing tenant,
 * a banner reminding them, and a "Sign Up" CTA on every screen.
 *
 * The actual auth (admin + operator session) is set with the regular cookies
 * pointed at the seed user IDs. This cookie just toggles the chrome.
 */

import { cookies } from "next/headers";

const COOKIE_NAME = "eo_demo";
const TTL_HOURS = 4;

export async function setDemoCookie() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "1", {
    httpOnly: false, // readable client-side so the banner can pick it up
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_HOURS * 3600,
  });
}

export async function clearDemoCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function isDemoMode(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value === "1";
}
