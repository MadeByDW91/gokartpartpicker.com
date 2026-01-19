# Product Image Import Agents

> **Automated agents to find, validate, and import product images from suppliers**

---

## 🚀 Quick Start

### Step 1: Export Products Without Images

```bash
cd frontend
npx tsx ../scripts/export-products-needing-images.ts
```

**Output:** `scripts/output/products-needing-images-YYYY-MM-DD.csv` and `.json`

---

### Step 2: Find Images (Agent 1)

```bash
npx tsx scripts/agents/find-product-images.ts \
  --input=scripts/output/products-needing-images-2026-01-16.json \
  --output=scripts/output/found-images.json \
  --sources=harbor_freight,amazon
```

**Output:** `scripts/output/found-images.json`

**What it does:**
- Searches supplier websites for product images
- Extracts image URLs from affiliate links when available
- Note: This is a framework - you'll need to implement actual scraping/API calls

---

### Step 3: Validate Images (Agent 2)

```bash
npx tsx scripts/agents/validate-product-images.ts \
  --input=scripts/output/found-images.json \
  --output=scripts/output/validated-images.json
```

**Output:** `scripts/output/validated-images.json`

**What it does:**
- Checks if image URLs are accessible (HTTP 200)
- Validates image format (JPG, PNG, WebP)
- Checks file size
- Tests load time

---

### Step 4: Review in Admin UI (Optional but Recommended)

1. Go to `/admin/images/review` in your browser
2. Upload `validated-images.json` file
3. Review each image side-by-side (current vs suggested)
4. Approve or reject images
5. Bulk approve selected items

---

### Step 5: Import to Database (Agent 3)

**Dry Run (Preview):**
```bash
npx tsx scripts/agents/import-product-images.ts \
  --input=scripts/output/validated-images.json \
  --dry-run
```

**Actual Import:**
```bash
npx tsx scripts/agents/import-product-images.ts \
  --input=scripts/output/validated-images.json
```

**What it does:**
- Updates `image_url` in database for approved images
- Updates both `engines` and `parts` tables
- Generates import report

---

## 📋 Complete Pipeline

Run all steps in sequence:

```bash
# 1. Export
npx tsx scripts/export-products-needing-images.ts

# 2. Find (requires implementation)
npx tsx scripts/agents/find-product-images.ts --input=scripts/output/products-needing-images-*.json

# 3. Validate
npx tsx scripts/agents/validate-product-images.ts --input=scripts/output/found-images.json

# 4. Review in Admin UI at /admin/images/review
# Upload validated-images.json and approve/reject

# 5. Import
npx tsx scripts/agents/import-product-images.ts --input=scripts/output/validated-images.json
```

---

## 🔧 Setup

### Required Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Required Packages

```bash
cd frontend
npm install --save-dev tsx
npm install @supabase/supabase-js
```

---

## 🤖 Agent Details

### Agent 1: Image Finder

**Status:** Framework ready, needs implementation for actual image extraction

**Current behavior:**
- Uses affiliate URLs when available
- Placeholder logic for Harbor Freight and Amazon
- Requires actual web scraping or API integration

**To improve:**
- Implement Puppeteer/Playwright for web scraping
- Use Google Custom Search API
- Implement Amazon Product Advertising API
- Add manufacturer website search

### Agent 2: Image Validator

**Status:** ✅ Fully functional

**Features:**
- HTTP HEAD requests to check accessibility
- Content-type validation
- File size checking
- Load time measurement

### Agent 3: Database Updater

**Status:** ✅ Fully functional

**Features:**
- Bulk updates database
- Dry-run mode for preview
- Error handling and reporting
- Supports both engines and parts

---

## 📊 Output Format

### Found Images JSON
```json
{
  "product_id": "uuid",
  "product_type": "engine|part",
  "product_name": "Predator 212 Hemi",
  "image_url": "https://...",
  "source": "harbor_freight",
  "confidence": 0.9,
  "metadata": {
    "format": "jpg",
    "notes": "..."
  },
  "errors": []
}
```

### Validated Images JSON
Same format + validation fields:
```json
{
  "valid": true,
  "http_status": 200,
  "format": "jpg",
  "file_size": 125000,
  "load_time_ms": 250,
  "validation_errors": []
}
```

---

## 🎯 Next Steps

1. **Implement Agent 1 properly:**
   - Add web scraping with Puppeteer
   - Integrate supplier APIs
   - Add Google Image Search

2. **Enhance validation:**
   - Add image dimension checking
   - Quality scoring
   - Duplicate detection

3. **Admin UI improvements:**
   - Connect to API endpoint (instead of file upload)
   - Add image comparison tools
   - Bulk operations

---

*Last Updated: 2026-01-16*
