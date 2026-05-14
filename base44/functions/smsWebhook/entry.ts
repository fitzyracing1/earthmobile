// ─────────────────────────────────────────────────────────────
// Twilio SMS Webhook
// Set this function's URL as the webhook in Twilio console:
//   Messaging → Phone Numbers → your number → "A message comes in"
// Method: HTTP POST
// ─────────────────────────────────────────────────────────────
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import twilio from 'npm:twilio@5.3.0';

const TWILIO_ACCOUNT_SID  = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN   = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

Deno.serve(async (req) => {
  const formData = await req.formData();
  const from    = formData.get("From");   // sender's phone number
  const body    = (formData.get("Body") || "").trim().toUpperCase();

  const base44 = createClientFromRequest(req);

  // Look up existing subscriber
  const existing = await base44.asServiceRole.entities.Subscriber.filter({ phone: from });
  const subscriber = existing[0] || null;

  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  // ── STOP / UNSUBSCRIBE ──────────────────────────────────────
  if (["STOP", "UNSUBSCRIBE", "CANCEL"].includes(body)) {
    if (subscriber) {
      await base44.asServiceRole.entities.Subscriber.update(subscriber.id, { status: "opted_out" });
    }
    await client.messages.create({
      from: TWILIO_PHONE_NUMBER,
      to: from,
      body: "You've been unsubscribed from NUDGE drive reminders. Text START to re-subscribe anytime.",
    });
    return new Response("<?xml version='1.0'?><Response/>", {
      headers: { "Content-Type": "text/xml" },
    });
  }

  // ── YES — confirm opt-in ────────────────────────────────────
  if (body === "YES" && subscriber?.status === "pending") {
    await base44.asServiceRole.entities.Subscriber.update(subscriber.id, { status: "confirmed" });
    await client.messages.create({
      from: TWILIO_PHONE_NUMBER,
      to: from,
      body: "✅ You're in! NUDGE will send you smart drive reminders based on live traffic. Reply STOP anytime to unsubscribe.",
    });
    return new Response("<?xml version='1.0'?><Response/>", {
      headers: { "Content-Type": "text/xml" },
    });
  }

  // ── New subscriber — send opt-in prompt ─────────────────────
  if (!subscriber) {
    await base44.asServiceRole.entities.Subscriber.create({
      phone: from,
      status: "pending",
      push_count: 0,
    });
    await client.messages.create({
      from: TWILIO_PHONE_NUMBER,
      to: from,
      body: "👋 Welcome to NUDGE — smart drive reminders based on live traffic & place hours. Reply YES to opt in, or STOP to cancel.",
    });
    return new Response("<?xml version='1.0'?><Response/>", {
      headers: { "Content-Type": "text/xml" },
    });
  }

  // ── Already confirmed ───────────────────────────────────────
  if (subscriber?.status === "confirmed") {
    await client.messages.create({
      from: TWILIO_PHONE_NUMBER,
      to: from,
      body: "You're already subscribed to NUDGE! We'll notify you when it's the right time to head out. Reply STOP to unsubscribe.",
    });
  }

  return new Response("<?xml version='1.0'?><Response/>", {
    headers: { "Content-Type": "text/xml" },
  });
});