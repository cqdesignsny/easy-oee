/**
 * Server-side i18n helpers.
 *
 * Use these inside Server Components and Server Actions when you need
 * translated text without making the component a client component.
 *
 * The locale is read from the `eo-locale` cookie that the client
 * LanguageProvider sets when the user picks a language. The cookie is the
 * authoritative source for SSR; localStorage on the client just mirrors it.
 *
 * Usage:
 *   import { getServerT } from "@/components/i18n/server";
 *   export default async function MyPage() {
 *     const t = await getServerT();
 *     return <h1>{t("home.h1.line1")}</h1>;
 *   }
 */

import { cookies } from "next/headers";
import { dictionaries, LOCALES, type Locale } from "./dictionaries";

export async function getServerLocale(): Promise<Locale> {
  const jar = await cookies();
  const v = jar.get("eo-locale")?.value as Locale | undefined;
  return v && LOCALES.includes(v) ? v : "en";
}

export async function getServerT(): Promise<(key: string) => string> {
  const locale = await getServerLocale();
  return (key: string) => dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? key;
}
