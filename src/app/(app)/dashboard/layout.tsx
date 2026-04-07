import Link from "next/link";
import { ManagerNav } from "./manager-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mgr-shell">
      <aside className="mgr-side">
        <Link href="/dashboard" className="brand">Easy OEE</Link>
        <ManagerNav />
      </aside>
      <div className="mgr-content">{children}</div>
    </div>
  );
}
