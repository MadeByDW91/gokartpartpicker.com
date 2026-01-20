# 🌐 Verify Custom Domain in Vercel

> **📌 For Hostinger users:** See `HOSTINGER-DOMAIN-SETUP.md` for simpler step-by-step instructions!

## Current Status

- ✅ `gokartpartpicker-com.vercel.app` - **Valid Configuration** (working!)
- ⚠️ `gokartpartpicker.com` - **Verification Needed**
- ⚠️ `www.gokartpartpicker.com` - **Verification Needed**

---

## ✅ Step 1: Add TXT Record for Verification (Hostinger)

The domain is linked to another Vercel account. You need to verify ownership.

### What You Need to Add:

**DNS Record Type:** TXT  
**Name/Host:** `_vercel`  
**Value:** `vc-domain-verify=gokartpartpicker.com,318cc301695da...` (copy the full value from Vercel)

**Note:** After verification, you'll also need to add A and CNAME records to point your domain to Vercel (see Step 5 below).

### Where to Add It (Hostinger):

1. **Log in to Hostinger:**
   - Go to: https://www.hostinger.com/
   - Click **"Log In"** (top right)
   - Enter your credentials

2. **Navigate to Domain Management:**
   - After logging in, click **"Domains"** in the top menu
   - Or go to: https://hpanel.hostinger.com/domains
   - Find `gokartpartpicker.com` in your domain list
   - Click on the domain name

3. **Open DNS Zone Editor:**
   - In the domain management page, look for **"DNS / Name Servers"** section
   - Click **"Manage"** or **"DNS Zone Editor"**
   - Or look for **"Advanced DNS"** or **"DNS Records"**

4. **Add TXT Record:**
   - Click **"Add Record"** or **"Add DNS Record"** button
   - **Type:** Select **"TXT"** from the dropdown
   - **Name/Host:** Enter `_vercel` (just `_vercel`, not `_vercel.gokartpartpicker.com`)
   - **Value/Content:** Paste the full value from Vercel (starts with `vc-domain-verify=...`)
   - **TTL:** Leave as default (usually 3600) or set to 3600
   - Click **"Add Record"** or **"Save"** button

5. **Verify the Record:**
   - You should see the new TXT record in your DNS records list
   - It should show: Type: TXT, Name: `_vercel`, Value: (your verification string)

---

## ✅ Step 2: Wait for DNS Propagation

- DNS changes can take **5 minutes to 48 hours**
- Usually takes **15-30 minutes**
- Vercel will automatically detect when the record is verified

---

## ✅ Step 3: Verify in Vercel

1. Go back to Vercel → Settings → Domains
2. Click **"Refresh"** button next to `gokartpartpicker.com`
3. Wait a few minutes, then refresh again
4. Status should change from "Verification Needed" to "Valid Configuration" ✅

---

## ✅ Step 4: Add DNS Records to Point Domain to Vercel (Hostinger)

**After verification is complete, you need to point your domain to Vercel:**

### In Hostinger DNS Zone Editor:

1. **Go back to:** Domains → `gokartpartpicker.com` → DNS / Name Servers → Manage

2. **Add A Record (for root domain):**
   - Click **"Add Record"**
   - **Type:** A
   - **Name/Host:** `@` (or leave blank, or `gokartpartpicker.com`)
   - **Value/Points to:** `76.76.21.21` (Vercel's IP - check Vercel for current IP)
   - **TTL:** 3600 (or default)
   - Click **"Add Record"**

3. **Add CNAME Record (for www subdomain):**
   - Click **"Add Record"**
   - **Type:** CNAME
   - **Name/Host:** `www`
   - **Value/Points to:** `cname.vercel-dns.com` (or the CNAME Vercel provides)
   - **TTL:** 3600 (or default)
   - Click **"Add Record"**

**Note:** Vercel will show you the exact values to use in the Domains section. Copy those values!

---

## ✅ Step 5: Configure www Redirect

After DNS records are added:

1. `www.gokartpartpicker.com` should automatically work
2. Vercel will handle the redirect automatically
3. Both `gokartpartpicker.com` and `www.gokartpartpicker.com` will work

---

## 🎯 Quick Steps Summary (Hostinger)

### Part 1: Verify Domain Ownership

1. **Copy TXT record value** from Vercel (shown in the warning)
2. **Log in to Hostinger:** https://hpanel.hostinger.com/
3. **Go to:** Domains → `gokartpartpicker.com` → DNS / Name Servers → Manage
4. **Add TXT record:**
   - Click **"Add Record"**
   - Type: **TXT**
   - Name: `_vercel`
   - Value: (paste from Vercel)
   - Click **"Add Record"** or **"Save"**
5. **Wait 15-30 minutes** for DNS propagation
6. **Go back to Vercel:** Settings → Domains
7. **Click "Refresh"** button next to `gokartpartpicker.com`
8. **Status should change to "Valid Configuration"** ✅

### Part 2: Point Domain to Vercel (After Verification)

9. **In Hostinger DNS Zone Editor**, add A record:
   - Type: **A**
   - Name: `@` (or blank)
   - Value: `76.76.21.21` (or IP from Vercel)
   - Save

10. **Add CNAME record for www:**
    - Type: **CNAME**
    - Name: `www`
    - Value: `cname.vercel-dns.com` (or CNAME from Vercel)
    - Save

11. **Wait 15-30 minutes** for DNS propagation
12. **Your site should be live at** `https://gokartpartpicker.com` ✅

---

## 🐛 Troubleshooting

### "Verification Needed" Still Shows

- **Wait longer** - DNS can take up to 48 hours (usually 15-30 min)
- **Check TXT record** - Make sure it's exactly as shown in Vercel
- **Check name** - Should be `_vercel` (not `_vercel.gokartpartpicker.com` in some registrars)
- **Try "Refresh"** button in Vercel

### Can't Find DNS Settings in Hostinger

**If you can't find DNS settings:**

1. **Make sure you're in the right place:**
   - Go to: https://hpanel.hostinger.com/domains
   - Click on your domain: `gokartpartpicker.com`
   - Look for **"DNS / Name Servers"** section

2. **Alternative paths in Hostinger:**
   - **Option 1:** Domains → Your Domain → DNS / Name Servers → Manage
   - **Option 2:** Domains → Your Domain → Advanced DNS
   - **Option 3:** Domains → Your Domain → DNS Zone Editor

3. **If using Hostinger's hPanel:**
   - Log in to hPanel
   - Click **"Domains"** in the left sidebar
   - Click on `gokartpartpicker.com`
   - Find **"DNS Zone Editor"** or **"DNS Records"** section
   - Click **"Add Record"**

4. **Still can't find it?**
   - Contact Hostinger support
   - Or check if your domain is using custom nameservers (like Cloudflare)
   - If using custom nameservers, add the TXT record where those nameservers are managed

### Domain Already Verified Elsewhere

If the domain is verified on another Vercel account:
- You need to remove it from the other account first
- Or use the TXT record method to transfer verification

---

## ✅ After Verification

Once verified:
- ✅ SSL certificate will be issued automatically
- ✅ Site will be accessible at `https://gokartpartpicker.com`
- ✅ `www.gokartpartpicker.com` will redirect automatically
- ✅ Both domains will work

---

**Add the TXT record in Hostinger's DNS Zone Editor, wait 15-30 minutes, then click "Refresh" in Vercel!** 🌐

---

## 📸 Visual Guide for Hostinger

**Step-by-step path:**
1. Log in → https://hpanel.hostinger.com/
2. Click **"Domains"** (top menu or left sidebar)
3. Click on **`gokartpartpicker.com`**
4. Find **"DNS / Name Servers"** section
5. Click **"Manage"** or **"DNS Zone Editor"**
6. Click **"Add Record"** button
7. Fill in:
   - **Type:** TXT
   - **Name:** `_vercel`
   - **Value:** (paste from Vercel)
8. Click **"Add Record"** or **"Save"**
9. Wait 15-30 minutes
10. Refresh in Vercel ✅
