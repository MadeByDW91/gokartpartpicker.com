'use server';

/**
 * Global Admin Search server actions
 * Search across all entities from one place
 * Phase 2: Rate limited (60 req/min per IP)
 */

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '../admin';
import { checkRateLimitByIp } from '@/lib/rate-limit';
import { getMotorBrandDisplay, getPartBrandDisplay } from '@/lib/utils';
import { 
  type ActionResult, 
  success, 
  error, 
  handleError 
} from '@/lib/api/types';

export type SearchEntityType = 'engine' | 'motor' | 'part' | 'build' | 'user' | 'template' | 'guide' | 'video' | 'forum_topic';

export interface SearchResult {
  id: string;
  type: SearchEntityType;
  title: string;
  description?: string | null;
  metadata?: Record<string, unknown>;
  url: string;
  status?: 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'published' | 'draft';
}

export interface SearchFilters {
  types?: SearchEntityType[];
  status?: string[];
  dateFrom?: string;
  dateTo?: string;
  category?: string;
}

/**
 * Global search across all entities
 */
export async function adminGlobalSearch(
  query: string,
  filters?: SearchFilters,
  limit: number = 20
): Promise<ActionResult<SearchResult[]>> {
  try {
    const rateLimit = await checkRateLimitByIp('expensive');
    if (!rateLimit.allowed) {
      return { success: false, error: rateLimit.error ?? 'Too many search requests. Please try again later.' };
    }

    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    if (!query || query.trim().length < 2) {
      return success([]);
    }

    const supabase = await createClient();
    const searchTerm = query.trim().toLowerCase();
    const results: SearchResult[] = [];
    const typeFilters = filters?.types || [
      'engine',
      'part',
      'build',
      'user',
      'template',
      'guide',
      'video',
      'forum_topic',
    ];

    // Search engines
    if (typeFilters.includes('engine')) {
      let engineQuery = supabase
        .from('engines')
        .select('id, name, slug, brand, is_active')
        .or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`)
        .limit(limit);

      if (filters?.status?.includes('active')) {
        engineQuery = engineQuery.eq('is_active', true);
      } else if (filters?.status?.includes('inactive')) {
        engineQuery = engineQuery.eq('is_active', false);
      }

      const { data: engines, error: enginesError } = await engineQuery;

      if (!enginesError && engines) {
        results.push(
          ...engines.map((engine: any) => ({
            id: engine.id,
            type: 'engine' as const,
            title: engine.name,
            description: `${engine.brand} engine`,
            metadata: { brand: engine.brand, slug: engine.slug },
            url: `/admin/engines/${engine.id}`,
            status: engine.is_active ? ('active' as const) : ('inactive' as const),
          }))
        );
      }
    }

    // Search electric motors
    if (typeFilters.includes('motor')) {
      let motorQuery = supabase
        .from('electric_motors')
        .select('id, name, slug, brand, voltage, is_active')
        .or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`)
        .limit(limit);

      if (filters?.status?.includes('active')) {
        motorQuery = motorQuery.eq('is_active', true);
      } else if (filters?.status?.includes('inactive')) {
        motorQuery = motorQuery.eq('is_active', false);
      }

      const { data: motors, error: motorsError } = await motorQuery;

      if (!motorsError && motors) {
        results.push(
          ...motors.map((motor: any) => ({
            id: motor.id,
            type: 'motor' as const,
            title: motor.name,
            description: `${getMotorBrandDisplay(motor.brand)} ${motor.voltage}V motor`,
            metadata: { brand: getMotorBrandDisplay(motor.brand), voltage: motor.voltage, slug: motor.slug },
            url: `/admin/motors/${motor.id}`,
            status: motor.is_active ? ('active' as const) : ('inactive' as const),
          }))
        );
      }
    }

    // Search electric motors
    if (typeFilters.includes('motor')) {
      let motorQuery = supabase
        .from('electric_motors')
        .select('id, name, slug, brand, voltage, is_active')
        .or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`)
        .limit(limit);

      if (filters?.status?.includes('active')) {
        motorQuery = motorQuery.eq('is_active', true);
      } else if (filters?.status?.includes('inactive')) {
        motorQuery = motorQuery.eq('is_active', false);
      }

      const { data: motors, error: motorsError } = await motorQuery;

      if (!motorsError && motors) {
        results.push(
          ...motors.map((motor: any) => ({
            id: motor.id,
            type: 'motor' as const,
            title: motor.name,
            description: `${getMotorBrandDisplay(motor.brand)} ${motor.voltage}V motor`,
            metadata: { brand: getMotorBrandDisplay(motor.brand), voltage: motor.voltage, slug: motor.slug },
            url: `/admin/motors/${motor.id}`,
            status: motor.is_active ? ('active' as const) : ('inactive' as const),
          }))
        );
      }
    }

    // Search parts
    if (typeFilters.includes('part')) {
      let partQuery = supabase
        .from('parts')
        .select('id, name, slug, brand, category, is_active')
        .or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`)
        .limit(limit);

      if (filters?.status?.includes('active')) {
        partQuery = partQuery.eq('is_active', true);
      } else if (filters?.status?.includes('inactive')) {
        partQuery = partQuery.eq('is_active', false);
      }

      if (filters?.category) {
        partQuery = partQuery.eq('category', filters.category);
      }

      const { data: parts, error: partsError } = await partQuery;

      if (!partsError && parts) {
        results.push(
          ...parts.map((part: any) => ({
            id: part.id,
            type: 'part' as const,
            title: part.name,
            description: `${getPartBrandDisplay(part.brand)} • ${part.category}`,
            metadata: { brand: getPartBrandDisplay(part.brand), category: part.category, slug: part.slug },
            url: `/admin/parts/${part.id}`,
            status: part.is_active ? ('active' as const) : ('inactive' as const),
          }))
        );
      }
    }

    // Search builds
    if (typeFilters.includes('build')) {
      let buildQuery = supabase
        .from('builds')
        .select('id, name, description, is_public, created_at')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(limit);

      if (filters?.status?.includes('published') || filters?.status?.includes('active')) {
        buildQuery = buildQuery.eq('is_public', true);
      } else if (filters?.status?.includes('draft') || filters?.status?.includes('inactive')) {
        buildQuery = buildQuery.eq('is_public', false);
      }

      const { data: builds, error: buildsError } = await buildQuery;

      if (!buildsError && builds) {
        results.push(
          ...builds.map((build: any) => ({
            id: build.id,
            type: 'build' as const,
            title: build.name,
            description: build.description || null,
            metadata: { is_public: build.is_public },
            url: `/admin/builds?build=${build.id}`,
            status: build.is_public ? ('active' as const) : ('inactive' as const),
          }))
        );
      }
    }

    // Search users
    if (typeFilters.includes('user')) {
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, username, email, role')
        .or(`username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(limit);

      if (!usersError && users) {
        results.push(
          ...users.map((user: any) => ({
            id: user.id,
            type: 'user' as const,
            title: user.username || user.email || 'No name',
            description: user.email || `Role: ${user.role}`,
            metadata: { username: user.username, email: user.email, role: user.role },
            url: `/admin/users/${user.id}`,
            status: undefined,
          }))
        );
      }
    }

    // Search templates
    if (typeFilters.includes('template')) {
      let templateQuery = supabase
        .from('build_templates')
        .select('id, name, description, approval_status, goal, is_active')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(limit);

      if (filters?.status?.includes('approved')) {
        templateQuery = templateQuery.eq('approval_status', 'approved');
      } else if (filters?.status?.includes('pending')) {
        templateQuery = templateQuery.eq('approval_status', 'pending');
      } else if (filters?.status?.includes('rejected')) {
        templateQuery = templateQuery.eq('approval_status', 'rejected');
      }

      const { data: templates, error: templatesError } = await templateQuery;

      if (!templatesError && templates) {
        results.push(
          ...templates.map((template: any) => ({
            id: template.id,
            type: 'template' as const,
            title: template.name,
            description: template.description || null,
            metadata: { goal: template.goal, approval_status: template.approval_status },
            url: `/admin/templates/${template.id}`,
            status: template.approval_status === 'approved'
              ? ('approved' as const)
              : template.approval_status === 'pending'
              ? ('pending' as const)
              : ('rejected' as const),
          }))
        );
      }
    }

    // Search guides (content with type='guide')
    if (typeFilters.includes('guide')) {
      let guideQuery = supabase
        .from('content')
        .select('id, title, excerpt, slug, is_published, content_type')
        .eq('content_type', 'guide')
        .or(`title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`)
        .limit(limit);

      if (filters?.status?.includes('published')) {
        guideQuery = guideQuery.eq('is_published', true);
      } else if (filters?.status?.includes('draft')) {
        guideQuery = guideQuery.eq('is_published', false);
      }

      const { data: guides, error: guidesError } = await guideQuery;

      if (!guidesError && guides) {
        results.push(
          ...guides.map((guide: any) => ({
            id: guide.id,
            type: 'guide' as const,
            title: guide.title,
            description: guide.excerpt || null,
            metadata: { slug: guide.slug, content_type: guide.content_type },
            url: `/admin/guides/${guide.id}`,
            status: guide.is_published ? ('published' as const) : ('draft' as const),
          }))
        );
      }
    }

    // Search videos
    if (typeFilters.includes('video')) {
      let videoQuery = supabase
        .from('videos')
        .select('id, title, description, slug, is_active')
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`)
        .limit(limit);

      if (filters?.status?.includes('active')) {
        videoQuery = videoQuery.eq('is_active', true);
      } else if (filters?.status?.includes('inactive')) {
        videoQuery = videoQuery.eq('is_active', false);
      }

      const { data: videos, error: videosError } = await videoQuery;

      if (!videosError && videos) {
        results.push(
          ...videos.map((video: any) => ({
            id: video.id,
            type: 'video' as const,
            title: video.title,
            description: video.description || null,
            metadata: { slug: video.slug },
            url: `/admin/videos/${video.id}`,
            status: video.is_active ? ('active' as const) : ('inactive' as const),
          }))
        );
      }
    }

    // Search forum topics
    if (typeFilters.includes('forum_topic')) {
      const { data: topics, error: topicsError } = await supabase
        .from('forum_topics')
        .select('id, title, slug, category_id, created_at')
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`)
        .limit(limit);

      if (!topicsError && topics) {
        results.push(
          ...topics.map((topic: any) => ({
            id: topic.id,
            type: 'forum_topic' as const,
            title: topic.title,
            description: `Forum topic`,
            metadata: { slug: topic.slug, category_id: topic.category_id },
            url: `/admin/forums/topics/${topic.id}`,
            status: undefined,
          }))
        );
      }
    }

    // Sort by relevance (simple: exact match first, then partial)
    results.sort((a, b) => {
      const aExact = a.title.toLowerCase() === searchTerm || a.title.toLowerCase().startsWith(searchTerm);
      const bExact = b.title.toLowerCase() === searchTerm || b.title.toLowerCase().startsWith(searchTerm);
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    // Limit total results
    return success(results.slice(0, limit));
  } catch (err) {
    return handleError(err, 'adminGlobalSearch');
  }
}
