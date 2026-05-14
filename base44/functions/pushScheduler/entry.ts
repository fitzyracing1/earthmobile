// ─────────────────────────────────────────────────────────────
// Push Scheduler — polls Google Maps ETA, evaluates triggers,
// sends APNs (iOS) or FCM (Android) push to confirmed subscribers.
//
// Wire up as a scheduled automation every 10 minutes.
// ─────────────────────────────────────────────────────────────
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
const APNS_KEY_ID         = Deno.env.get("APNS_KEY_ID");
const APNS_TEAM_ID        = Deno.env.get("APNS_TEAM_ID");
const APNS_BUNDLE_ID      = Deno.env.get("APNS_BUNDLE_ID");
const APNS_PRIVATE_KEY    = Deno.env.get("APNS_PRIVATE_KEY");   // PEM string
const FCM_SERVER_KEY      = Deno.env.get("FCM_SERVER_KEY");

// Places to check ETA for (expandable — could be stored in an entity)
const PLACES = [
  { name: "Coffee Shop",   lat: 37.335,  lng: -122.032, baseMinutes: 6,  closingHour: 14, minVisitMinutes: 15 },
  { name: "Pharmacy",      lat: 37.338,  lng: -122.029, baseMinutes: 9,  closingHour: 18, minVisitMinutes: 20 },
  { name: "Grocery Store", lat: 37.331,  lng: -122.041, baseMinutes: 11, closingHour: 21, minVisitMinutes: 30 },
  { name: "Post Office",   lat: 37.340,  lng: -122.025, baseMinutes: 14, closingHour: 17, minVisitMinutes: 10 },
  { name: "Gym",           lat: 37.329,  lng: -122.038, baseMinutes: 8,  closingHour: 22, minVisitMinutes: 45 },
];

// ── Google Maps Distance Matrix ─────────────────────────────
async function getETA(originLat, originLng, destLat, destLng) {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json` +
    `?origins=${originLat},${originLng}` +
    `&destinations=${destLat},${destLng}` +
    `&departure_time=now` +
    `&traffic_model=best_guess` +
    `&key=${GOOGLE_MAPS_API_KEY}`;

  const res  = await fetch(url);
  const data = await res.json();
  const element = data.rows?.[0]?.elements?.[0];

  if (!element || element.status !== "OK") return null;

  const durationInTraffic = element.duration_in_traffic?.value || element.duration?.value;
  const baseline          = element.duration?.value;
  return {
    eta_minutes:       Math.round(durationInTraffic / 60),
    base_minutes:      Math.round(baseline / 60),
    traffic_condition: durationInTraffic > baseline * 1.2
      ? "heavy" : durationInTraffic > baseline * 1.05
      ? "moderate" : "clear",
    distance_km: (element.distance?.value / 1000).toFixed(1),
  };
}

// ── Trigger evaluation ──────────────────────────────────────
function buildNotification(place, eta) {
  const now   = new Date();
  const hour  = now.getHours() + now.getMinutes() / 60;
  const improvement = (place.baseMinutes - eta.eta_minutes) / place.baseMinutes;

  if (improvement >= 0.25 && eta.eta_minutes <= 15) {
    return {
      title: `Good time to head to ${place.name}`,
      body:  `${eta.eta_minutes} min away — ${place.baseMinutes - eta.eta_minutes} min faster than usual`,
    };
  }

  if (place.closingHour) {
    const minutesToClose = (place.closingHour - hour) * 60;
    const leaveBy        = minutesToClose - eta.eta_minutes - (place.minVisitMinutes || 20);
    if (leaveBy >= 0 && leaveBy <= 20) {
      return {
        title: `Leave now for ${place.name}`,
        body:  `Closes in ${Math.round(minutesToClose)} min · ${eta.eta_minutes} min drive`,
      };
    }
  }

  return null;
}

// ── APNs push (iOS) ─────────────────────────────────────────
async function sendAPNs(deviceToken, title, body) {
  // JWT signing requires your APNs .p8 private key
  // For production replace this with proper JWT signing via crypto
  const jwt = `REPLACE_WITH_SIGNED_JWT(${APNS_KEY_ID}, ${APNS_TEAM_ID})`;

  await fetch(`https://api.push.apple.com/3/device/${deviceToken}`, {
    method: "POST",
    headers: {
      authorization:  `bearer ${jwt}`,
      "apns-topic":   APNS_BUNDLE_ID,
      "apns-priority": "10",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      aps: { alert: { title, body }, sound: "default", badge: 1 },
    }),
  });
}

// ── FCM push (Android) ──────────────────────────────────────
async function sendFCM(deviceToken, title, body) {
  await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      authorization:  `key=${FCM_SERVER_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      to: deviceToken,
      notification: { title, body, sound: "default" },
    }),
  });
}

// ── Main handler ────────────────────────────────────────────
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Get all confirmed subscribers with device tokens
  const subscribers = await base44.asServiceRole.entities.Subscriber.filter({ status: "confirmed" });
  const eligible    = subscribers.filter(s => s.device_token && s.home_lat && s.home_lng);

  let pushCount = 0;

  for (const subscriber of eligible) {
    for (const place of PLACES) {
      const eta = await getETA(subscriber.home_lat, subscriber.home_lng, place.lat, place.lng);
      if (!eta) continue;

      const notif = buildNotification(place, eta);
      if (!notif) continue;

      // Throttle: don't send to same subscriber more than once per hour
      if (subscriber.last_push_at) {
        const lastPush = new Date(subscriber.last_push_at);
        if ((Date.now() - lastPush.getTime()) < 60 * 60 * 1000) continue;
      }

      if (subscriber.platform === "ios") {
        await sendAPNs(subscriber.device_token, notif.title, notif.body);
      } else {
        await sendFCM(subscriber.device_token, notif.title, notif.body);
      }

      await base44.asServiceRole.entities.Subscriber.update(subscriber.id, {
        last_push_at: new Date().toISOString(),
        push_count:   (subscriber.push_count || 0) + 1,
      });

      pushCount++;
      break; // one push per subscriber per poll cycle
    }
  }

  return Response.json({ ok: true, pushes_sent: pushCount, subscribers_checked: eligible.length });
});