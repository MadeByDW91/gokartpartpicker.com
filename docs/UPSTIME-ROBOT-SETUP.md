# UptimeRobot setup (step 1: uptime monitoring)

Use this to add a free uptime monitor so you get email alerts when the app is down. We use the lightweight `/api/health` endpoint so monitors don’t hit the database.

---

## 1. Sign in or sign up

- Go to **[UptimeRobot](https://uptimerobot.com/)**
- Sign up (free) or log in. Free plan: 50 monitors, 5-minute check interval.

---

## 2. Add a monitor

1. Click **"+ Add New Monitor"** (or **Monitors** → **Add New Monitor**).
2. **Monitor Type:** **HTTP(s)**.
3. **Friendly Name:** e.g. `GoKart Part Picker – health`.
4. **URL:** Your production URL for the health endpoint, for example:
   - `https://gokartpartpicker.com/api/health`  
   Replace with your real domain if different.
5. **Monitoring Interval:** **5 minutes** (free tier).
6. Leave other options as default (no keyword alert needed; we only care that the request returns 200).
7. Click **"Create Monitor"**.

---

## 3. Set alert contacts (email)

1. Go to **My Settings** (or **Account** → **Alert Contacts**).
2. Under **Alert Contacts**, click **"Add Alert Contact"** (or **"+ Add"**).
3. **Alert Contact Type:** **Email**.
4. Enter the email address that should receive downtime alerts.
5. **Friendly Name:** e.g. `Main email`.
6. Create the contact. If UptimeRobot asks you to verify, check your inbox and confirm.
7. Back on your new monitor’s page, ensure this contact is selected under **Alert Contacts** (or edit the monitor and add the contact). Save.

---

## 4. Confirm it’s working

- On the monitor’s page you should see status **Up** and a green check once the first check runs (within 5 minutes).
- Optional: open `https://your-domain.com/api/health` in a browser; you should see `{"status":"ok","timestamp":...}` and HTTP 200.

---

## Summary

| Setting        | Value                                              |
|----------------|----------------------------------------------------|
| Monitor type   | HTTP(s)                                            |
| URL            | `https://<your-domain>/api/health`                 |
| Interval       | 5 minutes                                          |
| Alert contact  | Your email                                         |

Do **not** add a monitor for `/api/health/database` on a 5-minute interval—that endpoint hits the database and is for occasional/deeper checks only.

---

*See also: `docs/SCALABILITY-RUNBOOK.md` → Uptime monitoring (UptimeRobot), Production readiness checklist.*
