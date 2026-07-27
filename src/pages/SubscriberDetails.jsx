import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const statusColor = { confirmed: "#22c55e", pending: "#f59e0b", opted_out: "#ef4444" };

const Row = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #1a1d2466" }}>
    <span style={{ fontSize: 9, letterSpacing: 3, color: "#4b5563" }}>{label}</span>
    <span style={{ fontSize: 14, color: "#f9fafb", fontFamily: label.includes("COORD") || label.includes("PHONE") ? "monospace" : "inherit" }}>{value ?? "—"}</span>
  </div>
);

export default function SubscriberDetails() {
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const id = new URLSearchParams(window.location.search).get("id");

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    base44.entities.Subscriber.get(id)
      .then(setSub)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ color: "#4b5563", fontSize: 13 }}>Loading...</div>;
  if (!sub) return <div style={{ color: "#ef4444", fontSize: 13 }}>Subscriber not found.</div>;

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <button onClick={() => navigate("/subscribers")} style={{ background: "none", border: "none", color: "#4b5563", fontSize: 11, letterSpacing: 1, cursor: "pointer", padding: 0, marginBottom: 16 }}>← BACK TO LIST</button>
        <div style={{ fontSize: 9, letterSpacing: 4, color: "#4b5563", marginBottom: 6 }}>EARTH · ADMIN</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#f9fafb", margin: 0, fontFamily: "monospace" }}>{sub.phone}</h1>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: statusColor[sub.status] || "#9ca3af", marginTop: 8, display: "inline-block" }}>
          ● {sub.status?.toUpperCase()}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 32 }}>
        <div style={{ background: "#0d0f12", border: "1px solid #1a1d24", borderRadius: 8, padding: "24px" }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: "#4b5563", marginBottom: 16 }}>SUBSCRIBER INFO</div>
          <Row label="PHONE NUMBER" value={sub.phone} />
          <Row label="STATUS" value={sub.status?.toUpperCase()} />
          <Row label="PLATFORM" value={sub.platform?.toUpperCase() || "—"} />
          <Row label="DEVICE TOKEN" value={sub.device_token ? sub.device_token.slice(0, 20) + "…" : "—"} />
        </div>

        <div style={{ background: "#0d0f12", border: "1px solid #1a1d24", borderRadius: 8, padding: "24px" }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: "#4b5563", marginBottom: 16 }}>LOCATION & ACTIVITY</div>
          <Row label="HOME LAT COORD" value={sub.home_lat ?? "—"} />
          <Row label="HOME LNG COORD" value={sub.home_lng ?? "—"} />
          <Row label="TOTAL PUSH COUNT" value={sub.push_count ?? 0} />
          <Row label="LAST PUSH SENT" value={sub.last_push_at ? new Date(sub.last_push_at).toLocaleString() : "—"} />
          <Row label="SUBSCRIBED ON" value={sub.created_date ? new Date(sub.created_date).toLocaleString() : "—"} />
          <Row label="LAST UPDATED" value={sub.updated_date ? new Date(sub.updated_date).toLocaleString() : "—"} />
        </div>
      </div>
    </div>
  );
}