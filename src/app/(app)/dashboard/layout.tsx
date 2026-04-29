import Link from "next/link";
import { redirect } from "next/navigation";
import { ManagerNav } from "./manager-nav";
import { getAdminSession } from "@/lib/auth/admin-session";
import { signOutAdmin } from "@/server/actions/admin-auth";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { getServerT } from "@/components/i18n/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/sign-in");
  const t = await getServerT();

  return (
    <div className="mgr-shell">
      <aside className="mgr-side">
        <Link href="/dashboard" className="brand" style={{ display: "block", marginBottom: 32 }}>
          <Logo height={42} />
        </Link>
        <ManagerNav />
        <div className="mgr-side-foot">
          <LanguageSwitcher />
          <ThemeToggle />
          <form action={signOutAdmin}>
            <button type="submit" className="mgr-signout">
              {t("mgr.nav.signOut")}
            </button>
          </form>
        </div>
      </aside>
      <div className="mgr-content">{children}</div>
    </div>
  );
}
