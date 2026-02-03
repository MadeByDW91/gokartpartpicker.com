/**
 * Zod validation schemas for GoKart Part Picker
 * Based on types/database.ts
 */

import { z } from 'zod';
import { PART_CATEGORIES, SHAFT_TYPES, VIDEO_CATEGORIES } from '@/types/database';

// ============================================================================
// Shared Schemas
// ============================================================================

/**
 * UUID validation schema
 */
export const uuidSchema = z.string().uuid('Invalid ID format');

/**
 * Pagination schema for list queries
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/**
 * Sort order schema
 */
export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');

// ============================================================================
// Engine Schemas
// ============================================================================

/**
 * Engine filters for list queries
 * Per db-query-contract.md: GET /api/engines
 */
export const engineFiltersSchema = z.object({
  brand: z.string().optional(),
  min_hp: z.coerce.number().positive().optional(),
  max_hp: z.coerce.number().positive().optional(),
  min_cc: z.coerce.number().int().positive().optional(),
  max_cc: z.coerce.number().int().positive().optional(),
  shaft_type: z.enum(SHAFT_TYPES).optional(),
  sort: z.enum(['price', 'horsepower', 'displacement_cc', 'created_at']).default('displacement_cc'),
  order: sortOrderSchema,
  // Pagination
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type EngineFiltersInput = z.infer<typeof engineFiltersSchema>;

/**
 * Get single engine by ID
 */
export const getEngineSchema = z.object({
  id: uuidSchema,
});

export type GetEngineInput = z.infer<typeof getEngineSchema>;

/**
 * Get engine by slug
 */
export const getEngineBySlugSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
});

export type GetEngineBySlugInput = z.infer<typeof getEngineBySlugSchema>;

/**
 * Create engine schema (admin only)
 */
export const createEngineSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  name: z.string().min(1, 'Name is required').max(200),
  brand: z.string().min(1, 'Brand is required').max(100),
  model: z.string().max(100).optional().nullable(),
  variant: z.string().max(100).optional().nullable(),
  displacement_cc: z.coerce.number().int().positive('Displacement must be positive'),
  horsepower: z.coerce.number().positive('Horsepower must be positive'),
  torque: z.coerce.number().positive().optional().nullable(),
  shaft_diameter: z.coerce.number().positive('Shaft diameter must be positive'),
  shaft_length: z.coerce.number().positive().optional().nullable(),
  shaft_type: z.enum(SHAFT_TYPES).default('straight'),
  shaft_keyway: z.coerce.number().positive().optional().nullable(),
  mount_type: z.string().max(100).optional().nullable(),
  price: z.coerce.number().nonnegative().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  affiliate_url: z.string().url().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  is_active: z.boolean().default(true),
});

export type CreateEngineInput = z.infer<typeof createEngineSchema>;

/**
 * Update engine schema (admin only)
 */
export const updateEngineSchema = createEngineSchema.partial().extend({
  id: uuidSchema,
});

export type UpdateEngineInput = z.infer<typeof updateEngineSchema>;

// ============================================================================
// Electric Motor Schemas
// ============================================================================

/**
 * Motor filters for list queries
 * Per A13 EV Implementation Agent spec
 */
export const motorFiltersSchema = z.object({
  brand: z.string().optional(),
  voltage: z.coerce.number().int().positive().optional(),
  min_hp: z.coerce.number().positive().optional(),
  max_hp: z.coerce.number().positive().optional(),
  min_power_kw: z.coerce.number().positive().optional(),
  max_power_kw: z.coerce.number().positive().optional(),
  sort: z.enum(['price', 'horsepower', 'power_kw', 'voltage', 'created_at']).default('power_kw'),
  order: sortOrderSchema,
  // Pagination
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type MotorFiltersInput = z.infer<typeof motorFiltersSchema>;

/**
 * Get single motor by ID
 */
export const getMotorSchema = z.object({
  id: uuidSchema,
});

export type GetMotorInput = z.infer<typeof getMotorSchema>;

/**
 * Get motor by slug
 */
export const getMotorBySlugSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
});

export type GetMotorBySlugInput = z.infer<typeof getMotorBySlugSchema>;

/**
 * Create motor schema (admin only)
 */
export const createMotorSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  name: z.string().min(1, 'Name is required').max(200),
  brand: z.string().min(1, 'Brand is required').max(100),
  model: z.string().max(100).optional().nullable(),
  variant: z.string().max(100).optional().nullable(),
  voltage: z.coerce.number().int().positive('Voltage must be positive'),
  power_kw: z.coerce.number().positive('Power must be positive'),
  peak_power_kw: z.coerce.number().positive().optional().nullable(),
  horsepower: z.coerce.number().positive('Horsepower must be positive'),
  torque_lbft: z.coerce.number().positive('Torque must be positive'),
  rpm_max: z.coerce.number().int().positive().optional().nullable(),
  rpm_rated: z.coerce.number().int().positive().optional().nullable(),
  efficiency: z.coerce.number().min(0).max(1).optional().nullable(),
  shaft_diameter: z.coerce.number().positive().optional().nullable(),
  shaft_length: z.coerce.number().positive().optional().nullable(),
  shaft_type: z.enum(SHAFT_TYPES).default('straight'),
  mount_type: z.string().max(100).optional().nullable(),
  controller_required: z.boolean().default(true),
  cooling_type: z.string().max(50).optional().nullable(),
  weight_lbs: z.coerce.number().positive().optional().nullable(),
  price: z.coerce.number().nonnegative().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  affiliate_url: z.string().url().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  is_active: z.boolean().default(true),
});

export type CreateMotorInput = z.infer<typeof createMotorSchema>;

/**
 * Update motor schema (admin only)
 */
export const updateMotorSchema = createMotorSchema.partial().extend({
  id: uuidSchema,
});

export type UpdateMotorInput = z.infer<typeof updateMotorSchema>;

// ============================================================================
// Part Schemas
// ============================================================================

/**
 * Part category enum schema
 */
export const partCategorySchema = z.enum(PART_CATEGORIES);

/**
 * Part filters for list queries
 * Per db-query-contract.md: GET /api/parts
 */
export const partFiltersSchema = z.object({
  category: partCategorySchema.optional(),
  brand: z.string().optional(),
  min_price: z.coerce.number().nonnegative().optional(),
  max_price: z.coerce.number().positive().optional(),
  sort: z.enum(['price', 'name', 'created_at']).default('created_at'),
  order: sortOrderSchema,
  // Pagination
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type PartFiltersInput = z.infer<typeof partFiltersSchema>;

/**
 * Get single part by ID
 */
export const getPartSchema = z.object({
  id: uuidSchema,
});

export type GetPartInput = z.infer<typeof getPartSchema>;

/**
 * Get part by slug
 */
export const getPartBySlugSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
});

export type GetPartBySlugInput = z.infer<typeof getPartBySlugSchema>;

/**
 * Create part schema (admin only)
 */
export const createPartSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  name: z.string().min(1, 'Name is required').max(200),
  category: partCategorySchema,
  brand: z.string().max(100).optional().nullable(),
  specifications: z.record(z.string(), z.unknown()).default({}),
  price: z.coerce.number().nonnegative().optional().nullable(),
  image_url: z.preprocess(
    (val) => (val === '' || val === undefined ? null : val),
    z.string().url().nullable()
  ).optional(),
  affiliate_url: z.preprocess(
    (val) => (val === '' || val === undefined ? null : val),
    z.string().url().nullable()
  ).optional(),
  is_active: z.boolean().default(true),
});

export type CreatePartInput = z.infer<typeof createPartSchema>;

/**
 * Update part schema (admin only)
 * Cannot use .partial() on schemas with refinements, so we recreate it
 */
export const updatePartSchema = z.object({
  id: uuidSchema,
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only').optional(),
  name: z.string().min(1, 'Name is required').max(200).optional(),
  category: partCategorySchema.optional(),
  brand: z.string().max(100).optional().nullable(),
  specifications: z.record(z.string(), z.unknown()).optional(),
  price: z.coerce.number().nonnegative().optional().nullable(),
  image_url: z.preprocess(
    (val) => (val === '' || val === undefined ? null : val),
    z.string().url().nullable()
  ).optional(),
  affiliate_url: z.preprocess(
    (val) => (val === '' || val === undefined ? null : val),
    z.string().url().nullable()
  ).optional(),
  is_active: z.boolean().optional(),
});

export type UpdatePartInput = z.infer<typeof updatePartSchema>;

/**
 * Part category info type
 */
export interface PartCategoryInfo {
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

// ============================================================================
// Build Schemas
// ============================================================================

/**
 * Build parts selection - maps category to part UUID
 * Per docs: Build.parts is JSONB: {"clutch": "uuid", "chain": "uuid"}
 * Using partial record since builds don't need all categories
 */
export const buildPartsSchema = z.record(
  z.string(),
  uuidSchema
).refine(
  (obj) => {
    // Validate that keys are valid part categories
    const validCategories = new Set<string>(PART_CATEGORIES);
    return Object.keys(obj).every(key => validCategories.has(key));
  },
  { message: 'Invalid part category in build parts' }
).optional().default({});

export type BuildPartsInput = z.infer<typeof buildPartsSchema>;

/**
 * Create build schema
 * A1 → A4 Handoff (DB schema → validation)
 */
export const createBuildSchema = z.object({
  name: z
    .string()
    .min(1, 'Build name is required')
    .max(100, 'Build name must be under 100 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be under 500 characters')
    .optional()
    .transform(val => val?.trim() || null),
  engine_id: uuidSchema.optional().nullable(),
  motor_id: uuidSchema.optional().nullable(),
  power_source_type: z.enum(['gas', 'electric']).default('gas'),
  parts: buildPartsSchema,
  is_public: z.boolean().default(false),
}).refine(
  (data) => {
    // Must have either engine_id (gas) or motor_id (electric), but not both
    if (data.power_source_type === 'gas') {
      return !!data.engine_id && !data.motor_id;
    } else {
      return !!data.motor_id && !data.engine_id;
    }
  },
  { message: 'Must have either engine_id (gas) or motor_id (electric), but not both' }
);

export type CreateBuildInput = z.infer<typeof createBuildSchema>;

/**
 * Update build schema - all fields optional except id
 */
export const updateBuildSchema = z.object({
  id: uuidSchema,
  name: z
    .string()
    .min(1, 'Build name is required')
    .max(100, 'Build name must be under 100 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be under 500 characters')
    .optional()
    .nullable()
    .transform(val => val?.trim() || null),
  engine_id: uuidSchema.optional().nullable(),
  motor_id: uuidSchema.optional().nullable(),
  power_source_type: z.enum(['gas', 'electric']).optional(),
  parts: buildPartsSchema.optional(),
  is_public: z.boolean().optional(),
});

export type UpdateBuildInput = z.infer<typeof updateBuildSchema>;

/**
 * Delete build schema
 */
export const deleteBuildSchema = z.object({
  id: uuidSchema,
});

export type DeleteBuildInput = z.infer<typeof deleteBuildSchema>;

/**
 * Get single build by ID
 */
export const getBuildSchema = z.object({
  id: uuidSchema,
});

export type GetBuildInput = z.infer<typeof getBuildSchema>;

/**
 * List builds filters
 */
export const listBuildsSchema = z.object({
  userId: uuidSchema.optional(),
  isPublic: z.boolean().optional(),
  engineId: uuidSchema.optional(),
  sort: z.enum(['created_at', 'updated_at', 'name', 'likes_count']).default('updated_at'),
  order: sortOrderSchema,
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ListBuildsInput = z.infer<typeof listBuildsSchema>;

/**
 * Add part to build
 */
export const addPartToBuildSchema = z.object({
  buildId: uuidSchema,
  category: partCategorySchema,
  partId: uuidSchema,
});

export type AddPartToBuildInput = z.infer<typeof addPartToBuildSchema>;

/**
 * Remove part from build
 */
export const removePartFromBuildSchema = z.object({
  buildId: uuidSchema,
  category: partCategorySchema,
});

export type RemovePartFromBuildInput = z.infer<typeof removePartFromBuildSchema>;

// ============================================================================
// Compatibility Schemas
// ============================================================================

/**
 * Severity levels for compatibility rules
 */
export const severitySchema = z.enum(['error', 'warning', 'info']);

/**
 * Compatibility rule filters
 */
export const compatibilityRulesFiltersSchema = z.object({
  ruleType: z.string().optional(),
  sourceCategory: z.string().optional(),
  targetCategory: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type CompatibilityRulesFiltersInput = z.infer<typeof compatibilityRulesFiltersSchema>;

/**
 * Check compatibility input
 */
export const checkCompatibilitySchema = z.object({
  engineId: uuidSchema.optional(),
  partIds: z.array(uuidSchema).default([]),
});

export type CheckCompatibilityInput = z.infer<typeof checkCompatibilitySchema>;

// ============================================================================
// Content Schemas
// ============================================================================

/**
 * Content type enum
 */
export const contentTypeSchema = z.enum(['guide', 'spec', 'safety', 'faq', 'page']);

/**
 * Get content by slug
 */
export const getContentSchema = z.object({
  slug: z.string().min(1).max(200),
});

export type GetContentInput = z.infer<typeof getContentSchema>;

/**
 * List content filters
 */
export const listContentSchema = z.object({
  contentType: contentTypeSchema.optional(),
  isPublished: z.boolean().default(true),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ListContentInput = z.infer<typeof listContentSchema>;

// ============================================================================
// Video Schemas
// ============================================================================

/**
 * Video category enum schema
 */
export const videoCategorySchema = z.enum(VIDEO_CATEGORIES);

/**
 * Video URL validation - supports YouTube, Vimeo, and direct video links
 */
const videoUrlSchema = z.string().url('Invalid video URL').refine(
  (url) => {
    // YouTube URLs
    const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/;
    // Vimeo URLs
    const vimeoPattern = /^(https?:\/\/)?(www\.)?vimeo\.com/;
    // Direct video file URLs
    const directPattern = /^https?:\/\/.+\.(mp4|webm|ogg)/;
    
    return youtubePattern.test(url) || vimeoPattern.test(url) || directPattern.test(url);
  },
  { message: 'Video URL must be from YouTube, Vimeo, or a direct video file (.mp4, .webm, .ogg)' }
);

/**
 * Get videos for engine
 */
export const getEngineVideosSchema = z.object({
  engineId: uuidSchema,
  category: videoCategorySchema.optional(),
});

export type GetEngineVideosInput = z.infer<typeof getEngineVideosSchema>;

/**
 * Get videos for part
 */
export const getPartVideosSchema = z.object({
  partId: uuidSchema,
  category: videoCategorySchema.optional(),
});

export type GetPartVideosInput = z.infer<typeof getPartVideosSchema>;

/**
 * Get featured videos
 */
export const getFeaturedVideosSchema = z.object({
  engineId: uuidSchema.optional(),
  partId: uuidSchema.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(5),
}).refine(
  (data) => (data.engineId && !data.partId) || (!data.engineId && data.partId) || (!data.engineId && !data.partId),
  { message: 'Must provide either engineId or partId, not both' }
);

export type GetFeaturedVideosInput = z.infer<typeof getFeaturedVideosSchema>;

/**
 * Create video schema (admin only)
 */
export const createVideoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional().nullable(),
  video_url: videoUrlSchema,
  thumbnail_url: z.string().url('Invalid thumbnail URL').optional().nullable(),
  duration_seconds: z.coerce.number().int().positive().optional().nullable(),
  category: videoCategorySchema,
  engine_id: uuidSchema.optional().nullable(),
  part_id: uuidSchema.optional().nullable(),
  channel_name: z.string().max(100).optional().nullable(),
  channel_url: z.string().url('Invalid channel URL').optional().nullable(),
  published_date: z.coerce.date().optional().nullable(),
  language: z.string().max(10).default('en'),
  is_featured: z.boolean().default(false),
  display_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
}).refine(
  (data) => (data.engine_id && !data.part_id) || (!data.engine_id && data.part_id),
  { message: 'Must provide either engine_id or part_id, not both or neither', path: ['engine_id'] }
);

export type CreateVideoInput = z.infer<typeof createVideoSchema>;

/**
 * Update video schema (admin only)
 * Cannot use .partial() on schemas with refinements, so we recreate it
 */
export const updateVideoSchema = z.object({
  id: uuidSchema,
  title: z.string().min(1, 'Title is required').max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  video_url: videoUrlSchema.optional(),
  thumbnail_url: z.string().url('Invalid thumbnail URL').optional().nullable(),
  duration_seconds: z.coerce.number().int().positive().optional().nullable(),
  category: videoCategorySchema.optional(),
  engine_id: uuidSchema.optional().nullable(),
  part_id: uuidSchema.optional().nullable(),
  channel_name: z.string().max(100).optional().nullable(),
  channel_url: z.string().url('Invalid channel URL').optional().nullable(),
  published_date: z.coerce.date().optional().nullable(),
  language: z.string().max(10).optional(),
  is_featured: z.boolean().optional(),
  display_order: z.coerce.number().int().optional(),
  is_active: z.boolean().optional(),
});

export type UpdateVideoInput = z.infer<typeof updateVideoSchema>;

/**
 * Video filters for admin
 */
export const videoFiltersSchema = z.object({
  engine_id: uuidSchema.optional(),
  part_id: uuidSchema.optional(),
  category: videoCategorySchema.optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
  search: z.string().max(200).optional(),
  sort: z.enum(['created_at', 'display_order', 'title', 'view_count']).default('display_order'),
  order: sortOrderSchema,
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type VideoFiltersInput = z.infer<typeof videoFiltersSchema>;

/**
 * Reorder videos schema
 */
export const reorderVideosSchema = z.object({
  videoIds: z.array(uuidSchema).min(1),
  engineId: uuidSchema.optional(),
  partId: uuidSchema.optional(),
}).refine(
  (data) => (data.engineId && !data.partId) || (!data.engineId && data.partId) || (!data.engineId && !data.partId),
  { message: 'Must provide either engineId or partId, not both' }
);

export type ReorderVideosInput = z.infer<typeof reorderVideosSchema>;

/**
 * Bulk delete videos schema
 */
export const bulkDeleteVideosSchema = z.object({
  ids: z.array(uuidSchema).min(1, 'Select at least one video').max(200),
});

export type BulkDeleteVideosInput = z.infer<typeof bulkDeleteVideosSchema>;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse and validate input, returning formatted errors if invalid
 */
export function parseInput<T extends z.ZodSchema>(
  schema: T,
  input: unknown
): { success: true; data: z.infer<T> } | { success: false; error: string; fieldErrors: Record<string, string[]> } {
  const result = schema.safeParse(input);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const fieldErrors: Record<string, string[]> = {};
  const flattened = result.error.flatten();
  
  // Combine field errors
  for (const [key, messages] of Object.entries(flattened.fieldErrors)) {
    const msgArray = messages as string[] | undefined;
    if (msgArray && msgArray.length > 0) {
      fieldErrors[key] = msgArray;
    }
  }
  
  // Get first error message for the main error
  const issues = result.error.issues;
  const firstIssue = issues[0];
  const errorMessage = firstIssue 
    ? `${firstIssue.path.join('.')}: ${firstIssue.message}`.replace(/^: /, '')
    : 'Validation failed';
  
  return { success: false, error: errorMessage, fieldErrors };
}
