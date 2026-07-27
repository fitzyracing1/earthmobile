import { useState } from "react";

const FIELDS = [
  { key: "TWILIO_ACCOUNT_SID", label: "Twilio Account SID", group: "Twilio", placeholder: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
  { key: "TWILIO_AUTH_TOKEN", label: "Twilio Auth Token", group: "Twilio", placeholder: "••••••••••••••••••••••••••••••••", type: "password" },
  { key: "TWILIO_PHONE_NUMBER", label: "Twilio Phone Number", group: "Twilio", placeholder: "+15551234567" },
  { key: "GOOGLE_MAPS_API_KEY", label: "Google Maps API Key", group: "Google Maps", placeholder: "AIzaxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", type: "password" },
  { key: "APNS_KEY_ID", label: "APNs Key ID", group: "Apple Push (APNs)", placeholder: "XXXXXXXXXX" },
  { key: "APNS_TEAM_ID", label: "APNs Team ID", group: "Apple Push (APNs)", placeholder: "XXXXXXXXXX" },
  { key: "APNS_BUNDLE_ID", label: "APNs Bundle ID", group: "Apple Push (APNs)", placeholder: "com.yourapp.bundle" },
  { key: "APNS_PRIVATE_KEY", label: "APNs Private Key (PEM)", group: "Apple Push (APNs)", placeholder: "-----BEGIN PRIVATE KEY-----\n...", multiline: true },
  { key: "FCM_SERVER_KEY", label: "FCM Server Key", group: "Firebase (Android)", placeholder: "AAAAxxxxxxxxxx:APA91b...", type: "password" },
];

const groups = [...new Set(FIELDS.map(f => f.group))];

export default function ServiceSettings() {
  const [values, setValues] = useState({});
  const [saved, setSaved] = useState(false);

  const set = (key, val) => { setValues(v => ({ ...v, [key]: val })); setSaved(false); };

  const handleSave = () => {
    // Secrets are managed via Base44 Secrets panel — this UI is a reference guide.
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 9, letterSpacing: 4, color: "#4b5563", marginBottom: 6 }}>EARTH · ADMIN</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#f9fafb", margin: 0 }}>Service Settings</h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 10, lineHeight: 1.6, maxWidth: 560 }}>
          These credentials power the SMS webhook, push scheduler, and mapping features. Set them as secrets in the Base44 Secrets panel — the values below are for reference only and are not persisted here.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {groups.map(group => (
          <div key={group} style={{ background: "#0d0f12", border: "1px solid #1a1d24", borderRadius: 8, padding: "24px" }}>
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#22c55e", marginBottom: 20 }}>{group.toUpperCase()}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {FIELDS.filter(f => f.group === group).map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, letterSpacing: 1, color: "#6b7280", display: "block", marginBottom: 6 }}>{f.label}</label>
                  <div style={{ fontSize: 9, color: "#374151", fontFamily: "monospace", marginBottom: 6 }}>{f.key}</div>
                  {f.multiline ? (
                    <textarea
                      value={values[f.key] || ""}
                      onChange={e => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      rows={4}
                      style={{ width: "100%", background: "#070809", border: "1px solid #1a1d24", borderRadius: 4, padding: "10px 14px", color: "#f9fafb", fontSize: 12, fontFamily: "monospace", outline: "none", resize: "vertical", boxSizing: "border-box" }}
                    />
                  ) : (
                    <input
                      type={f.type || "text"}
                      value={values[f.key] || ""}
                      onChange={e => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      style={{ width: "100%", background: "#070809", border: "1px solid #1a1d24", borderRadius: 4, padding: "10px 14px", color: "#f9fafb", fontSize: 13, fontFamily: "monospace", outline: "none", boxSizing: "border-box" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={handleSave}
          style={{ background: "#22c55e", color: "#000", border: "none", borderRadius: 4, padding: "12px 28px", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, cursor: "pointer" }}
        >
          SAVE REFERENCE
        </button>
        {saved && <span style={{ fontSize: 12, color: "#22c55e", letterSpacing: 1 }}>✓ Noted — update your secrets in the Base44 panel.</span>}
      </div>
    </div>
  );
}