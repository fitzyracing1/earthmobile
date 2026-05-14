import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────
//  SIMULATED MAPS API
// ─────────────────────────────────────────────────────────────
function simulateMapsAPI(place) {
  const traffic = 0.7 + Math.random() * 0.6;
  const liveMinutes = Math.round(place.baseMinutes * traffic);
  const congestion = traffic > 1.2 ? "heavy" : traffic > 1.0 ? "moderate" : "clear";
  return {
    destination: place.name,
    eta_minutes: liveMinutes,
    base_minutes: place.baseMinutes,
    traffic_condition: congestion,
    distance_km: (place.baseMinutes * 0.6).toFixed(1),
  };
}

// ─────────────────────────────────────────────────────────────
//  PUSH NOTIFICATION TRIGGER LOGIC
// ─────────────────────────────────────────────────────────────
function evaluateTriggers(place, eta) {
  const notifications = [];
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;

  const improvement = (place.baseMinutes - eta.eta_minutes) / place.baseMinutes;
  if (improvement >= 0.25 && eta.eta_minutes <= 15) {
    notifications.push({
      type: "fast_window",
      title: `Good time to head to ${place.name}`,
      body: `${eta.eta_minutes} min away now — ${place.baseMinutes - eta.eta_minutes} min faster than usual`,
      urgency: "normal",
      icon: "🟢",
    });
  }

  if (place.closingHour) {
    const minutesToClose = (place.closingHour - hour) * 60;
    const leaveBy = minutesToClose - eta.eta_minutes - (place.minVisitMinutes || 20);
    if (leaveBy >= 0 && leaveBy <= 20) {
      notifications.push({
        type: "closing_soon",
        title: `Leave now for ${place.name}`,
        body: `Closes in ${Math.round(minutesToClose)} min · ${eta.eta_minutes} min drive · Leave within ${Math.max(0, Math.round(leaveBy))} min`,
        urgency: "high",
        icon: "🔴",
      });
    } else if (leaveBy > 20 && leaveBy <= 45) {
      notifications.push({
        type: "closing_warning",
        title: `${place.name} closes soon`,
        body: `Closes at ${formatHour(place.closingHour)} · ${eta.eta_minutes} min away`,
        urgency: "medium",
        icon: "🟡",
      });
    }
  }

  if (place.lastTraffic === "heavy" && eta.traffic_condition === "clear") {
    notifications.push({
      type: "traffic_cleared",
      title: `Traffic cleared near ${place.name}`,
      body: `Route is now open · ${eta.eta_minutes} min vs ${place.baseMinutes} min usual`,
      urgency: "normal",
      icon: "🟢",
    });
  }

  return notifications;
}

function formatHour(h) {
  const period = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:00 ${period}`;
}

// ─────────────────────────────────────────────────────────────
//  DEFAULT PLACES
// ─────────────────────────────────────────────────────────────
const DEFAULT_PLACES = [
  { id: 1, name: "Coffee Shop",   emoji: "☕", baseMinutes: 6,  closingHour: 14, minVisitMinutes: 15, enabled: true,  lastTraffic: null },
  { id: 2, name: "Pharmacy",      emoji: "💊", baseMinutes: 9,  closingHour: 18, minVisitMinutes: 20, enabled: true,  lastTraffic: null },
  { id: 3, name: "Grocery Store", emoji: "🛒", baseMinutes: 11, closingHour: 21, minVisitMinutes: 30, enabled: true,  lastTraffic: "heavy" },
  { id: 4, name: "Post Office",   emoji: "📬", baseMinutes: 14, closingHour: 17, minVisitMinutes: 10, enabled: false, lastTraffic: null },
  { id: 5, name: "Gym",           emoji: "🏋️", baseMinutes: 8,  closingHour: 22, minVisitMinutes: 45, enabled: true,  lastTraffic: null },
];

const URGENCY_COLOR = { high: "#ef4444", medium: "#f59e0b", normal: "#22c55e" };

// ─────────────────────────────────────────────────────────────
//  CHIP
// ─────────────────────────────────────────────────────────────
function Chip({ label, color }) {
  return (
    <span style={{
      background: `${color}18`,
      border: `1px solid ${color}44`,
      color,
      borderRadius: 3,
      padding: "2px 8px",
      fontSize: 10,
      letterSpacing: 1,
      fontWeight: 600,
    }}>
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
//  PLACES VIEW
// ─────────────────────────────────────────────────────────────
function PlacesView({ places, etas, togglePlace }) {
  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ padding: "16px 20px 8px", fontSize: 10, letterSpacing: 3, color: "#4b5563" }}>
        MONITORED PLACES · Maps API polls every 6s when live
      </div>

      {places.map(place => {
        const eta = etas[place.id];
        const improvement = eta ? Math.round(((place.baseMinutes - eta.eta_minutes) / place.baseMinutes) * 100) : null;
        return (
          <div key={place.id} style={{
            margin: "0 16px 8px",
            background: "#0d0f12",
            border: `1px solid ${place.enabled ? "#1a1d24" : "#111318"}`,
            borderRadius: 6,
            padding: "14px 16px",
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
            opacity: place.enabled ? 1 : 0.45,
            transition: "opacity 0.2s",
          }}>
            <span style={{ fontSize: 26, lineHeight: 1 }}>{place.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f9fafb" }}>{place.name}</div>
                  <div style={{ fontSize: 10, color: "#4b5563", marginTop: 2 }}>
                    Baseline {place.baseMinutes} min
                    {place.closingHour && ` · Closes ${formatHour(place.closingHour)}`}
                  </div>
                </div>
                {/* Toggle */}
                <div
                  onClick={() => togglePlace(place.id)}
                  style={{
                    width: 36, height: 20,
                    background: place.enabled ? "#22c55e" : "#1f2937",
                    borderRadius: 10,
                    position: "relative",
                    transition: "background 0.2s",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    position: "absolute", top: 3,
                    left: place.enabled ? 18 : 3,
                    width: 14, height: 14,
                    background: "#fff",
                    borderRadius: "50%",
                    transition: "left 0.2s",
                  }} />
                </div>
              </div>

              {eta && place.enabled && (
                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Chip label={`${eta.eta_minutes} min now`} color={improvement > 20 ? "#22c55e" : "#6b7280"} />
                  <Chip
                    label={eta.traffic_condition}
                    color={eta.traffic_condition === "clear" ? "#22c55e" : eta.traffic_condition === "heavy" ? "#ef4444" : "#f59e0b"}
                  />
                  {improvement > 0 && <Chip label={`${improvement}% faster`} color="#22c55e" />}
                  {improvement < 0 && <Chip label={`${Math.abs(improvement)}% slower`} color="#ef4444" />}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* API architecture note */}
      <div style={{ margin: "16px", padding: "14px 16px", background: "#0d0f12", border: "1px solid #1a1d24", borderRadius: 6 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "#4b5563", marginBottom: 10 }}>REAL API WIRING</div>
        <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.8 }}>
          <span style={{ color: "#22c55e" }}>Apple Maps Server API</span> — ETA endpoint<br />
          <code style={{ color: "#9ca3af" }}>POST /v1/etas?origin=&lt;lat,lng&gt;&amp;destinations=…</code><br /><br />
          <span style={{ color: "#22c55e" }}>Google Places API</span> — hours/closing time<br />
          <code style={{ color: "#9ca3af" }}>GET /place/details/json?place_id=…&fields=opening_hours</code><br /><br />
          <span style={{ color: "#22c55e" }}>APNs</span> — push delivery<br />
          <code style={{ color: "#9ca3af" }}>POST https://api.push.apple.com/3/device/&lt;token&gt;</code>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  NOTIFICATIONS VIEW
// ─────────────────────────────────────────────────────────────
function NotificationsView({ notifications, polling, dismissNotif }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
      {notifications.length === 0 ? (
        <div style={{ textAlign: "center", color: "#374151", padding: "60px 20px", fontSize: 13 }}>
          {polling ? "Monitoring… notifications will appear here" : "Start the engine to begin monitoring"}
        </div>
      ) : notifications.map(n => (
        <div key={n.id} style={{
          background: "#0d0f12",
          border: `1px solid ${URGENCY_COLOR[n.urgency]}44`,
          borderLeft: `3px solid ${URGENCY_COLOR[n.urgency]}`,
          borderRadius: 6,
          padding: "14px 16px",
          marginBottom: 8,
          animation: "slideDown 0.3s ease",
        }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: "#1a1d24",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, flexShrink: 0,
            }}>
              🗺️
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: 10, color: "#4b5563", letterSpacing: 2, marginBottom: 3 }}>
                  NUDGE · {n.icon} {n.type.replace(/_/g, " ").toUpperCase()}
                </div>
                <button onClick={() => dismissNotif(n.id)} style={{
                  background: "transparent", border: "none",
                  color: "#374151", cursor: "pointer", fontSize: 13, padding: 0,
                }}>✕</button>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#f9fafb", marginBottom: 3 }}>{n.title}</div>
              <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.5 }}>{n.body}</div>
              <div style={{ fontSize: 10, color: "#374151", marginTop: 6 }}>
                {n.ts?.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  BACKEND / APNs LOG VIEW
// ─────────────────────────────────────────────────────────────
function BackendView({ delivered }) {
  const snippet = `// Send push via APNs HTTP/2
async function sendPush(deviceToken, payload) {
  const jwt = signJWT(teamId, keyId, privateKey);
  await fetch(
    \`https://api.push.apple.com/3/device/\${deviceToken}\`,
    {
      method: "POST",
      headers: {
        authorization: \`bearer \${jwt}\`,
        "apns-topic": "com.yourapp.nudge",
        "apns-priority": "10",
      },
      body: JSON.stringify({
        aps: {
          alert: { title: payload.title, body: payload.body },
          sound: "default",
          badge: 1,
        },
      }),
    }
  );
}`;

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
      <div style={{ fontSize: 10, letterSpacing: 3, color: "#4b5563", marginBottom: 12 }}>
        SIMULATED APNs DELIVERY LOG
      </div>
      {delivered.length === 0 ? (
        <div style={{ color: "#374151", textAlign: "center", padding: "60px 20px", fontSize: 13 }}>
          No pushes delivered yet
        </div>
      ) : delivered.map((d, i) => (
        <div key={i} style={{
          background: "#0d0f12",
          border: "1px solid #1a1d24",
          borderRadius: 4,
          padding: "10px 14px",
          marginBottom: 6,
          fontSize: 11,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: "#22c55e", letterSpacing: 1 }}>200 DELIVERED</span>
            <span style={{ color: "#374151" }}>{new Date(d.delivered_at).toLocaleTimeString()}</span>
          </div>
          <div style={{ color: "#9ca3af" }}>apns-id: <span style={{ color: "#6b7280" }}>{d.apns_id}</span></div>
          <div style={{ color: "#9ca3af" }}>title: <span style={{ color: "#e5e7eb" }}>{d.title}</span></div>
          <div style={{ color: "#9ca3af" }}>type: <span style={{ color: "#f59e0b" }}>{d.type}</span></div>
        </div>
      ))}

      <div style={{ marginTop: 16, background: "#0d0f12", border: "1px solid #1a1d24", borderRadius: 6, padding: "14px 16px" }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "#4b5563", marginBottom: 10 }}>BACKEND SNIPPET (Node.js)</div>
        <pre style={{ fontSize: 10, color: "#6b7280", margin: 0, overflowX: "auto", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
          {snippet}
        </pre>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MAIN APP
// ─────────────────────────────────────────────────────────────
export default function Home() {
  const [places, setPlaces] = useState(DEFAULT_PLACES);
  const [etas, setEtas] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [delivered, setDelivered] = useState([]);
  const [polling, setPolling] = useState(false);
  const [view, setView] = useState("places");
  const [pollCount, setPollCount] = useState(0);
  const intervalRef = useRef(null);

  const poll = useCallback(() => {
    const newEtas = {};
    const allNotifs = [];

    setPlaces(prev => {
      prev.filter(p => p.enabled).forEach(place => {
        const eta = simulateMapsAPI(place);
        newEtas[place.id] = eta;
        const triggers = evaluateTriggers(place, eta);
        triggers.forEach(n => allNotifs.push({
          ...n, placeId: place.id,
          id: Date.now() + Math.random(),
          ts: new Date(),
        }));
      });
      return prev.map(p =>
        newEtas[p.id] ? { ...p, lastTraffic: newEtas[p.id].traffic_condition } : p
      );
    });

    setEtas(prev => ({ ...prev, ...newEtas }));
    setPollCount(c => c + 1);

    if (allNotifs.length > 0) {
      setNotifications(prev => {
        const deduplicated = allNotifs.filter(n => {
          const last = prev.find(p => p.placeId === n.placeId && p.type === n.type);
          return !last || (n.ts - last.ts) > 120000;
        });
        if (deduplicated.length > 0) {
          setDelivered(d => [
            ...deduplicated.map(n => ({
              ...n,
              apns_id: Math.random().toString(36).slice(2, 10).toUpperCase(),
              delivered_at: new Date().toISOString(),
            })),
            ...d,
          ].slice(0, 20));
          return [...deduplicated, ...prev].slice(0, 15);
        }
        return prev;
      });
    }
  }, []);

  function startPolling() {
    setPolling(true);
    poll();
    intervalRef.current = setInterval(poll, 6000);
  }

  function stopPolling() {
    setPolling(false);
    clearInterval(intervalRef.current);
  }

  useEffect(() => () => clearInterval(intervalRef.current), []);

  function togglePlace(id) {
    setPlaces(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  }

  function dismissNotif(id) {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  const enabledCount = places.filter(p => p.enabled).length;

  const tabs = [
    { key: "places", label: "Places", badge: enabledCount },
    { key: "notifications", label: "Notifications", badge: notifications.length || null },
    { key: "backend", label: "APNs Log", badge: null },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#070809",
      color: "#e5e7eb",
      fontFamily: "'SF Mono', 'Fira Code', monospace",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Top bar */}
      <div style={{
        background: "#0d0f12",
        borderBottom: "1px solid #1a1d24",
        padding: "14px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 4, color: "#4b5563" }}>NUDGE</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#f9fafb", letterSpacing: 0.5 }}>
            Drive Reminder Engine
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {polling && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "#22c55e", letterSpacing: 2 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "pulse 1s infinite" }} />
              LIVE · POLL #{pollCount}
            </div>
          )}
          <button
            onClick={polling ? stopPolling : startPolling}
            style={{
              background: polling ? "#1f2937" : "#22c55e",
              color: polling ? "#9ca3af" : "#000",
              border: "none",
              borderRadius: 4,
              padding: "7px 16px",
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "inherit",
              fontWeight: 700,
              letterSpacing: 1.5,
            }}
          >
            {polling ? "⏹ STOP" : "▶ START"}
          </button>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ display: "flex", borderBottom: "1px solid #1a1d24", background: "#0d0f12" }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            style={{
              background: "transparent",
              border: "none",
              borderBottom: view === tab.key ? "2px solid #22c55e" : "2px solid transparent",
              color: view === tab.key ? "#f9fafb" : "#6b7280",
              padding: "10px 20px",
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "inherit",
              letterSpacing: 2,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {tab.label.toUpperCase()}
            {tab.badge ? (
              <span style={{
                background: tab.key === "notifications" ? "#ef4444" : "#374151",
                color: "#fff",
                borderRadius: 10,
                padding: "1px 6px",
                fontSize: 9,
                fontWeight: 700,
              }}>{tab.badge}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Views */}
      {view === "places" && (
        <PlacesView places={places} etas={etas} togglePlace={togglePlace} />
      )}
      {view === "notifications" && (
        <NotificationsView notifications={notifications} polling={polling} dismissNotif={dismissNotif} />
      )}
      {view === "backend" && (
        <BackendView delivered={delivered} />
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#070809}
        ::-webkit-scrollbar-thumb{background:#1a1d24;border-radius:2px}
      `}</style>
    </div>
  );
}