# earthmobile

earthmobile is a Base44 app: a Vite + React front end plus Base44 backend entities, functions and workflows. The README is the generic Base44 template. From the code, the app manages subscribers and notifications. Pages: Dashboard, Home, NotificationLog, OAuthConsent, ServiceSettings, SubscriberDetails, SubscriberList. It has a Twilio SMS webhook and a push scheduler workflow that polls ETAs every 10 minutes.

## Getting started

```bash
npm install
# .env.local:
#   VITE_BASE44_APP_ID=<your app id>
#   VITE_BASE44_APP_BASE_URL=<your backend url>
npm run dev        # vite
npm run build      # vite build
npm run lint
```

## Files

| Path | Role |
|---|---|
| `src/pages/`, `src/components/`, `src/api/`, `src/hooks/`, `src/lib/` | React app |
| `base44/entities/Subscriber.jsonc`, `User.jsonc` | data entities |
| `base44/functions/smsWebhook/entry.ts` | Deno Twilio SMS webhook (reads `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` from the environment) |
| `base44/functions/pushScheduler/entry.ts` | push scheduler |
| `base44/workflows/` | "Push Scheduler — ETA poll every 10 min" |
| `.github/workflows/deploy.yml` | on push to `main`: `npm ci`, `npm run build`, deploy `dist/` to GitHub Pages |

Keep Twilio credentials in the Base44 environment, never in the repo. The repo has no tests and no LICENSE file. A deploy run is **lit** when it succeeds and **dark** otherwise.

Copyright (c) 2026 Joshua Almeida
