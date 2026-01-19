# Product Photos Implementation Plan

> **Feature:** Upload and manage product photos for engines and parts
> **Status:** Planning Phase
> **Priority:** High (Improves user experience and conversion)

---

## 📋 Overview

Currently, engines and parts have `image_url` fields that accept external URLs. We need to:
1. Enable direct image uploads to Supabase Storage
2. Provide admin UI for uploading/managing images
3. Optimize images for web performance
4. Support multiple images per product (optional future enhancement)

---

## 🎯 Goals

### Primary Goals
- ✅ Admins can upload product photos directly in the admin panel
- ✅ Images are stored securely in Supabase Storage
- ✅ Images are optimized for web (compression, formats)
- ✅ Fallback to placeholders when no image exists
- ✅ Support for multiple image sizes (thumbnails, full-size)

### Future Enhancements
- Multiple images per product (gallery)
- Image cropping/editing in admin
- Bulk image upload
- Image CDN integration
- Automatic image optimization pipeline

---

## 🏗️ Architecture

### Storage Structure

```
Supabase Storage Buckets:
├── product-images/
│   ├── engines/
│   │   ├── {engine-id}/
│   │   │   ├── primary.jpg (main image)
│   │   │   ├── thumbnail.jpg (optimized)
│   │   │   └── original.jpg (backup)
│   └── parts/
│       ├── {part-id}/
│       │   ├── primary.jpg
│       │   ├── thumbnail.jpg
│       │   └── original.jpg
```

### Database Schema

**Current State:**
- `engines.image_url` - TEXT (stores URL)
- `parts.image_url` - TEXT (stores URL)

**Proposed Changes:**
- Keep `image_url` for backward compatibility
- Add optional fields for multiple images:
  - `image_urls` JSONB - Array of image URLs
  - `primary_image_url` TEXT - Main image (for quick access)

**Migration Strategy:**
- Phase 1: Use existing `image_url` field, store Supabase Storage URLs
- Phase 2: Add `image_urls` JSONB field for multiple images
- Phase 3: Migrate existing external URLs to Supabase Storage (optional)

---

## 📦 Implementation Phases

### Phase 1: Storage Setup & Basic Upload (MVP)

#### 1.1 Supabase Storage Configuration

**Tasks:**
- [ ] Create `product-images` bucket in Supabase
- [ ] Configure bucket policies (public read, admin write)
- [ ] Set up RLS policies for storage
- [ ] Configure CORS for image access

**Files:**
- `supabase/migrations/XXXXX_setup_product_images_storage.sql`

**Storage Policies:**
```sql
-- Public read access for product images
CREATE POLICY "Product images are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Only admins can upload
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.role() IN ('admin', 'super_admin')
);

-- Only admins can update/delete
CREATE POLICY "Admins can manage product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND auth.role() IN ('admin', 'super_admin')
);
```

#### 1.2 Image Upload Server Actions

**Tasks:**
- [ ] Create `uploadProductImage` server action
- [ ] Handle image validation (type, size)
- [ ] Generate optimized versions (thumbnail, web)
- [ ] Return public URL for storage in database

**Files:**
- `frontend/src/actions/admin/images.ts`

**Function Signature:**
```typescript
export async function uploadProductImage(
  file: File,
  productType: 'engine' | 'part',
  productId: string
): Promise<ActionResult<{ url: string; thumbnailUrl: string }>>
```

**Features:**
- Validate file type (jpg, png, webp)
- Validate file size (max 10MB)
- Generate unique filename
- Upload to Supabase Storage
- Return public URL

#### 1.3 Image Upload Component

**Tasks:**
- [ ] Create `ImageUpload` component
- [ ] Drag-and-drop support
- [ ] Image preview
- [ ] Progress indicator
- [ ] Error handling

**Files:**
- `frontend/src/components/admin/ImageUpload.tsx`

**Features:**
- Drag & drop interface
- File input fallback
- Image preview before upload
- Upload progress bar
- Error messages
- Remove/replace image

#### 1.4 Admin Form Integration

**Tasks:**
- [ ] Add image upload to EngineForm
- [ ] Add image upload to PartForm
- [ ] Display current image with option to replace
- [ ] Save image URL to database

**Files:**
- `frontend/src/components/admin/EngineForm.tsx`
- `frontend/src/components/admin/PartForm.tsx`

---

### Phase 2: Image Optimization

#### 2.1 Client-Side Optimization

**Tasks:**
- [ ] Implement image compression before upload
- [ ] Resize images to optimal dimensions
- [ ] Convert to WebP format (with fallback)
- [ ] Generate thumbnail version

**Libraries:**
- `browser-image-compression` - Client-side compression
- Or use Supabase Storage transformations (if available)

**Image Specifications:**
- **Primary Image:** Max 1200x1200px, WebP/JPEG, ~200KB
- **Thumbnail:** 400x400px, WebP/JPEG, ~50KB
- **Original:** Keep for future use

#### 2.2 Server-Side Processing (Future)

**Tasks:**
- [ ] Set up image processing pipeline
- [ ] Automatic thumbnail generation
- [ ] Multiple size variants (responsive images)
- [ ] Lazy loading support

---

### Phase 3: Multiple Images Support

#### 3.1 Database Schema Update

**Migration:**
```sql
-- Add image_urls array field
ALTER TABLE engines 
ADD COLUMN image_urls JSONB DEFAULT '[]'::JSONB;

ALTER TABLE parts 
ADD COLUMN image_urls JSONB DEFAULT '[]'::JSONB;

-- Index for performance
CREATE INDEX idx_engines_image_urls ON engines USING GIN (image_urls);
CREATE INDEX idx_parts_image_urls ON parts USING GIN (image_urls);
```

#### 3.2 Image Gallery Component

**Tasks:**
- [ ] Create `ImageGallery` component
- [ ] Support multiple image uploads
- [ ] Reorder images (set primary)
- [ ] Delete individual images

**Files:**
- `frontend/src/components/admin/ImageGallery.tsx`

---

### Phase 4: Public Display Enhancements

#### 4.1 Image Display Components

**Tasks:**
- [ ] Enhance `EngineCard` with better image handling
- [ ] Enhance `PartCard` with better image handling
- [ ] Add image zoom/lightbox on detail pages
- [ ] Implement lazy loading

**Files:**
- `frontend/src/components/ProductImage.tsx` (new reusable component)

**Features:**
- Automatic placeholder fallback
- Lazy loading
- Responsive images (srcset)
- Image zoom on click
- Loading states

#### 4.2 SEO & Performance

**Tasks:**
- [ ] Add proper alt text for all images
- [ ] Implement Next.js Image optimization
- [ ] Add structured data for product images
- [ ] Optimize Core Web Vitals

---

## 🔧 Technical Implementation

### Storage Bucket Setup

**SQL Migration:**
```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- RLS Policies (see Phase 1.1)
```

### Upload Flow

```
1. Admin selects image file
2. Client validates file (type, size)
3. Client compresses/resizes image
4. Client uploads to Supabase Storage
5. Server action returns public URL
6. URL saved to database (image_url field)
7. Image displayed in admin preview
```

### Image URL Format

**Supabase Storage URL:**
```
https://{project-ref}.supabase.co/storage/v1/object/public/product-images/engines/{engine-id}/primary.jpg
```

**Database Storage:**
- Store full public URL in `image_url`
- Or store relative path: `engines/{engine-id}/primary.jpg` and construct URL client-side

---

## 📁 File Structure

```
frontend/src/
├── actions/
│   └── admin/
│       └── images.ts          # Image upload server actions
├── components/
│   ├── admin/
│   │   ├── ImageUpload.tsx    # Upload component
│   │   └── ImageGallery.tsx   # Multiple images (Phase 3)
│   └── ProductImage.tsx        # Reusable image display
└── lib/
    └── image-utils.ts          # Image processing utilities

supabase/
└── migrations/
    └── XXXXX_setup_product_images_storage.sql
```

---

## 🧪 Testing Checklist

### Phase 1 Testing
- [ ] Upload image for engine (admin)
- [ ] Upload image for part (admin)
- [ ] Verify image appears in admin preview
- [ ] Verify image appears on public engine page
- [ ] Verify image appears on public part page
- [ ] Verify placeholder shows when no image
- [ ] Test file size validation (reject >10MB)
- [ ] Test file type validation (reject non-images)
- [ ] Test error handling (network failures)
- [ ] Verify RLS policies (non-admins can't upload)

### Phase 2 Testing
- [ ] Verify image compression works
- [ ] Verify thumbnail generation
- [ ] Test image quality after compression
- [ ] Verify WebP conversion (with fallback)

### Phase 3 Testing
- [ ] Upload multiple images
- [ ] Reorder images
- [ ] Set primary image
- [ ] Delete individual images
- [ ] Verify gallery displays correctly

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Create Supabase Storage bucket
- [ ] Configure bucket policies
- [ ] Test upload functionality locally
- [ ] Verify image URLs are accessible
- [ ] Test with production Supabase project

### Post-Deployment
- [ ] Monitor storage usage
- [ ] Set up storage alerts (if available)
- [ ] Document image upload process for admins
- [ ] Create backup strategy for images

---

## 📊 Success Metrics

- **Adoption:** % of products with images
- **Performance:** Image load times
- **Storage:** Total storage used
- **User Engagement:** Click-through rates on products with images

---

## 🔄 Migration Plan for Existing Data

### Option 1: Keep External URLs
- Leave existing `image_url` values as-is
- Only new uploads go to Supabase Storage
- Gradual migration over time

### Option 2: Migrate to Storage
- Download existing external images
- Upload to Supabase Storage
- Update database URLs
- Run as one-time migration script

**Recommendation:** Start with Option 1, migrate to Option 2 later if needed.

---

## 🎨 UI/UX Considerations

### Admin Upload Interface
- Drag-and-drop zone (large, clear)
- File input button (fallback)
- Image preview (before upload)
- Progress indicator
- Success/error feedback
- Remove/replace option

### Public Display
- Consistent aspect ratios
- Hover effects (zoom, overlay)
- Loading states (skeleton)
- Error states (placeholder)
- Responsive sizing

---

## 🔐 Security Considerations

- **File Type Validation:** Only allow image types
- **File Size Limits:** Max 10MB per image
- **Access Control:** Only admins can upload
- **Virus Scanning:** Consider for production
- **Rate Limiting:** Prevent abuse

---

## 📝 Next Steps

1. **Review & Approve Plan** ✅
2. **Create Storage Bucket** - Run migration
3. **Build Upload Server Action** - `actions/admin/images.ts`
4. **Create ImageUpload Component** - `components/admin/ImageUpload.tsx`
5. **Integrate into Admin Forms** - EngineForm & PartForm
6. **Test End-to-End** - Upload → Display
7. **Deploy to Production**

---

## 📚 Resources

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Next.js Image Optimization](https://nextjs.org/docs/pages/api-reference/components/image)
- [browser-image-compression](https://www.npmjs.com/package/browser-image-compression)

---

*Last Updated: 2026-01-16*
*Owner: A3 (UI/Frontend) + A5 (Admin)*
