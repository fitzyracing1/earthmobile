import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const statusColor = { confirmed: "#22c55e", pending: "#f59e0b", opted_out: "#ef4444" };

export default function SubscriberList() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    base44.entities.Subscriber.list("-created_date", 200)
      .then(setSubs)
      .finally(() => setLoading(false));
  }, []);

  const filtered = subs.filter(s =>
    !search || s.phone?.toLowerCase().includes(search.toLowerCase()) || s.status?.includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 9, letterSpacing: 4, color: "#4b5563", marginBottom: 6 }}>EARTH · ADMIN</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#f9fafb", margin: 0 }}>Subscribers</h1>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by phone or status..."
          style={{ background: "#0d0f12", border: "1px solid #1a1d24", borderRadius: 4, padding: "10px 14px", color: "#f9fafb", fontSize: 13, width: 280, outline: "none" }}
        />
      </div>

      <div style={{ background: "#0d0f12", border: "1px solid #1a1d24", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1a1d24" }}>
              {["Phone Number", "Status", "Platform", "Push Count", "Last Push", ""].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 9, letterSpacing: 3, color: "#4b5563", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} style={{ padding: 24, fontSize: 13, color: "#4b5563" }}>Loading...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 24, fontSize: 13, color: "#4b5563" }}>No subscribers found.</td></tr>
            )}
            {filtered.map(s => (
              <tr key={s.id} style={{ borderBottom: "1px solid #1a1d2466" }}>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "#f9fafb", fontFamily: "monospace" }}>{s.phone}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: statusColor[s.status] || "#9ca3af" }}>
                    ● {s.status?.toUpperCase() || "—"}
                  </span>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 12, color: "#6b7280" }}>{s.platform || "—"}</td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "#9ca3af" }}>{s.push_count || 0}</td>
                <td style={{ padding: "14px 16px", fontSize: 12, color: "#6b7280" }}>
                  {s.last_push_at ? new Date(s.last_push_at).toLocaleString() : "—"}
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <Link to={`/subscriber-details?id=${s.id}`} style={{ fontSize: 11, color: "#22c55e", textDecoration: "none", letterSpacing: 1 }}>VIEW →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}