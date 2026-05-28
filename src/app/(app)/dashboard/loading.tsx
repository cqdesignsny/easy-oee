export default function DashboardLoading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "3px solid rgba(3, 191, 181, 0.2)",
          borderTopColor: "var(--accent)",
          animation: "eo-spin 0.8s linear infinite",
        }}
      />
      <style>{`
        @keyframes eo-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
