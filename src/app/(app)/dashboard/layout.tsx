import Link from "next/link";
import { redirect } from "next/navigation";
import { ManagerNav } from "./manager-nav";
import { getAdminSession } from "@/lib/auth/admin-session";
import { signOutAdmin } from "@/server/actions/admin-auth";
import { Logo } from "@/components/Logo";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/sign-in");

  return (
    <div className="mgr-shell">
      <aside className="mgr-side">
        <Link href="/dashboard" className="brand" style={{ display: "block", marginBottom: 32 }}>
          <Logo height={42} />
        </Link>
        <ManagerNav />
        <form action={signOutAdmin} style={{ marginTop: 24 }}>
          <button
            type="submit"
            style={{
              background: "transparent",
              border: "1px solid var(--border2)",
              color: "var(--muted2)",
              padding: "10px 14px",
              borderRadius: 6,
              cursor: "pointer",
              width: "100%",
              fontSize: 14,
              fontFamily: "inherit",
            }}
          >
            Sign out
          </button>
        </form>
      </aside>
      <div className="mgr-content">{children}</div>
    </div>
  );
}
