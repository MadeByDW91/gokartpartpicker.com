# Bulk Product Image Import Plan

> **Goal:** Import product images from suppliers for all engines and parts
> **Strategy:** Use AI agents + automated tools to fetch and import images
> **Status:** Planning Phase

---

## 🎯 Overview

Replace placeholder images with actual product photos from suppliers. Use a combination of:
1. **AI Agents** - To find and validate image URLs
2. **Automated Scripts** - To bulk update the database
3. **Manual Review** - For quality assurance

---

## 📋 Image Sources

### Primary Sources (Priority Order)

1. **Harbor Freight** (Engines)
   - Direct product pages
   - High-quality images
   - Known URLs from affiliate links

2. **Amazon** (Parts & Engines)
   - Product listings
   - Multiple images per product
   - API access possible

3. **eBay** (Parts & Engines)
   - Product listings
   - Good coverage for parts

4. **Manufacturer Websites**
   - Predator Engines (Harbor Freight)
   - GoPowerSports
   - BMI Karts
   - OMB Warehouse
   - Others

5. **Direct Supplier APIs** (if available)
   - Some suppliers offer product image APIs

---

## 🤖 Agent Workflow

### Agent 1: Image Finder Agent
**Purpose:** Find product image URLs from supplier websites

**Tasks:**
1. For each engine/part without an image:
   - Search product by name/brand/model
   - Visit supplier product pages (Amazon, Harbor Freight, etc.)
   - Extract primary product image URL
   - Validate image exists and is accessible
   - Note image dimensions and quality

**Output:** CSV/JSON with `product_id`, `image_url`, `source`, `verified`

### Agent 2: Image Validator Agent
**Purpose:** Verify and optimize image URLs

**Tasks:**
1. Check image URLs are accessible (HTTP 200)
2. Verify image format (JPG, PNG, WebP)
3. Check image dimensions (min 400x400px)
4. Test image loading speed
5. Flag low-quality or broken images

**Output:** Validated image URLs with metadata

### Agent 3: Database Update Agent
**Purpose:** Bulk update database with image URLs

**Tasks:**
1. Read validated image URLs
2. Update `image_url` field in database
3. Track updates (audit log)
4. Generate report of successes/failures

---

## 🛠️ Implementation Approaches

### Approach 1: Automated Web Scraping (Recommended for MVP)

**Tools:**
- Puppeteer/Playwright for browser automation
- Cheerio for HTML parsing
- Node.js scripts

**Process:**
```javascript
// Pseudo-code
for each product:
  1. Search product on Harbor Freight/Amazon
  2. Extract product page URL
  3. Scrape primary product image
  4. Download and validate image
  5. Upload to Supabase Storage (or use direct URL)
  6. Update database image_url
```

**Pros:**
- Can be fully automated
- Works with existing affiliate links
- Can handle bulk operations

**Cons:**
- May violate some sites' ToS
- Requires rate limiting
- Need to handle anti-bot measures

### Approach 2: API-Based (If Available)

**Amazon Product Advertising API:**
- Official API access
- Requires API keys
- Rate limits apply
- More reliable

**Other Supplier APIs:**
- Check if suppliers offer APIs
- Some have product feeds (CSV/XML)

### Approach 3: Manual + AI-Assisted

**Process:**
1. Generate list of products without images
2. Use AI to search and suggest image URLs
3. Human reviews and approves
4. Bulk import approved URLs

**Pros:**
- Quality control
- No ToS violations
- Can curate best images

**Cons:**
- Time-consuming
- Requires human input

---

## 📊 Database Schema

### Current State
```sql
-- Engines
ALTER TABLE engines ADD COLUMN image_url TEXT;

-- Parts  
ALTER TABLE parts ADD COLUMN image_url TEXT;
```

### Proposed Enhancements
```sql
-- Track image source and metadata
ALTER TABLE engines ADD COLUMN image_metadata JSONB DEFAULT '{}';
ALTER TABLE parts ADD COLUMN image_metadata JSONB DEFAULT '{}';

-- image_metadata structure:
{
  "source": "harbor_freight|amazon|manufacturer",
  "source_url": "https://...",
  "verified_at": "2026-01-16T...",
  "dimensions": {"width": 800, "height": 800},
  "file_size": 125000,
  "format": "jpg"
}
```

---

## 🔄 Import Workflow

### Step 1: Prepare Product List
```sql
-- Find products without images
SELECT id, name, brand, slug, affiliate_url 
FROM engines 
WHERE image_url IS NULL OR image_url = '';

SELECT id, name, brand, slug, affiliate_url 
FROM parts 
WHERE image_url IS NULL OR image_url = '';
```

Export to CSV for agent processing.

### Step 2: Agent Processing
Run agents to find image URLs:
- Agent 1 finds images
- Agent 2 validates images
- Output: `product-images-validated.json`

### Step 3: Review & Approve
- Human reviews suggested images
- Approve/reject per product
- Export approved list

### Step 4: Bulk Update
```sql
-- Update engines
UPDATE engines 
SET image_url = :url,
    image_metadata = :metadata::jsonb
WHERE id = :id;

-- Update parts
UPDATE parts 
SET image_url = :url,
    image_metadata = :metadata::jsonb
WHERE id = :id;
```

### Step 5: Verify
- Check all products have images
- Test image loading on frontend
- Generate report

---

## 🤖 Agent Implementation Details

### Agent 1: Image Finder Script

**Location:** `scripts/agents/find-product-images.ts`

**Input:**
- CSV file with products (id, name, brand, slug, affiliate_url)
- Source preferences (Harbor Freight, Amazon, etc.)

**Process:**
1. Read product data
2. For each product:
   - Try affiliate_url first (if exists)
   - Search on primary sources
   - Extract image URL
   - Validate URL format
3. Output results

**Output Format:**
```json
{
  "product_id": "uuid",
  "product_type": "engine|part",
  "image_url": "https://...",
  "source": "harbor_freight",
  "confidence": 0.95,
  "metadata": {
    "dimensions": {"width": 800, "height": 800},
    "format": "jpg"
  }
}
```

### Agent 2: Image Validator Script

**Location:** `scripts/agents/validate-product-images.ts`

**Process:**
1. Read image URLs from Agent 1 output
2. For each URL:
   - HTTP HEAD request to check accessibility
   - Download and check image properties
   - Verify format and dimensions
   - Test load time
3. Flag invalid/broken images

**Output:** Validated image list with quality scores

### Agent 3: Database Update Script

**Location:** `scripts/agents/import-product-images.ts`

**Process:**
1. Read validated images JSON
2. Connect to Supabase
3. Update database in batches
4. Generate update report

---

## 📝 Image URL Patterns

### Harbor Freight
```
Pattern: https://www.harborfreight.com/media/catalog/product/cache/{hash}/image/{hash}/{sku}.jpg
Or: Direct product page image extraction
```

### Amazon
```
Pattern: https://m.media-amazon.com/images/I/{hash}.{ext}
Or: Product page primary image extraction
```

### Generic Product Pages
- Usually in `<img>` tags with class/id containing "product", "main", "primary"
- Often in Open Graph meta tags: `<meta property="og:image" content="...">`

---

## 🚀 Quick Start Scripts

### Script 1: Export Products Without Images
```bash
node scripts/export-products-without-images.js
# Outputs: products-needing-images.csv
```

### Script 2: Find Images (Agent 1)
```bash
node scripts/agents/find-product-images.js \
  --input products-needing-images.csv \
  --output found-images.json \
  --sources harbor_freight,amazon
```

### Script 3: Validate Images (Agent 2)
```bash
node scripts/agents/validate-product-images.js \
  --input found-images.json \
  --output validated-images.json
```

### Script 4: Import to Database (Agent 3)
```bash
node scripts/agents/import-product-images.js \
  --input validated-images.json \
  --dry-run  # Preview changes
```

### Script 5: Full Pipeline
```bash
npm run import:images:all
```

---

## 🔐 Legal & Ethical Considerations

### Best Practices
1. **Respect robots.txt** - Check before scraping
2. **Rate Limiting** - Don't overwhelm servers
3. **User-Agent** - Identify yourself properly
4. **Terms of Service** - Review supplier ToS
5. **Image Rights** - Ensure you have rights to use images

### Recommended Approach
- Use official APIs when available
- Request permission for bulk scraping
- Consider using image CDN services
- Store images locally (download and host)

---

## 📦 Image Storage Options

### Option 1: Direct URLs (Current)
- Store supplier image URLs directly
- Pros: No storage costs, always updated
- Cons: External dependency, can break

### Option 2: Download & Host (Recommended)
- Download images to Supabase Storage
- Pros: Control, reliability, optimization
- Cons: Storage costs, manual updates

### Option 3: Hybrid
- Start with direct URLs
- Gradually migrate to hosted images
- Best of both worlds

---

## 📊 Success Metrics

- **Coverage:** % of products with images
- **Quality:** Average image resolution
- **Sources:** Distribution of image sources
- **Uptime:** % of images still loading after 30 days

---

## 🔄 Ongoing Maintenance

### Regular Tasks
1. **Monthly:** Check for broken image URLs
2. **Quarterly:** Update images with newer versions
3. **As needed:** Add images for new products

### Automated Monitoring
- Script to check image URLs daily
- Alert when images break
- Auto-replace with backup URLs

---

## 🎯 Next Steps

### Phase 1: Setup (1-2 hours)
- [ ] Create export script for products without images
- [ ] Set up agent scripts structure
- [ ] Test image finding on 5-10 products

### Phase 2: Agent Development (4-6 hours)
- [ ] Build Agent 1: Image Finder
- [ ] Build Agent 2: Image Validator
- [ ] Build Agent 3: Database Updater
- [ ] Test with sample products

### Phase 3: Bulk Import (2-4 hours)
- [ ] Run agents on all products
- [ ] Review and approve images
- [ ] Bulk update database
- [ ] Verify on frontend

### Phase 4: Monitoring (Ongoing)
- [ ] Set up image health checks
- [ ] Create dashboard for image status
- [ ] Automate broken image detection

---

## 📚 Resources

### Tools & Libraries
- **Puppeteer** - Browser automation
- **Cheerio** - HTML parsing
- **Axios** - HTTP requests
- **Sharp** - Image processing
- **csv-parse** - CSV handling

### APIs
- Amazon Product Advertising API
- eBay Finding API (deprecated, but alternatives exist)
- Google Custom Search API (for finding images)

### Legal Resources
- robots.txt checker
- Terms of Service tracker

---

## 🤖 AI Agent Prompts

### Prompt for Image Finder Agent

```
You are an image finder agent. Your task is to find product images for go-kart parts and engines.

For each product, you should:
1. Search the product on supplier websites (Harbor Freight, Amazon, etc.)
2. Find the primary product image URL
3. Verify the image URL is accessible
4. Note the image source

Product: {product_name} {brand} {model}
Existing affiliate URL: {affiliate_url}

Find the best product image URL and return it in this format:
{
  "image_url": "https://...",
  "source": "harbor_freight|amazon|manufacturer",
  "confidence": 0.0-1.0,
  "notes": "..."
}
```

### Prompt for Image Validator Agent

```
You are an image validator agent. Validate product image URLs.

For each image URL:
1. Check if the URL is accessible (HTTP 200)
2. Verify it's a valid image format (JPG, PNG, WebP)
3. Check image dimensions (should be at least 400x400px)
4. Test loading speed

Image URL: {image_url}

Return validation result:
{
  "valid": true|false,
  "http_status": 200,
  "format": "jpg",
  "dimensions": {"width": 800, "height": 800},
  "file_size": 125000,
  "load_time_ms": 250,
  "errors": []
}
```

---

*Last Updated: 2026-01-16*
*Owner: A5 (Admin) + Automation Agents*
