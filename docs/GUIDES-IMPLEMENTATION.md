# Installation Guides System - Implementation Plan

## Overview
A comprehensive installation guides system that provides step-by-step instructions for installing, maintaining, and upgrading go-kart parts and engines.

## Database Schema

### Enhanced Content Table
- Uses existing `content` table with `content_type = 'guide'`
- Added fields:
  - `estimated_time_minutes` - Time to complete guide
  - `difficulty_level` - beginner, intermediate, advanced, expert
  - `related_engine_id` - Link to specific engine
  - `related_part_id` - Link to specific part
  - `category` - Installation, Maintenance, Performance, Safety, Troubleshooting
  - `tags` - Array of tags for searching
  - `featured_image_url` - Hero image for guide card
  - `views_count` - Track popularity
  - `helpful_count` - User feedback

### Guide Steps Table
- `guide_steps` - Step-by-step instructions
  - `step_number` - Order of steps
  - `title` - Step title
  - `description` - Brief description
  - `instructions` - Detailed instructions (HTML)
  - `image_url` - Step image
  - `video_url` - Step video
  - `warning` - Safety warnings
  - `tips` - Helpful tips

### Guide Helpful Table
- `guide_helpful` - User feedback
  - Tracks if users found guide helpful
  - One vote per user per guide

## Features Implemented

### User-Facing
1. **Guides Landing Page** (`/guides`)
   - Grid of guide cards
   - Search functionality
   - Filter by category and difficulty
   - Shows estimated time, views, difficulty

2. **Individual Guide Page** (`/guides/[slug]`)
   - Full guide content
   - Step-by-step instructions
   - Images and videos per step
   - Warnings and tips
   - Mark steps as complete
   - "Was this helpful?" feedback

3. **Integration with Tools**
   - Added to Tools & Calculators page
   - Accessible from main navigation

### Admin Features (To Be Implemented)
1. **Guide Management**
   - Create/edit guides
   - Add/edit steps
   - Upload images
   - Set difficulty, time, category
   - Link to engines/parts
   - Publish/unpublish

2. **Analytics**
   - View counts
   - Helpful ratings
   - Popular guides
   - Guide performance

## Sample Guides to Create

1. **Billet Flywheel Installation**
   - Category: Installation
   - Difficulty: Advanced
   - Time: 90 minutes
   - Related: Flywheel parts

2. **Camshaft Installation Guide**
   - Category: Installation
   - Difficulty: Intermediate
   - Time: 180 minutes
   - Related: Camshaft parts, Predator 212

3. **Remove Governor on Predator 212**
   - Category: Performance
   - Difficulty: Beginner
   - Time: 60 minutes
   - Related: Predator 212 engine

4. **Oil Sensor Delete**
   - Category: Performance
   - Difficulty: Beginner
   - Time: 15 minutes
   - Related: Predator engines

5. **Stage 1 Performance Build**
   - Category: Performance
   - Difficulty: Intermediate
   - Time: 120 minutes
   - Related: Multiple parts

## Next Steps

1. **Create Admin Interface**
   - Guide CRUD operations
   - Step management
   - Image upload
   - Rich text editor for instructions

2. **Seed Initial Guides**
   - Create 5-10 sample guides
   - Add step-by-step instructions
   - Include images and warnings

3. **Enhancements**
   - Print-friendly guide view
   - PDF export
   - Share functionality
   - Related guides suggestions
   - Video integration
   - User comments/ratings

4. **Integration**
   - Link guides from part pages
   - Link guides from engine pages
   - Show related guides in builder
   - Suggest guides based on build

## Technical Notes

- Guides use existing `content` table
- Steps stored in separate `guide_steps` table
- RLS policies ensure public read, admin write
- View counting happens automatically
- Helpful votes require authentication
- All content supports HTML for rich formatting
