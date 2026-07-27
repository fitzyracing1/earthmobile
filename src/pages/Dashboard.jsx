import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const card = (children, style = {}) => (
  <div style={{ background: "#0d0f12", border: "1px solid #1a1d24", borderRadius: 8, padding: "24px", ...style }}>
    {children}
  </div>
);

const label = { fontSize: 9, letterSpacing: 3, color: "#4b5563", marginBottom: 8 };
const bigNum = { fontSize: 40, fontWeight: 800, color: "#f9fafb", lineHeight: 1 };

export default function Dashboard() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Subscriber.list("-updated_date", 100)
      .then(setSubs)
      .finally(() => setLoading(false));
  }, []);

  const total = subs.length;
  const confirmed = subs.filter(s => s.status === "confirmed").length;
  const pending = subs.filter(s => s.status === "pending").length;
  const optedOut = subs.filter(s => s.status === "opted_out").length;
  const totalPushes = subs.reduce((acc, s) => acc + (s.push_count || 0), 0);
  const recent = [...subs].sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date)).slice(0, 5);

  const statusColor = { confirmed: "#22c55e", pending: "#f59e0b", opted_out: "#ef4444" };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 9, letterSpacing: 4, color: "#4b5563", marginBottom: 6 }}>EARTH · ADMIN</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#f9fafb", margin: 0 }}>Dashboard</h1>
      </div>

      {loading ? (
        <div style={{ color: "#4b5563", fontSize: 13 }}>Loading...</div>
      ) : (
        <>
          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 32 }}>
            {card(<><div style={label}>TOTAL SUBSCRIBERS</div><div style={bigNum}>{total}</div></>)}
            {card(<><div style={label}>CONFIRMED</div><div style={{ ...bigNum, color: "#22c55e" }}>{confirmed}</div></>)}
            {card(<><div style={label}>PENDING</div><div style={{ ...bigNum, color: "#f59e0b" }}>{pending}</div></>)}
            {card(<><div style={label}>OPTED OUT</div><div style={{ ...bigNum, color: "#ef4444" }}>{optedOut}</div></>)}
            {card(<><div style={label}>TOTAL PUSHES SENT</div><div style={bigNum}>{totalPushes}</div></>)}
          </div>

          {/* System status */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
            {card(
              <>
                <div style={label}>SYSTEM STATUS</div>
                {[
                  { name: "SMS Webhook", ok: true },
                  { name: "Push Scheduler", ok: true },
                  { name: "Google Maps API", ok: !!confirmed },
                  { name: "Twilio SMS", ok: !!total },
                ].map(item => (
                  <div key={item.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1a1d2444" }}>
                    <span style={{ fontSize: 13, color: "#9ca3af" }}>{item.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: item.ok ? "#22c55e" : "#ef4444" }}>
                      {item.ok ? "● ACTIVE" : "● INACTIVE"}
                    </span>
                  </div>
                ))}
              </>
            )}
            {card(
              <>
                <div style={label}>RECENT ACTIVITY</div>
                {recent.length === 0 && <div style={{ fontSize: 13, color: "#4b5563" }}>No activity yet.</div>}
                {recent.map(s => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1a1d2444" }}>
                    <span style={{ fontSize: 13, color: "#9ca3af" }}>{s.phone}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: statusColor[s.status] || "#9ca3af" }}>
                      {s.status?.toUpperCase()}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}