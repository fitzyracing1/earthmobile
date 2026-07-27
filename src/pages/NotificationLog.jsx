import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const statusColor = { confirmed: "#22c55e", pending: "#f59e0b", opted_out: "#ef4444" };

export default function NotificationLog() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Derive notification log from subscribers that have received pushes
    base44.entities.Subscriber.list("-last_push_at", 200)
      .then(data => setSubs(data.filter(s => s.last_push_at)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 9, letterSpacing: 4, color: "#4b5563", marginBottom: 6 }}>EARTH · ADMIN</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#f9fafb", margin: 0 }}>Notification Log</h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 10 }}>History of push notifications delivered to subscribers.</p>
      </div>

      <div style={{ background: "#0d0f12", border: "1px solid #1a1d24", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1a1d24" }}>
              {["Recipient", "Status", "Platform", "Push Count", "Last Notification", "Delivery"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 9, letterSpacing: 3, color: "#4b5563", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} style={{ padding: 24, fontSize: 13, color: "#4b5563" }}>Loading...</td></tr>
            )}
            {!loading && subs.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 24, fontSize: 13, color: "#4b5563" }}>No notifications sent yet.</td></tr>
            )}
            {subs.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: "1px solid #1a1d2444" }}>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "#f9fafb", fontFamily: "monospace" }}>{s.phone}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: statusColor[s.status] || "#9ca3af" }}>
                    ● {s.status?.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 12, color: "#6b7280" }}>{s.platform?.toUpperCase() || "—"}</td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "#9ca3af" }}>{s.push_count || 0}</td>
                <td style={{ padding: "14px 16px", fontSize: 12, color: "#6b7280" }}>
                  {new Date(s.last_push_at).toLocaleString()}
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "#22c55e" }}>● DELIVERED</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!loading && subs.length > 0 && (
        <div style={{ marginTop: 12, fontSize: 11, color: "#374151", letterSpacing: 1 }}>
          {subs.length} notification record{subs.length !== 1 ? "s" : ""} · {subs.reduce((a, s) => a + (s.push_count || 0), 0)} total pushes delivered
        </div>
      )}
    </div>
  );
}