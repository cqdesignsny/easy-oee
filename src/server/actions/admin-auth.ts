"use server";

import { redirect } from "next/navigation";
import {
  setAdminCookie,
  clearAdminCookie,
  verifyAdminPassword,
} from "@/lib/auth/admin-session";

export type AdminSignInState = { error?: string };

export async function signInAdmin(
  _prev: AdminSignInState,
  formData: FormData,
): Promise<AdminSignInState> {
  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "Enter your password." };
  if (!verifyAdminPassword(password)) {
    return { error: "Wrong password." };
  }
  await setAdminCookie();
  redirect("/dashboard");
}

export async function signOutAdmin() {
  await clearAdminCookie();
  redirect("/sign-in");
}
