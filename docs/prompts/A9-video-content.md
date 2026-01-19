# A9: Video Content Management

**Agent:** A9 (Video Content)  
**Status:** 🟢 Ready to Start  
**Phase:** Content Enhancement

---

You are Agent A9: Video Content Manager.

Users need helpful how-to videos for each engine and part to learn how to work with, install, and maintain them. This is critical educational content that improves user experience and helps users succeed with their builds.

**TASK: Build Video Content Management System**

Each engine and part needs a dedicated video section with curated, helpful content. Users should be able to easily find relevant videos when viewing engine/part details.

## Requirements

### Video Targets
- **Engines**: Minimum 20 videos per engine
  - Unboxing/review videos
  - Installation guides
  - Maintenance tutorials
  - Modification/upgrade guides
  - Troubleshooting videos
  - Performance tuning
  - Oil change procedures
  - Carburetor tuning
  - Break-in procedures
  - General operation guides

- **Parts**: Minimum 5 videos per part
  - Installation tutorials
  - Compatibility explanations
  - Usage guides
  - Maintenance tips
  - Product reviews/demos

### Video Categories
- `unboxing` - Product unboxing/review
- `installation` - How to install the item
- `maintenance` - How to maintain/service
- `modification` - Performance modifications
- `troubleshooting` - Problem solving
- `tutorial` - General how-to guides
- `review` - Product reviews/comparisons
- `tips` - Pro tips and tricks

## Database Schema

### Migration: `supabase/migrations/YYYYMMDDHHMMSS_add_videos.sql`

```sql
-- ============================================================================
-- VIDEOS TABLE
-- ============================================================================

CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL, -- YouTube/Vimeo embed URL or direct link
  thumbnail_url TEXT, -- Video thumbnail image
  duration_seconds INTEGER, -- Video length in seconds
  category TEXT NOT NULL CHECK (category IN (
    'unboxing',
    'installation',
    'maintenance',
    'modification',
    'troubleshooting',
    'tutorial',
    'review',
    'tips'
  )),
  
  -- Link to engine OR part (exclusive)
  engine_id UUID REFERENCES engines(id) ON DELETE CASCADE,
  part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
  
  -- Metadata
  channel_name TEXT, -- YouTube channel or creator name
  channel_url TEXT, -- Creator channel URL
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  published_date DATE, -- Original publish date
  language TEXT DEFAULT 'en',
  
  -- Admin management
  is_featured BOOLEAN DEFAULT FALSE, -- Featured videos shown first
  display_order INTEGER DEFAULT 0, -- Sort order within category
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  
  -- Audit
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT video_linked_to_item CHECK (
    (engine_id IS NOT NULL AND part_id IS NULL) OR
    (engine_id IS NULL AND part_id IS NOT NULL)
  ),
  CONSTRAINT video_url_format CHECK (
    video_url ~ '^(https?://)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com)/' OR
    video_url ~ '^https?://.+\.(mp4|webm|ogg)'
  )
);

CREATE INDEX idx_videos_engine ON videos(engine_id) WHERE engine_id IS NOT NULL;
CREATE INDEX idx_videos_part ON videos(part_id) WHERE part_id IS NOT NULL;
CREATE INDEX idx_videos_category ON videos(category);
CREATE INDEX idx_videos_featured ON videos(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_videos_active ON videos(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_videos_display_order ON videos(display_order);

COMMENT ON TABLE videos IS 'Educational/how-to videos linked to engines or parts';
COMMENT ON COLUMN videos.video_url IS 'YouTube/Vimeo embed URL or direct video link';
COMMENT ON COLUMN videos.category IS 'Video type: unboxing, installation, maintenance, etc.';
COMMENT ON COLUMN videos.display_order IS 'Sort order within category (lower numbers first)';
```

### RLS Policies

```sql
-- Videos are publicly readable
CREATE POLICY "Videos are publicly readable"
ON videos FOR SELECT
USING (is_active = TRUE);

-- Only admins can manage videos
CREATE POLICY "Admins can manage videos"
ON videos FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);
```

## Server Actions

### `frontend/src/actions/videos.ts`

**Public Actions:**
```typescript
/**
 * Get videos for an engine
 */
export async function getEngineVideos(
  engineId: string,
  category?: string
): Promise<ActionResult<Video[]>>

/**
 * Get videos for a part
 */
export async function getPartVideos(
  partId: string,
  category?: string
): Promise<ActionResult<Video[]>>

/**
 * Get featured videos for an engine
 */
export async function getFeaturedEngineVideos(
  engineId: string,
  limit?: number
): Promise<ActionResult<Video[]>>

/**
 * Get featured videos for a part
 */
export async function getFeaturedPartVideos(
  partId: string,
  limit?: number
): Promise<ActionResult<Video[]>>
```

### `frontend/src/actions/admin/videos.ts`

**Admin Actions:**
```typescript
/**
 * Create a new video
 */
export async function createVideo(
  data: CreateVideoInput
): Promise<ActionResult<Video>>

/**
 * Update an existing video
 */
export async function updateVideo(
  id: string,
  data: Partial<CreateVideoInput>
): Promise<ActionResult<Video>>

/**
 * Delete a video
 */
export async function deleteVideo(id: string): Promise<ActionResult<{ deleted: true }>>

/**
 * Get all videos for admin management
 */
export async function getAdminVideos(
  filters?: VideoFilters
): Promise<ActionResult<Video[]>>

/**
 * Bulk import videos from CSV/JSON
 */
export async function bulkImportVideos(
  videos: CreateVideoInput[]
): Promise<ActionResult<{ imported: number; errors: number }>>

/**
 * Reorder videos within a category
 */
export async function reorderVideos(
  videoIds: string[],
  engineId?: string,
  partId?: string
): Promise<ActionResult<Video[]>>
```

## Type Definitions

### `frontend/src/types/database.ts`

```typescript
export type VideoCategory = 
  | 'unboxing'
  | 'installation'
  | 'maintenance'
  | 'modification'
  | 'troubleshooting'
  | 'tutorial'
  | 'review'
  | 'tips';

export interface Video {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  category: VideoCategory;
  engine_id: string | null;
  part_id: string | null;
  channel_name: string | null;
  channel_url: string | null;
  view_count: number;
  like_count: number;
  published_date: string | null;
  language: string;
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  engine?: Engine;
  part?: Part;
}

export interface CreateVideoInput {
  title: string;
  description?: string | null;
  video_url: string;
  thumbnail_url?: string | null;
  duration_seconds?: number | null;
  category: VideoCategory;
  engine_id?: string | null;
  part_id?: string | null;
  channel_name?: string | null;
  channel_url?: string | null;
  published_date?: string | null;
  language?: string;
  is_featured?: boolean;
  display_order?: number;
  is_active?: boolean;
}
```

## UI Components

### User-Facing Components

#### `frontend/src/components/videos/VideoSection.tsx`
**Purpose:** Main video section for engine/part detail pages

**Features:**
- Tabbed interface by video category
- Featured videos section at top
- Video grid with thumbnails
- Search/filter within section
- "Load more" pagination
- Responsive grid (1-4 columns based on screen size)

**Props:**
```typescript
interface VideoSectionProps {
  engineId?: string;
  partId?: string;
  initialVideos?: Video[];
  featuredCount?: number;
}
```

#### `frontend/src/components/videos/VideoCard.tsx`
**Purpose:** Individual video card with thumbnail

**Features:**
- Thumbnail image
- Title and description (truncated)
- Duration badge
- Category badge
- Channel name
- Click to open video modal/player
- Hover effects

#### `frontend/src/components/videos/VideoPlayer.tsx`
**Purpose:** Embedded video player modal

**Features:**
- YouTube/Vimeo iframe embed
- Close button
- Related videos sidebar
- Video metadata (description, channel, publish date)

#### `frontend/src/components/videos/VideoGrid.tsx`
**Purpose:** Responsive grid layout for videos

**Features:**
- 1 column (mobile)
- 2 columns (tablet)
- 3-4 columns (desktop)
- Gap spacing
- Loading skeletons

### Admin Components

#### `frontend/src/app/admin/videos/page.tsx`
**Purpose:** Admin page to manage all videos

**Features:**
- List all videos
- Filter by engine/part/category/status
- Search videos
- Bulk operations (activate/deactivate, delete)
- Quick links to add videos to specific engines/parts

#### `frontend/src/app/admin/videos/[id]/page.tsx`
**Purpose:** Edit individual video

**Features:**
- Full video form
- Preview video embed
- Test video URL
- Reorder within category
- Delete/activate/deactivate

#### `frontend/src/app/admin/videos/new/page.tsx`
**Purpose:** Create new video

**Features:**
- Video creation form
- Link to engine or part (exclusive selection)
- Category selector
- Video URL validator
- Thumbnail URL field (optional, auto-extract from YouTube if possible)

#### `frontend/src/components/admin/VideoForm.tsx`
**Purpose:** Reusable form for creating/editing videos

**Features:**
- Title input
- Description textarea
- Video URL input with validation
- Thumbnail URL input
- Duration input (minutes:seconds)
- Category select
- Engine/Part selector (radio buttons, exclusive)
- Channel name/URL
- Published date picker
- Featured toggle
- Display order input
- Active toggle

#### `frontend/src/app/admin/engines/[id]/videos/page.tsx`
**Purpose:** Quick video management from engine detail page

**Features:**
- List all videos for this engine
- Add new video (pre-filled with engine_id)
- Reorder videos
- Featured video selector

#### `frontend/src/app/admin/parts/[id]/videos/page.tsx`
**Purpose:** Quick video management from part detail page

**Features:**
- List all videos for this part
- Add new video (pre-filled with part_id)
- Reorder videos
- Featured video selector

## Integration Points

### Engine Detail Page
**File:** `frontend/src/app/engines/[slug]/page.tsx`

Add `<VideoSection engineId={engine.id} />` after specifications section, before compatibility section.

### Part Detail Page
**File:** `frontend/src/app/parts/[slug]/page.tsx`

Add `<VideoSection partId={part.id} />` after specifications section, before compatibility section.

### Admin Navigation
**File:** `frontend/src/app/admin/layout.tsx`

Add navigation item:
```typescript
{ name: 'Videos', href: '/admin/videos', icon: Video }
```

## Video URL Handling

### Supported Platforms
- **YouTube**: `https://www.youtube.com/watch?v=VIDEO_ID` or `https://youtu.be/VIDEO_ID`
- **YouTube Embed**: `https://www.youtube.com/embed/VIDEO_ID`
- **Vimeo**: `https://vimeo.com/VIDEO_ID`
- **Direct Video**: `.mp4`, `.webm`, `.ogg` URLs

### YouTube Thumbnail Auto-extraction
If thumbnail_url is not provided, attempt to extract from YouTube URL:
- Format: `https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg`

### URL Validation
- Validate URL format before saving
- Test embed URL on save (optional, warn if fails)
- Store original URL for display, generate embed URL on-demand

## Video Seed Data Strategy

### Initial Video Collection

**Phase 1: Top Engines (5-10 most popular)**
- Collect 20+ videos per engine from YouTube
- Focus on installation, maintenance, modifications
- Prioritize channels with good production quality
- Include mix of beginner and advanced content

**Phase 2: Popular Parts (20-30 categories)**
- Collect 5+ videos per popular part
- Focus on installation and usage guides
- Include compatibility explanations

**Sources:**
- YouTube search: "{Engine Name} unboxing", "{Engine Name} installation", etc.
- Popular go-kart YouTube channels
- Manufacturer channels (Harbor Freight, etc.)
- Community forums for recommendations

**Data Format for Bulk Import:**
```csv
title,description,video_url,thumbnail_url,duration_seconds,category,engine_id,part_id,channel_name,channel_url,published_date,is_featured,display_order
"Predator 212 Unboxing and First Look",... ,https://youtube.com/watch?v=xxx,... ,300,unboxing,engine-uuid,,Channel Name,https://youtube.com/@channel,2024-01-15,true,0
```

## Success Criteria

- [ ] Videos table created with proper constraints
- [ ] RLS policies configured
- [ ] Server actions for video CRUD implemented
- [ ] VideoSection component displays on engine/part pages
- [ ] VideoCard component renders videos with thumbnails
- [ ] VideoPlayer modal displays embedded videos
- [ ] Admin can create/edit/delete videos
- [ ] Admin can bulk import videos
- [ ] Videos can be reordered within categories
- [ ] Featured videos display prominently
- [ ] Video filtering by category works
- [ ] Minimum 20 videos seeded for top 5 engines
- [ ] Minimum 5 videos seeded for top 20 parts
- [ ] Videos are responsive on mobile/tablet/desktop
- [ ] Video URLs validate correctly
- [ ] YouTube thumbnails auto-extract when possible

## Notes

- **Video Storage**: Videos are NOT stored in Supabase storage - only URLs to YouTube/Vimeo/external hosting
- **Thumbnails**: Can be hosted in Supabase storage OR use YouTube/Vimeo thumbnail URLs
- **Performance**: Consider lazy-loading video thumbnails
- **SEO**: Video schema markup for search engines (future enhancement)
- **Analytics**: Track which videos are most watched (future enhancement)
- **User Submissions**: Future feature - allow users to suggest videos (admin approval required)

## Handoffs

**From:** A5 (Admin) - Admin UI patterns  
**To:** A3 (UI) - Video component styling integration  
**To:** A8 (QA) - Test video embed functionality, admin workflows

---

*Created: 2025-01-16*  
*Status: Ready to Start*  
*Priority: High - Improves user experience significantly*
