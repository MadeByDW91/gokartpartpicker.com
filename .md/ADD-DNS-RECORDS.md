# 📋 Add DNS Records After Verification (Hostinger)

**After the TXT record verification is complete, add these DNS records to point your domain to Vercel.**

---

## ✅ Step 1: Get Your DNS Records from Vercel

1. **Go to Vercel:** https://vercel.com/dashboard
2. **Click your project:** `gokartpartpicker`
3. **Click:** Settings → Domains
4. **Click on:** `gokartpartpicker.com`
5. **Click the "DNS Records" tab** (not "Vercel DNS")

**You'll see a table with the records you need to add. Copy the EXACT values shown!**

---

## ✅ Step 2: Add A Record in Hostinger

**From Vercel, copy:**
- **Type:** A
- **Name:** `@`
- **Value:** `216.198.79.1` (or whatever IP Vercel shows - copy the EXACT value)

**In Hostinger:**

1. **Log in:** https://hpanel.hostinger.com/
2. **Go to:** Domains → `gokartpartpicker.com` → DNS / Name Servers → Manage
3. **Click "Add Record"**
4. **Fill in:**
   - **Type:** Select **"A"**
   - **Name:** Type `@` (or leave blank)
   - **Value/Points to:** Paste the EXACT IP from Vercel (currently `216.198.79.1`)
   - **TTL:** Leave as default (3600)
5. **Click "Add Record"**

---

## ✅ Step 3: Add CNAME Record for www (If Shown)

**Check Vercel DNS Records tab - if there's a CNAME record for `www`:**

1. **Still in Hostinger DNS Zone Editor**
2. **Click "Add Record"** again
3. **Fill in:**
   - **Type:** Select **"CNAME"**
   - **Name:** Type `www`
   - **Value/Points to:** Copy the EXACT CNAME from Vercel
   - **TTL:** Leave as default (3600)
4. **Click "Add Record"**

**Note:** If Vercel doesn't show a CNAME record, you may not need it. The A record might handle both.

---

## ✅ Step 4: Wait and Test

1. **Wait 15-30 minutes** for DNS to update
2. **Go back to Vercel:** Settings → Domains
3. **Click "Refresh"** on `gokartpartpicker.com`
4. **Status should change to "Valid Configuration"** ✅
5. **Test your site:**
   - Visit: `https://gokartpartpicker.com`
   - Visit: `https://www.gokartpartpicker.com`
   - Both should work! ✅

---

## ⚠️ Important Notes

1. **Always copy EXACT values from Vercel** - Don't use examples from guides
2. **IP addresses may change** - Vercel may show different IPs than examples
3. **Check the DNS Records tab** - Not the Vercel DNS tab, the "DNS Records" tab
4. **Wait 15-30 minutes** - DNS changes take time to propagate

---

## 🐛 Troubleshooting

### "Invalid Configuration" Still Shows

- **Wait longer** - DNS can take up to 48 hours (usually 15-30 min)
- **Check the IP** - Make sure you used the EXACT IP from Vercel
- **Check the Name** - Should be `@` for root domain
- **Try "Refresh"** in Vercel

### Can't Find DNS Records Tab

- Make sure you clicked on the domain name (`gokartpartpicker.com`)
- Look for tabs: "DNS Records" and "Vercel DNS"
- Click "DNS Records" tab (not "Vercel DNS")

### Domain Not Working After Adding Records

- Wait 15-30 minutes
- Clear your browser cache
- Try in incognito/private window
- Check DNS propagation: https://dnschecker.org/

---

**Add the A record with the EXACT IP from Vercel, wait 15-30 minutes, then test your site!** 🚀
