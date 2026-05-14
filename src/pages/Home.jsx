import { useState } from "react";

export default function Home() {
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (phone.length >= 10) setSubmitted(true);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#070809",
      color: "#e5e7eb",
      fontFamily: "'SF Mono', 'Fira Code', monospace",
      overflowX: "hidden",
    }}>

      {/* NAV */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 40px",
        borderBottom: "1px solid #1a1d24",
        background: "#0d0f12",
      }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: 5, color: "#4b5563" }}>EARTH</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#f9fafb", letterSpacing: 1 }}>Drive Reminder</div>
        </div>
        <a href="#waitlist" style={{
          background: "#22c55e",
          color: "#000",
          border: "none",
          borderRadius: 4,
          padding: "8px 20px",
          cursor: "pointer",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.5,
          textDecoration: "none",
        }}>GET EARLY ACCESS</a>
      </nav>

      {/* HERO */}
      <section style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "100px 24px 80px",
        textAlign: "center",
      }}>
        <div style={{
          display: "inline-block",
          background: "#22c55e18",
          border: "1px solid #22c55e44",
          color: "#22c55e",
          borderRadius: 3,
          padding: "4px 14px",
          fontSize: 10,
          letterSpacing: 3,
          marginBottom: 32,
        }}>
          ● LIVE TRAFFIC · REAL-TIME PUSH ALERTS
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 7vw, 72px)",
          fontWeight: 800,
          color: "#f9fafb",
          lineHeight: 1.1,
          margin: "0 0 24px",
          letterSpacing: -1,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}>
          Know exactly<br />
          <span style={{ color: "#22c55e" }}>when to leave.</span>
        </h1>

        <p style={{
          fontSize: 18,
          color: "#9ca3af",
          lineHeight: 1.7,
          maxWidth: 520,
          margin: "0 auto 48px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontWeight: 400,
        }}>
          Text a number. Get smart push notifications that tell you the perfect moment to head out — based on live traffic, your schedule, and where you need to be.
        </p>

        {/* CTA */}
        <form onSubmit={handleSubmit} id="waitlist" style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          flexWrap: "wrap",
          maxWidth: 440,
          margin: "0 auto",
        }}>
          {!submitted ? (
            <>
              <input
                type="tel"
                placeholder="Your phone number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 200,
                  background: "#0d0f12",
                  border: "1px solid #1a1d24",
                  borderRadius: 4,
                  padding: "12px 16px",
                  color: "#f9fafb",
                  fontSize: 14,
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
              <button type="submit" style={{
                background: "#22c55e",
                color: "#000",
                border: "none",
                borderRadius: 4,
                padding: "12px 24px",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.5,
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}>
                TEXT ME →
              </button>
            </>
          ) : (
            <div style={{
              background: "#22c55e18",
              border: "1px solid #22c55e44",
              color: "#22c55e",
              borderRadius: 6,
              padding: "16px 32px",
              fontSize: 13,
              letterSpacing: 1,
            }}>
              ✓ You're on the list. Watch for a text shortly.
            </div>
          )}
        </form>
        <div style={{ fontSize: 10, color: "#374151", marginTop: 14, letterSpacing: 1 }}>
          No app download. No account. Just text.
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{
        background: "#0d0f12",
        borderTop: "1px solid #1a1d24",
        borderBottom: "1px solid #1a1d24",
        padding: "80px 24px",
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", fontSize: 10, letterSpacing: 4, color: "#4b5563", marginBottom: 48 }}>
            HOW IT WORKS
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 32,
          }}>
            {[
              { step: "01", icon: "💬", title: "Text the number", body: "Send any message to the Earth number. We reply with a quick opt-in confirmation." },
              { step: "02", icon: "✅", title: "Reply YES", body: "One reply confirms you in. No app, no password, no account creation required." },
              { step: "03", icon: "📍", title: "Tell us your spots", body: "Reply with places you visit regularly — grocery, gym, pharmacy, coffee." },
              { step: "04", icon: "🔔", title: "Get nudged", body: "We monitor live traffic and send push alerts at exactly the right moment to leave." },
            ].map(s => (
              <div key={s.step} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
                <div style={{ fontSize: 9, letterSpacing: 3, color: "#22c55e", marginBottom: 8 }}>STEP {s.step}</div>
                <div style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#f9fafb",
                  marginBottom: 10,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}>{s.title}</div>
                <div style={{
                  fontSize: 13,
                  color: "#6b7280",
                  lineHeight: 1.7,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NOTIFICATION PREVIEWS */}
      <section style={{ padding: "80px 24px", maxWidth: 700, margin: "0 auto" }}>
        <div style={{ textAlign: "center", fontSize: 10, letterSpacing: 4, color: "#4b5563", marginBottom: 48 }}>
          WHAT YOU'LL RECEIVE
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { icon: "🟢", urgency: "#22c55e", title: "Good time to head to Grocery Store", body: "8 min away now — 4 min faster than usual. Traffic is clear.", time: "Now" },
            { icon: "🔴", urgency: "#ef4444", title: "Leave now for Post Office", body: "Closes in 22 min · 11 min drive · Leave within 5 min", time: "2 min ago" },
            { icon: "🟡", urgency: "#f59e0b", title: "Pharmacy closes soon", body: "Closes at 6:00 PM · 9 min away · You have ~35 min", time: "18 min ago" },
            { icon: "🟢", urgency: "#22c55e", title: "Traffic cleared near the Gym", body: "Route is now open · 8 min vs 18 min usual — great window", time: "31 min ago" },
          ].map((n, i) => (
            <div key={i} style={{
              background: "#0d0f12",
              border: `1px solid ${n.urgency}33`,
              borderLeft: `3px solid ${n.urgency}`,
              borderRadius: 8,
              padding: "16px 18px",
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "#1a1d24",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, flexShrink: 0,
              }}>🗺️</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <div style={{ fontSize: 9, color: "#4b5563", letterSpacing: 2 }}>EARTH {n.icon}</div>
                  <div style={{ fontSize: 10, color: "#374151" }}>{n.time}</div>
                </div>
                <div style={{
                  fontSize: 13, fontWeight: 600, color: "#f9fafb", marginBottom: 4,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}>{n.title}</div>
                <div style={{
                  fontSize: 12, color: "#9ca3af", lineHeight: 1.5,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}>{n.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{
        background: "#0d0f12",
        borderTop: "1px solid #1a1d24",
        borderBottom: "1px solid #1a1d24",
        padding: "80px 24px",
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", fontSize: 10, letterSpacing: 4, color: "#4b5563", marginBottom: 48 }}>
            POWERED BY
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
          }}>
            {[
              { icon: "🗺️", title: "Google Maps API", body: "Live traffic, real-time ETAs, and predictive travel times updated every few minutes." },
              { icon: "🍎", title: "Apple Maps Server API", body: "Cross-verified routing data for higher ETA accuracy across iOS and Android." },
              { icon: "📲", title: "APNs + FCM", body: "Native push notifications on iOS and Android — instant delivery, no delay." },
              { icon: "💬", title: "Twilio SMS", body: "Frictionless opt-in via text. No app install, no account, just a phone number." },
            ].map(f => (
              <div key={f.title} style={{
                background: "#070809",
                border: "1px solid #1a1d24",
                borderRadius: 6,
                padding: "20px 18px",
              }}>
                <div style={{ fontSize: 24, marginBottom: 12 }}>{f.icon}</div>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: "#f9fafb", marginBottom: 8,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}>{f.title}</div>
                <div style={{
                  fontSize: 12, color: "#6b7280", lineHeight: 1.7,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}>{f.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section style={{ padding: "100px 24px", textAlign: "center" }}>
        <h2 style={{
          fontSize: "clamp(28px, 5vw, 48px)",
          fontWeight: 800,
          color: "#f9fafb",
          margin: "0 0 16px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}>
          Stop guessing.<br />Start <span style={{ color: "#22c55e" }}>arriving.</span>
        </h2>
        <p style={{
          color: "#6b7280", fontSize: 16, marginBottom: 40,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}>
          Join the waitlist — we'll text you when your spot is ready.
        </p>
        <a href="#waitlist" style={{
          background: "#22c55e",
          color: "#000",
          borderRadius: 4,
          padding: "14px 36px",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 2,
          textDecoration: "none",
          display: "inline-block",
        }}>
          GET EARLY ACCESS →
        </a>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: "1px solid #1a1d24",
        padding: "24px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
        fontSize: 10,
        color: "#374151",
        letterSpacing: 1,
      }}>
        <div>EARTH © 2026</div>
        <div>DRIVE SMARTER · ARRIVE ON TIME</div>
      </footer>

      <style>{`
        * { box-sizing: border-box; }
        input::placeholder { color: #374151; }
        input:focus { border-color: #22c55e !important; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}