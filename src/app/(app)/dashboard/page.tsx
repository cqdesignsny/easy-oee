export const metadata = { title: "Dashboard — Easy OEE" };

export default function DashboardPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div className="section-tag">Manager Dashboard</div>
      <h1 className="eo-h2">COMING SOON</h1>
      <p className="section-intro" style={{ textAlign: "center" }}>
        Auth + live dashboard ship in the next iteration. Marketing site is live now.
      </p>
    </main>
  );
}
