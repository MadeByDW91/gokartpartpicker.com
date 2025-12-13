# Custom Domain Setup - gokartpartpicker.com

This guide will help you connect your Hostinger domain to your Vercel deployment.

## Step 1: Add Domain to Vercel

1. **Go to Vercel Dashboard:**
   https://vercel.com/dillons-projects-48dc60f7/gokartpartpicker.com/settings/domains

2. **Click "Add Domain"**

3. **Enter your domain:**
   - `gokartpartpicker.com`
   - Click "Add"

4. **Vercel will show you DNS records to add:**
   - You'll see something like:
     - Type: `A` or `CNAME`
     - Name: `@` or `www`
     - Value: Vercel's IP or CNAME target

## Step 2: Configure DNS in Hostinger

### Option A: Using A Record (Root Domain)

1. **Log into Hostinger:**
   - Go to https://hpanel.hostinger.com
   - Navigate to your domain's DNS settings

2. **Add A Record:**
   - **Type:** `A`
   - **Name/Host:** `@` (or leave blank for root domain)
   - **Points to/Value:** `76.76.21.21` (Vercel's IP - Vercel will show you the exact IP)
   - **TTL:** `3600` (or default)
   - Click "Add Record" or "Save"

3. **Add CNAME for www (optional but recommended):**
   - **Type:** `CNAME`
   - **Name/Host:** `www`
   - **Points to/Value:** `cname.vercel-dns.com` (Vercel will show you the exact value)
   - **TTL:** `3600`
   - Click "Add Record"

### Option B: Using CNAME (Easier, but may not work for root domain)

If Hostinger supports CNAME for root domain (some providers do):
1. **Add CNAME Record:**
   - **Type:** `CNAME`
   - **Name/Host:** `@`
   - **Points to/Value:** `cname.vercel-dns.com` (Vercel will show you the exact value)
   - **TTL:** `3600`
   - Click "Add Record"

## Step 3: Wait for DNS Propagation

- DNS changes can take **5 minutes to 48 hours** to propagate
- Usually takes **15-30 minutes**
- You can check propagation status at: https://dnschecker.org

## Step 4: Update Environment Variables

Once the domain is verified in Vercel:

1. **Go to Environment Variables:**
   https://vercel.com/dillons-projects-48dc60f7/gokartpartpicker.com/settings/environment-variables

2. **Update `NEXT_PUBLIC_BASE_URL`:**
   - Change from: `https://gokartpartpicker-3r0lszuvj-dillons-projects-48dc60f7.vercel.app`
   - Change to: `https://gokartpartpicker.com`
   - Make sure it's enabled for Production, Preview, and Development
   - Click "Save"

3. **Vercel will auto-redeploy** after you save

## Step 5: Verify Domain

1. **Check Vercel Dashboard:**
   - Go to Domains settings
   - Wait for status to show "Valid Configuration"
   - SSL certificate will be automatically provisioned by Vercel

2. **Test your domain:**
   - Visit: https://gokartpartpicker.com
   - Should load your app
   - Check SSL: Should show secure (lock icon)

## Common DNS Record Examples

### For Root Domain (gokartpartpicker.com):
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

### For www Subdomain (www.gokartpartpicker.com):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**Note:** The exact IP and CNAME values will be shown in Vercel's domain settings.

## Troubleshooting

### Domain Not Resolving
- Wait 15-30 minutes for DNS propagation
- Check DNS records are correct in Hostinger
- Verify records match what Vercel shows
- Use https://dnschecker.org to check propagation

### SSL Certificate Issues
- Vercel automatically provisions SSL certificates
- Wait 5-10 minutes after domain is verified
- If issues persist, check Vercel dashboard for SSL status

### Still Seeing Old Site
- Clear browser cache
- Try incognito/private browsing
- DNS might still be propagating

### Hostinger-Specific Notes
- Hostinger DNS settings are usually in "DNS Zone Editor" or "Advanced DNS"
- Make sure you're editing DNS for the correct domain
- Some Hostinger plans may have DNS propagation delays

## After Setup

Once your domain is working:
- ✅ Your site will be accessible at https://gokartpartpicker.com
- ✅ SSL certificate will be automatically managed by Vercel
- ✅ Both `gokartpartpicker.com` and `www.gokartpartpicker.com` will work (if you set up www)
- ✅ All internal links and API calls will use your custom domain

## Next Steps

1. Test all pages on your custom domain
2. Update any external links/bookmarks
3. Consider setting up redirects (www to non-www or vice versa) in Vercel
4. Update any documentation with the new domain


