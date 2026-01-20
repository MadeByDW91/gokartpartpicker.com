# 🌐 Connect Your Domain to Vercel (Hostinger)

**Simple step-by-step guide for Hostinger users**

> **📋 Need help finding values to copy?** See `COPY-PASTE-VALUES.md` for exactly where to find each value in Vercel!

---

## ✅ STEP 1: Get Your Values from Vercel

1. **Go to Vercel:** https://vercel.com/dashboard
2. **Click your project:** `gokartpartpicker`
3. **Click:** Settings → Domains
4. **Find:** `gokartpartpicker.com` (should show "Verification Needed")

### Copy These Values:

**📋 See `COPY-PASTE-VALUES.md` for detailed instructions on where to find each value!**

**TXT Record Value (for verification):**
- **Where:** In Vercel Domains page, look for orange warning box
- **What to copy:** The ENTIRE long string in the "Value" column (starts with `vc-domain-verify=...`)
- **Example format:** `vc-domain-verify=gokartpartpicker.com,318cc301695da1234567890abcdef`
- **IMPORTANT:** Copy the WHOLE thing - it's 50-100 characters long!

**A Record IP (for root domain - get this AFTER verification):**
- **Where:** After verification, go to Vercel → Settings → Domains → `gokartpartpicker.com` → **"DNS Records"** tab
- **What to copy:** The EXACT IP address shown in the table (currently `216.198.79.1` but may be different)
- **Example format:** `216.198.79.1` (always use the EXACT value from Vercel!)

**CNAME Value (for www - get this AFTER verification):**
- **Where:** After verification, in the same DNS Records tab
- **What to copy:** The EXACT CNAME value shown (may be `cname.vercel-dns.com` or different)
- **Example format:** `cname.vercel-dns.com` (always use the EXACT value from Vercel!)

**⚠️ IMPORTANT:** Vercel's IP addresses may change. Always copy the EXACT values from the DNS Records tab, not from examples!

---

## ✅ STEP 2: Add TXT Record in Hostinger (Verify Domain)

**IMPORTANT:** You see TWO TXT records in Vercel:
- One for `gokartpartpicker.com`
- One for `www.gokartpartpicker.com`

**You only need to add ONE:** The root domain (`gokartpartpicker.com`) TXT record.

**Why?** Verifying the root domain usually verifies both. If `www` still shows "Verification Needed" after, you can add that one too.

### Add the Root Domain TXT Record:

1. **Log in to Hostinger:**
   - Go to: https://hpanel.hostinger.com/
   - Enter your email and password

2. **Go to Domains:**
   - Click **"Domains"** in the top menu
   - Or click: https://hpanel.hostinger.com/domains

3. **Click on your domain:**
   - Find `gokartpartpicker.com` in the list
   - Click on the domain name

4. **Open DNS Zone Editor:**
   - Look for **"DNS / Name Servers"** section
   - Click **"Manage"** button
   - This opens the DNS Zone Editor

5. **Add TXT Record (for root domain):**
   - Click **"Add Record"** button (usually at the top or bottom)
   - **Type:** Select **"TXT"** from dropdown
   - **Name:** Type exactly: `_vercel`
   - **Value:** Paste the FULL value for `gokartpartpicker.com` (starts with `vc-domain-verify=gokartpartpicker.com,...`)
   - **TTL:** Leave as default (3600)
   - Click **"Add Record"** or **"Save"**

6. **Verify it was added:**
   - You should see a new row showing:
     - Type: TXT
     - Name: `_vercel`
     - Value: (your long verification string)

### If www Still Needs Verification:

**After waiting and refreshing, if `www.gokartpartpicker.com` still shows "Verification Needed":**

1. **Go back to Hostinger DNS Zone Editor**
2. **Add another TXT record:**
   - Click **"Add Record"**
   - **Type:** TXT
   - **Name:** `_vercel` (same name)
   - **Value:** Paste the FULL value for `www.gokartpartpicker.com` (starts with `vc-domain-verify=www.gokartpartpicker.com,...`)
   - **TTL:** Leave as default
   - Click **"Add Record"**

**Note:** Some DNS systems allow multiple TXT records with the same name, some don't. If Hostinger doesn't allow duplicate names, you may need to contact support or wait to see if the root domain verification covers both.

---

## ✅ STEP 3: Wait and Refresh in Vercel

1. **Wait 15-30 minutes** (DNS needs time to update)

2. **Go back to Vercel:**
   - Settings → Domains
   - Find `gokartpartpicker.com`
   - Click **"Refresh"** button

3. **Check status:**
   - Should change from "Verification Needed" to "Valid Configuration" ✅
   - If still "Verification Needed", wait another 15 minutes and refresh again

---

## ✅ STEP 4: Add DNS Records to Point Domain to Vercel

**After verification is complete, Vercel will show you the DNS records to add.**

**Go to Vercel:** Settings → Domains → Click on `gokartpartpicker.com` → **"DNS Records"** tab

**You'll see a table with the records you need to add. Copy the exact values shown!**

### Add A Record (for gokartpartpicker.com):

**From Vercel DNS Records tab, copy:**
- **Type:** A
- **Name:** `@` (shown in Vercel)
- **Value:** `216.198.79.1` (or whatever IP Vercel shows - copy the EXACT value)

**In Hostinger DNS Zone Editor:**

1. **Go to:** Domains → `gokartpartpicker.com` → DNS / Name Servers → Manage
2. **Click "Add Record"**
3. **Fill in:**
   - **Type:** Select **"A"**
   - **Name:** Type `@` (or leave blank, or type `gokartpartpicker.com`)
   - **Value/Points to:** Paste the IP from Vercel (copy the EXACT IP shown - currently `216.198.79.1`)
   - **TTL:** Leave as default (3600)
4. **Click "Add Record"**

**Note:** Vercel may show a different IP than `76.76.21.21`. Always use the EXACT IP shown in your Vercel DNS Records tab!

### Add CNAME Record (for www.gokartpartpicker.com):

**Check Vercel DNS Records tab for CNAME record:**

1. **In Hostinger DNS Zone Editor** (same place)
2. **Click "Add Record"** again
3. **Fill in:**
   - **Type:** Select **"CNAME"**
   - **Name:** Type `www`
   - **Value/Points to:** Copy the EXACT CNAME from Vercel (check the DNS Records tab - may be `cname.vercel-dns.com` or a different value)
   - **TTL:** Leave as default (3600)
4. **Click "Add Record"**

**Important:** Always copy the EXACT values shown in Vercel's DNS Records tab, not the examples in this guide!

---

## ✅ STEP 5: Wait and Test

1. **Wait 15-30 minutes** for DNS to update

2. **Test your site:**
   - Visit: `https://gokartpartpicker.com`
   - Visit: `https://www.gokartpartpicker.com`
   - Both should work! ✅

---

## 📋 Quick Checklist

- [ ] Copied TXT record value from Vercel
- [ ] Added TXT record in Hostinger (Name: `_vercel`)
- [ ] Waited 15-30 minutes
- [ ] Refreshed in Vercel → Status changed to "Valid Configuration"
- [ ] Copied A record IP from Vercel
- [ ] Added A record in Hostinger (Name: `@`, Value: IP)
- [ ] Copied CNAME value from Vercel
- [ ] Added CNAME record in Hostinger (Name: `www`, Value: CNAME)
- [ ] Waited 15-30 minutes
- [ ] Tested both domains - they work! ✅

---

## 🐛 Troubleshooting

### Can't Find DNS Zone Editor in Hostinger

**Try these paths:**
1. Domains → `gokartpartpicker.com` → **"DNS / Name Servers"** → **"Manage"**
2. Domains → `gokartpartpicker.com` → **"Advanced DNS"**
3. Domains → `gokartpartpicker.com` → **"DNS Zone Editor"**

**If still can't find:**
- Contact Hostinger support
- Or check if domain uses custom nameservers (like Cloudflare)

### TXT Record Not Working

- **Check the name:** Must be exactly `_vercel` (not `_vercel.gokartpartpicker.com`)
- **Check the value:** Must be the FULL string from Vercel (very long)
- **Wait longer:** DNS can take up to 48 hours (usually 15-30 min)

### Domain Still Shows "Verification Needed"

- Wait another 15-30 minutes
- Click "Refresh" in Vercel again
- Double-check the TXT record in Hostinger matches exactly

---

## 📞 Need Help?

**If you're stuck:**
1. Take a screenshot of your Hostinger DNS Zone Editor
2. Take a screenshot of Vercel Domains page
3. Check that all values match exactly

**The key is:**
- Copy the EXACT values from Vercel
- Paste them EXACTLY in Hostinger
- Wait 15-30 minutes between steps

---

**That's it! Follow these steps and your domain will be connected to Vercel.** 🚀
