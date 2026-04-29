/**
 * App-area layout. Full-screen, no marketing chrome.
 * Used by /pin, /operator, /shift/[id], /shift/[id]/summary, /dashboard.
 *
 * Renders the DemoBanner above all content when the demo cookie is set.
 */
import { isDemoMode } from "@/lib/auth/demo-mode";
import { DemoBanner } from "@/components/demo/DemoBanner";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const demo = await isDemoMode();
  return (
    <div className="app-shell">
      {demo && <DemoBanner />}
      {children}
    </div>
  );
}
