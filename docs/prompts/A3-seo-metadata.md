# A3: SEO & Metadata

**Agent:** A3 (UI)  
**Status:** ⏳ Ready

---

```markdown
You are Agent A3: UI.

All major pages are built. Now add SEO metadata to improve search
visibility and social sharing.

TASK: Add SEO Metadata to All Pages

## Pages to Update

### 1. Engine Detail Pages (`src/app/engines/[slug]/page.tsx`)
- Dynamic title: "{Engine Name} | GoKartPartPicker"
- Dynamic description: "{Engine specs} - Compatible parts and build options"
- Open Graph tags
- Twitter Card tags
- Structured data (JSON-LD) for Product schema

### 2. Parts Detail Pages (`src/app/parts/[slug]/page.tsx`)
- Dynamic title: "{Part Name} | GoKartPartPicker"
- Dynamic description: "{Part specs} - Compatible with {engines}"
- Open Graph tags
- Twitter Card tags
- Structured data (JSON-LD) for Product schema

### 3. Builder Page (`src/app/builder/page.tsx`)
- Title: "Go-Kart Builder | GoKartPartPicker"
- Description: "Build your perfect go-kart with our compatibility checker"
- Open Graph tags
- Twitter Card tags

### 4. Homepage (`src/app/page.tsx`)
- Title: "GoKartPartPicker - Build Your Perfect Go-Kart"
- Description: "Stop guessing if parts will work together. Our compatibility checker ensures every component fits perfectly before you buy."
- Open Graph tags with hero image
- Twitter Card tags

### 5. Engines List (`src/app/engines/page.tsx`)
- Title: "Go-Kart Engines | GoKartPartPicker"
- Description: "Browse {count} go-kart engines. Compare specs, prices, and find compatible parts."

### 6. Parts List (`src/app/parts/page.tsx`)
- Title: "Go-Kart Parts | GoKartPartPicker"
- Description: "Browse {count} go-kart parts. Find compatible parts for your build."

## Implementation Pattern

Use Next.js `generateMetadata()` for dynamic pages:

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getEngineBySlug(slug);
  
  if (!result.success) {
    return {
      title: 'Engine Not Found | GoKartPartPicker',
    };
  }
  
  const engine = result.data;
  
  return {
    title: `${engine.name} | GoKartPartPicker`,
    description: `${engine.name} - ${engine.displacement_cc}cc, ${engine.horsepower}HP. Compatible parts and build options.`,
    openGraph: {
      title: `${engine.name} | GoKartPartPicker`,
      description: `${engine.displacement_cc}cc, ${engine.horsepower}HP go-kart engine`,
      images: engine.image_url ? [engine.image_url] : ['/og-default-v1.svg'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${engine.name} | GoKartPartPicker`,
      description: `${engine.displacement_cc}cc, ${engine.horsepower}HP go-kart engine`,
    },
  };
}
```

## Structured Data (JSON-LD)

Add Product schema for engines and parts:

```typescript
const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: engine.name,
  description: engine.notes,
  brand: engine.brand,
  offers: {
    '@type': 'Offer',
    price: engine.price,
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
};
```

## Success Criteria

- [ ] All pages have unique, descriptive titles
- [ ] All pages have meta descriptions
- [ ] Open Graph tags present on all pages
- [ ] Twitter Card tags present
- [ ] Structured data (JSON-LD) on product pages
- [ ] Images use proper OG image URLs
- [ ] No duplicate titles across pages

## DO NOT

- Do NOT modify server actions
- Do NOT change database schema
- Do NOT add new dependencies
```
