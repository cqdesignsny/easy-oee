import { Resend } from "resend";

let cached: Resend | null = null;

export function getResendClient(): Resend {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error(
      "RESEND_API_KEY is not set. Add it to Vercel env or .env.local before sending mail.",
    );
  }
  cached = new Resend(key);
  return cached;
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EASY_OEE_FROM_EMAIL);
}

export function fromAddress(): string {
  return process.env.EASY_OEE_FROM_EMAIL ?? "Easy OEE <reports@easy-oee.com>";
}
