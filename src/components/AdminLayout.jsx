import { Link, useLocation, Outlet } from "react-router-dom";

const nav = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Subscribers", path: "/subscribers" },
  { label: "Notification Log", path: "/notification-log" },
  { label: "Settings", path: "/settings" },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  return (
    <div style={{ minHeight: "100vh", background: "#070809", color: "#e5e7eb", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", display: "flex" }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: "#0d0f12", borderRight: "1px solid #1a1d24", padding: "28px 0", flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 24px 28px", borderBottom: "1px solid #1a1d24" }}>
          <div style={{ fontSize: 9, letterSpacing: 5, color: "#4b5563" }}>EARTH</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#f9fafb", letterSpacing: 1 }}>Drive Reminder</div>
        </div>
        <nav style={{ padding: "20px 0" }}>
          {nav.map(item => (
            <Link key={item.path} to={item.path} style={{
              display: "block",
              padding: "10px 24px",
              fontSize: 13,
              fontWeight: pathname === item.path ? 600 : 400,
              color: pathname === item.path ? "#22c55e" : "#9ca3af",
              background: pathname === item.path ? "#22c55e12" : "transparent",
              borderLeft: pathname === item.path ? "2px solid #22c55e" : "2px solid transparent",
              textDecoration: "none",
              letterSpacing: 0.5,
            }}>{item.label}</Link>
          ))}
        </nav>
        <div style={{ marginTop: "auto", padding: "16px 24px", borderTop: "1px solid #1a1d24" }}>
          <Link to="/" style={{ fontSize: 11, color: "#4b5563", textDecoration: "none", letterSpacing: 1 }}>← BACK TO SITE</Link>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: "auto", padding: "40px 48px" }}>
        <Outlet />
      </main>
    </div>
  );
}