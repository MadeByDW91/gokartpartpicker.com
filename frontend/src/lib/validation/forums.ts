import { z } from 'zod';
import { parseInput as parseInputBase } from './schemas';

// Re-export parseInput for convenience
export const parseInput = parseInputBase;

// ============================================================================
// Forum Category Schemas
// ============================================================================

export const forumCategorySlugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(200, 'Slug must be less than 200 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only');

export const createForumCategorySchema = z.object({
  slug: forumCategorySlugSchema,
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  parent_id: z.string().uuid().optional().nullable(),
  icon: z.string().max(50).optional(),
  color: z.string().max(20).optional(),
  sort_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  requires_auth: z.boolean().default(false),
});

export type CreateForumCategoryInput = z.infer<typeof createForumCategorySchema>;

// ============================================================================
// Forum Topic Schemas
// ============================================================================

export const forumTopicSlugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(200, 'Slug must be less than 200 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only');

export const createForumTopicSchema = z.object({
  category_id: z.string().uuid('Invalid category ID'),
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .regex(/^[a-zA-Z0-9\s\-_.,!?()]+$/, 'Title contains invalid characters'),
  slug: forumTopicSlugSchema,
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .max(10000, 'Content must be less than 10,000 characters'),
});

export type CreateForumTopicInput = z.infer<typeof createForumTopicSchema>;

export const updateForumTopicSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .regex(/^[a-zA-Z0-9\s\-_.,!?()]+$/, 'Title contains invalid characters')
    .optional(),
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .max(10000, 'Content must be less than 10,000 characters')
    .optional(),
});

export type UpdateForumTopicInput = z.infer<typeof updateForumTopicSchema>;

export const getForumTopicsSchema = z.object({
  category_id: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sort: z.enum(['newest', 'oldest', 'most_replies', 'most_views']).default('newest'),
  filter: z.enum(['all', 'unanswered', 'my_topics']).default('all'),
});

export type GetForumTopicsInput = z.infer<typeof getForumTopicsSchema>;

// ============================================================================
// Forum Post Schemas
// ============================================================================

export const createForumPostSchema = z.object({
  topic_id: z.string().uuid('Invalid topic ID'),
  content: z
    .string()
    .min(1, 'Post cannot be empty')
    .max(5000, 'Post must be less than 5,000 characters'),
  parent_post_id: z.string().uuid().optional().nullable(),
});

export type CreateForumPostInput = z.infer<typeof createForumPostSchema>;

export const updateForumPostSchema = z.object({
  content: z
    .string()
    .min(1, 'Post cannot be empty')
    .max(5000, 'Post must be less than 5,000 characters'),
});

export type UpdateForumPostInput = z.infer<typeof updateForumPostSchema>;

export const getForumPostsSchema = z.object({
  topic_id: z.string().uuid('Invalid topic ID'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['oldest', 'newest', 'most_liked']).default('oldest'),
});

export type GetForumPostsInput = z.infer<typeof getForumPostsSchema>;

// ============================================================================
// Moderation Schemas
// ============================================================================

export const pinTopicSchema = z.object({
  topic_id: z.string().uuid('Invalid topic ID'),
  is_pinned: z.boolean(),
});

export type PinTopicInput = z.infer<typeof pinTopicSchema>;

export const lockTopicSchema = z.object({
  topic_id: z.string().uuid('Invalid topic ID'),
  is_locked: z.boolean(),
});

export type LockTopicInput = z.infer<typeof lockTopicSchema>;

export const banUserSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason must be less than 500 characters'),
  ban_type: z.enum(['temporary', 'permanent']),
  expires_at: z.string().datetime().optional().nullable(),
});

export type BanUserInput = z.infer<typeof banUserSchema>;
