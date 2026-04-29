/**
 * Theme helpers — read/write the `eo-theme` cookie used to drive the
 * `data-theme` attribute on <html>. Cookie is set by the ThemeToggle
 * client component; the root layout reads it server-side so the first
 * paint already matches the user's preference (no flash).
 */

import { cookies } from "next/headers";

export type Theme = "light" | "dark";
export const THEME_COOKIE = "eo-theme";
export const DEFAULT_THEME: Theme = "dark";

export async function getServerTheme(): Promise<Theme> {
  const jar = await cookies();
  const v = jar.get(THEME_COOKIE)?.value;
  return v === "light" || v === "dark" ? v : DEFAULT_THEME;
}
