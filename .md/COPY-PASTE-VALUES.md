# 📋 Copy-Paste Values for Domain Setup

**Use this as a reference when setting up your domain in Hostinger**

---

## 🔍 WHERE TO FIND VALUES IN VERCEL

### Step 1: Go to Vercel Domains Page

1. Go to: https://vercel.com/dashboard
2. Click your project: `gokartpartpicker`
3. Click: **Settings** → **Domains**
4. Find: `gokartpartpicker.com`

---

## 📝 VALUE 1: TXT Record (For Verification)

### Where to Find It:

In Vercel Domains page, look for the **orange warning box** that says:
```
"This domain is linked to another Vercel account..."
```

**Below that, you'll see a table with:**
- Type: TXT
- Name: `_vercel`
- Value: `vc-domain-verify=gokartpartpicker.com,318cc301695da...` ← **COPY THIS ENTIRE STRING**

### What to Copy:

**Copy the ENTIRE value shown in the "Value" column.**

It will look something like:
```
vc-domain-verify=gokartpartpicker.com,318cc301695da1234567890abcdef
```

**IMPORTANT:** Copy the WHOLE thing - it's usually 50-100 characters long!

### Where to Paste in Hostinger:

- **Type:** TXT
- **Name:** `_vercel`
- **Value:** (paste the ENTIRE string you copied)

---

## 📝 VALUE 2: A Record IP (For Root Domain)

### Where to Find It:

**After verification is complete**, Vercel will show you DNS records to add.

Look for a section that says:
```
"Add the following DNS records:"
```

You'll see:
- Type: A
- Name: `@` (or blank)
- Value: `76.76.21.21` ← **COPY THIS IP ADDRESS**

### What to Copy:

**Copy the IP address** (usually `76.76.21.21` or similar)

Example:
```
76.76.21.21
```

### Where to Paste in Hostinger:

- **Type:** A
- **Name:** `@` (or leave blank)
- **Value/Points to:** (paste the IP address)

---

## 📝 VALUE 3: CNAME Value (For www Subdomain)

### Where to Find It:

**After verification is complete**, in the same DNS records section:

You'll see:
- Type: CNAME
- Name: `www`
- Value: `cname.vercel-dns.com` ← **COPY THIS**

### What to Copy:

**Copy the CNAME value** (usually `cname.vercel-dns.com`)

Example:
```
cname.vercel-dns.com
```

### Where to Paste in Hostinger:

- **Type:** CNAME
- **Name:** `www`
- **Value/Points to:** (paste the CNAME value)

---

## ✅ QUICK REFERENCE TABLE

| Record | Type | Name | Value (Copy From Vercel) | Paste In Hostinger |
|--------|------|------|-------------------------|-------------------|
| Verification | TXT | `_vercel` | `vc-domain-verify=...` (full string) | Value field |
| Root Domain | A | `@` | `76.76.21.21` (IP address) | Points to field |
| www Subdomain | CNAME | `www` | `cname.vercel-dns.com` | Points to field |

---

## 🎯 EXAMPLE: What Your Hostinger DNS Should Look Like

After adding all records, your Hostinger DNS Zone Editor should show:

```
Type    Name        Value/Points to
----    ----        --------------
TXT     _vercel     vc-domain-verify=gokartpartpicker.com,318cc301695da...
A       @           76.76.21.21
CNAME   www         cname.vercel-dns.com
```

---

## ⚠️ IMPORTANT NOTES

1. **Copy the ENTIRE value** - Don't shorten it or modify it
2. **Copy exactly as shown** - Include all characters, no spaces
3. **The TXT value is LONG** - Usually 50-100 characters, that's normal!
4. **Wait 15-30 minutes** after adding each record before checking

---

## 🐛 If You Can't Find the Values

**TXT Record:**
- Look for the orange warning box in Vercel
- Scroll down to see the DNS record table
- The Value column has the long string to copy

**A and CNAME Records:**
- These appear AFTER verification is complete
- Look for "Add the following DNS records" section
- Or check the domain details page

---

**Copy the values exactly as shown in Vercel, paste them exactly in Hostinger!** ✅
