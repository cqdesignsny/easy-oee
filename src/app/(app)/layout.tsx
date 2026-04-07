/**
 * App-area layout — full-screen, no marketing chrome.
 * Used by /pin, /operator, /shift/[id], /shift/[id]/summary, /dashboard.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="app-shell">{children}</div>;
}
