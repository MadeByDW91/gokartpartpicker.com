# Amazon Associates Account Setup Guide

This guide explains what information you need from your Amazon Associates account to integrate affiliate links into GoKartPartPicker.com.

## What You Need

### Required: Amazon Associate Tag (Tracking ID)

**This is the ONLY thing you need for basic affiliate link generation.**

The Associate Tag (also called Tracking ID) is a unique identifier that Amazon assigns to your Associates account. It looks like:
- `yourname-20` (most common format)
- `gokartpartpicker-21`
- Or any custom tag you've set up

**Where to Find It:**
1. Log into your [Amazon Associates Central](https://associates.amazon.com/)
2. Go to **Account Settings** → **Account Info**
3. Look for **"Tracking ID"** or **"Associate Tag"**
4. It will be displayed as something like: `gokartpartpicker-20`

**How to Use It:**
Add it to your `.env.local` file:
```bash
NEXT_PUBLIC_AMAZON_AFFILIATE_TAG=your-tag-here
```

**Example:**
```bash
NEXT_PUBLIC_AMAZON_AFFILIATE_TAG=gokartpartpicker-20
```

## How Affiliate Links Work

Once you have your Associate Tag configured, the system will automatically generate affiliate links in this format:

```
https://www.amazon.com/dp/{ASIN}?tag={YOUR_TAG}
```

**Example:**
- Product ASIN: `B08XYZ1234`
- Your Tag: `gokartpartpicker-20`
- Generated Link: `https://www.amazon.com/dp/B08XYZ1234?tag=gokartpartpicker-20`

## Using the Affiliate Link Generator

The project includes an affiliate link generator at `/admin/affiliate`:

1. **Navigate to Admin → Affiliate Links**
2. **Select "Amazon"** from the dropdown
3. **Paste a product URL or ASIN:**
   - Full URL: `https://www.amazon.com/dp/B08XYZ1234`
   - Just ASIN: `B08XYZ1234`
4. **Click "Generate Affiliate Link"**
5. **Copy the generated link** and use it in your parts/engines

## Optional: Product Advertising API (Advanced)

If you want to **automatically fetch product data** (prices, images, descriptions) from Amazon, you'll need:

### 1. Access Key ID
- Found in: **Product Advertising API** section of Associates Central
- Used for API authentication

### 2. Secret Access Key
- Found in: **Product Advertising API** section
- **Keep this secret!** Never commit to git
- Used for API authentication

### 3. Associate Tag
- Same as above (your Tracking ID)

**Note:** The Product Advertising API requires approval from Amazon and has usage restrictions. For most use cases, you only need the Associate Tag for link generation.

## Setting Up Environment Variables

Create or update your `.env.local` file in the `frontend/` directory:

```bash
# Amazon Associates
NEXT_PUBLIC_AMAZON_AFFILIATE_TAG=your-tag-here

# Optional: For Product Advertising API (if approved)
# AMAZON_ACCESS_KEY_ID=your-access-key
# AMAZON_SECRET_ACCESS_KEY=your-secret-key
```

**Important:**
- `NEXT_PUBLIC_*` variables are exposed to the browser (safe for tags)
- Never use `NEXT_PUBLIC_` for secret keys
- Restart your dev server after adding environment variables

## Bulk Adding Affiliate Links

### Method 1: Using the Admin Interface

1. Go to **Admin → Parts** (or **Admin → Engines**)
2. Select multiple items using checkboxes
3. Use the bulk actions to apply affiliate links
4. Or edit individual items and paste affiliate links

### Method 2: Using the Link Generator

1. Go to **Admin → Affiliate Links**
2. Generate links for products
3. Copy and paste into the `affiliate_url` field when editing parts/engines

### Method 3: Direct Database Update (Advanced)

If you have many products, you can update them directly:

```sql
-- Update a single part
UPDATE parts
SET affiliate_url = 'https://www.amazon.com/dp/B08XYZ1234?tag=your-tag-20'
WHERE id = 'part-uuid-here';

-- Bulk update (be careful!)
UPDATE parts
SET affiliate_url = 'https://www.amazon.com/dp/B08XYZ1234?tag=your-tag-20'
WHERE category = 'clutch' AND affiliate_url IS NULL;
```

## Amazon Associates Program Requirements

### Account Status
- ✅ Account must be **approved** (not pending)
- ✅ Account must be **active** (not suspended)
- ✅ Must comply with Amazon's Operating Agreement

### Link Requirements
- ✅ Links must include your Associate Tag
- ✅ Links must be properly disclosed (already implemented)
- ✅ Links must open in new tabs (already implemented)
- ✅ Must use `rel="sponsored"` attribute (already implemented)

### Compliance
- ✅ Disclosures are already implemented on the site
- ✅ Privacy Policy includes affiliate disclosure
- ✅ Terms of Service includes affiliate information
- ✅ Footer includes disclosure

## Testing Your Setup

1. **Check Environment Variable:**
   ```bash
   # In your terminal
   cd frontend
   cat .env.local | grep AMAZON
   ```

2. **Test Link Generation:**
   - Go to `/admin/affiliate`
   - Try generating a link with a test ASIN
   - Verify the tag appears in the generated URL

3. **Test on a Part:**
   - Edit a part in Admin
   - Add an affiliate URL
   - View the part page
   - Click "Buy Now" and verify the link includes your tag

## Troubleshooting

### "Amazon affiliate tag not configured"
- **Solution:** Add `NEXT_PUBLIC_AMAZON_AFFILIATE_TAG` to `.env.local`
- **Restart:** Restart your dev server after adding

### Links not tracking
- **Check:** Verify your tag is correct in the generated URL
- **Check:** Ensure your Associates account is approved and active
- **Check:** Verify the link format matches Amazon's requirements

### Can't find my Associate Tag
- **Location:** Amazon Associates Central → Account Settings → Account Info
- **Alternative:** Check any existing affiliate links you've created - the tag is in the URL
- **Format:** Usually `yourname-20` or similar

## Next Steps

1. ✅ Get your Associate Tag from Amazon Associates Central
2. ✅ Add it to `.env.local` as `NEXT_PUBLIC_AMAZON_AFFILIATE_TAG`
3. ✅ Restart your development server
4. ✅ Test link generation at `/admin/affiliate`
5. ✅ Start adding affiliate links to parts

## Resources

- [Amazon Associates Central](https://associates.amazon.com/)
- [Amazon Associates Operating Agreement](https://affiliate-program.amazon.com/help/operating/agreement)
- [Link Building Tools](https://affiliate-program.amazon.com/help/node/topic/GP38XK9X4Z8XK9X4)

---

**Last Updated:** 2026-01-16  
**Status:** Ready for implementation
