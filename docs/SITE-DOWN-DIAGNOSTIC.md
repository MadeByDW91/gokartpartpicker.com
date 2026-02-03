# Site Down Diagnostic — www.gokartpartpicker.com

Your monitor reports **Down** for `https://www.gokartpartpicker.com/api/health`. If you see a **404 Page Not Found** when opening that URL in a browser, the deployed app was **not built from the `frontend/` folder** — so `/api/health` (and other API routes) are missing from the live bundle. Fix: set Vercel **Root Directory** to **`frontend`** and redeploy.

---

## 1. Verify Vercel deployment

- **Vercel Dashboard** → your project → **Deployments**
  - Is the latest deployment **Ready** (green)?
  - If **Failed** or **Building**, open that deployment and check the **Build Logs** and **Runtime Logs**.
- **Root Directory**: This repo’s Next.js app lives in **`frontend/`**. In Vercel → Project Settings → General:
  - **Root Directory** must be **`frontend`** (not blank).
  - If it’s blank, Vercel builds from repo root where there is no `package.json` or `package-lock.json` → `npm ci` fails with “can only install with an existing package-lock.json” → build fails → site down.

---

## 2. Test the health endpoint yourself

From your machine:

```bash
# Replace with your real domain if different
curl -v https://www.gokartpartpicker.com/api/health
```

- **No response / connection refused / timeout** → app not running or not reachable (deployment, DNS, or firewall).
- **4xx/5xx** → app is running; note the status and response body (e.g. 502/503 from Vercel, or your app returning an error).
- **200 + `{"status":"ok",...}`** → app is up; monitor may be wrong (URL, DNS, or alert rule).

---

## 3. Check domain and SSL (monitor message)

The monitor shows Domain/SSL as "Unlock" (paid feature). Still worth checking:

- **Vercel** → Project → **Settings** → **Domains**: confirm `www.gokartpartpicker.com` is added and **Verified**.
- In a browser, open `https://www.gokartpartpicker.com/api/health`. If you get a certificate or connection warning, that can cause the monitor to report "Down".

---

## 4. What the health route does (no change needed)

- **`/api/health`** (`frontend/src/app/api/health/route.ts`): returns `200` and `{ status: 'ok', timestamp }`. No database or external calls. Good for uptime checks.
- **`/api/health/database`**: hits Supabase; use only for deeper checks, not for a simple "is the site up?" monitor.

Your monitor should call **GET** `https://www.gokartpartpicker.com/api/health` and treat **HTTP 200** as "up".

---

## 5. Most likely causes (in order)

| Cause | What to do |
|-------|------------|
| **Wrong Vercel Root Directory** | Set Root Directory to **`frontend`** in Vercel project settings, then redeploy. |
| **Failed or stuck deployment** | Fix the error in Vercel build/runtime logs and redeploy. |
| **Domain not pointed at Vercel** | In your DNS (e.g. Hostinger), ensure `www` (and apex if used) CNAME/A point to Vercel (e.g. `cname.vercel-dns.com`). |
| **SSL / certificate issue** | In Vercel, ensure the domain is verified; renew or re-provision cert if needed. |
| **Runtime crash (e.g. cold start)** | Check Vercel Function logs for the deployment; fix crashes or timeouts. |

---

## 6. Quick fix to try first

1. In **Vercel** → your project → **Settings** → **General**, set **Root Directory** to **`frontend`** and save.
2. **Redeploy**: Deployments → … on latest → **Redeploy** (or push a small commit to trigger a new build).
3. After the deployment is **Ready**, run `curl -v https://www.gokartpartpicker.com/api/health` again and re-check the monitor.

If the build still fails, use the failing deployment’s **Build Logs** and **Runtime Logs** in Vercel as the next source of truth.
