# Testing Your Amazon Associates Setup

## Quick Verification Steps

### 1. Restart Your Dev Server

**Important:** Environment variables are only loaded when the server starts. If your dev server is running, restart it:

```bash
# Stop the server (Ctrl+C)
# Then restart:
cd frontend
npm run dev
```

### 2. Verify Environment Variable

The system will automatically check if your tag is configured. If it's missing, you'll see an error message when trying to generate links.

### 3. Test the Affiliate Link Generator

1. **Navigate to:** `/admin/affiliate` (you must be logged in as admin)
2. **Select:** "Amazon" from the dropdown
3. **Test with one of these:**
   - **Product URL:** `https://www.amazon.com/dp/B08XYZ1234`
   - **Just ASIN:** `B08XYZ1234`
   - **Any Amazon product URL**

4. **Click:** "Generate Affiliate Link"
5. **Verify:** The generated link should include your tag:
   ```
   https://www.amazon.com/dp/B08XYZ1234?tag=your-tag-here
   ```

### 4. Common Test ASINs

You can test with these real Amazon products:

- **Go-Kart Chain:** `B08XYZ1234` (replace with actual ASIN)
- **Clutch:** `B08ABC5678` (replace with actual ASIN)
- **Any product:** Just paste the Amazon URL

### 5. Expected Results

✅ **Success:**
- Link generated successfully
- Your tag appears in the URL
- Link can be copied and used

❌ **Error: "Amazon affiliate tag not configured"**
- Check `.env.local` file exists in `frontend/` directory
- Verify variable name is exactly: `NEXT_PUBLIC_AMAZON_AFFILIATE_TAG`
- Check there are no extra spaces or quotes
- Restart dev server

❌ **Error: "Could not extract Amazon ASIN"**
- Make sure you're pasting a valid Amazon URL or ASIN
- ASINs are 10 characters (letters and numbers)
- Try a different product URL

## Using Generated Links

Once you have a generated affiliate link:

1. **Copy the link** from the generator
2. **Go to Admin → Parts** (or Engines)
3. **Edit a part** that needs an affiliate link
4. **Paste the link** into the "Affiliate URL" field
5. **Save** the part

The link will now appear on the part's detail page with proper disclosure and marking.

## Bulk Adding Links

You can also:
1. Generate multiple links using the generator
2. Use bulk operations (if implemented) to apply to multiple parts
3. Or manually add to each part's edit page

## Troubleshooting

### Tag Not Working

**Check your .env.local format:**
```bash
# ✅ Correct
NEXT_PUBLIC_AMAZON_AFFILIATE_TAG=your-tag-20

# ❌ Wrong (no quotes needed)
NEXT_PUBLIC_AMAZON_AFFILIATE_TAG="your-tag-20"

# ❌ Wrong (no spaces)
NEXT_PUBLIC_AMAZON_AFFILIATE_TAG = your-tag-20
```

### Server Not Reading Variable

1. Make sure file is named exactly `.env.local` (not `.env` or `.env.example`)
2. File should be in `frontend/` directory (same level as `package.json`)
3. Restart dev server completely (stop and start)
4. Check terminal for any environment variable warnings

### Link Format Issues

The generated link format should be:
```
https://www.amazon.com/dp/{ASIN}?tag={YOUR_TAG}
```

If the format looks wrong, check:
- ASIN extraction is working (10 character code)
- Tag is being added correctly
- No extra parameters interfering

## Next Steps

Once verified:
1. ✅ Start generating affiliate links for your parts
2. ✅ Add links to parts that need them
3. ✅ Test links by clicking them (they should track in Amazon Associates dashboard)
4. ✅ Monitor your Amazon Associates dashboard for clicks and conversions

---

**Need Help?** Check the main setup guide: `docs/AMAZON-ASSOCIATES-SETUP.md`
