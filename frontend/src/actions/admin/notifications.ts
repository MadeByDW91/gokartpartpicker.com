'use server';

/**
 * Server actions for fetching admin notifications and warnings
 * Aggregates all types of notifications that need admin attention
 */

import { createClient } from '@/lib/supabase/server';
import { 
  type ActionResult, 
  success, 
  error, 
  handleError 
} from '@/lib/api/types';
import { requireAdmin } from '../admin';
import { isEmbeddableVideoUrl } from '@/lib/video-utils';

export interface AdminNotification {
  id: string;
  type: 'video_placeholders' | 'pending_approvals' | 'image_review' | 'security_alert' | 'missing_data';
  severity: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  count: number;
  href: string;
  actionLabel?: string;
}

export interface AdminNotifications {
  notifications: AdminNotification[];
  totalCount: number;
  hasErrors: boolean;
  hasWarnings: boolean;
}

/**
 * Get all admin notifications and warnings
 * Requires admin role
 */
export async function getAdminNotifications(): Promise<ActionResult<AdminNotifications>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<AdminNotifications>;
    }

    const supabase = await createClient();
    const notifications: AdminNotification[] = [];

    // 1. Video placeholder URLs
    const { count: placeholderCount } = await supabase
      .from('videos')
      .select('id', { count: 'exact', head: true })
      .or('video_url.is.null,video_url.ilike.%PLACEHOLDER%,video_url.ilike.%EXAMPLE%')
      .eq('is_active', true);

    if (placeholderCount && placeholderCount > 0) {
      notifications.push({
        id: 'video_placeholders',
        type: 'video_placeholders',
        severity: 'warning',
        title: 'Video Placeholder URLs',
        message: `${placeholderCount} video(s) have placeholder URLs and cannot display thumbnails.`,
        count: placeholderCount,
        href: '/admin/videos',
        actionLabel: 'Auto-fill URLs',
      });
    }

    // 2. Pending template approvals
    const { count: pendingApprovalsCount } = await supabase
      .from('builds')
      .select('id', { count: 'exact', head: true })
      .eq('is_template', true)
      .eq('approval_status', 'pending');

    if (pendingApprovalsCount && pendingApprovalsCount > 0) {
      notifications.push({
        id: 'pending_approvals',
        type: 'pending_approvals',
        severity: 'warning',
        title: 'Pending Template Approvals',
        message: `${pendingApprovalsCount} template(s) are waiting for approval.`,
        count: pendingApprovalsCount,
        href: '/admin/approvals',
        actionLabel: 'Review',
      });
    }

    // 3. Image review pending (if table exists)
    try {
      const { count: imageReviewCount, error: imageReviewError } = await supabase
        .from('image_review_queue')
        .select('id', { count: 'exact', head: true })
        .is('current_image_url', null)
        .not('suggested_image_url', 'is', null);

      // Only add if table exists and has pending items
      if (!imageReviewError && imageReviewCount && imageReviewCount > 0) {
        notifications.push({
          id: 'image_review',
          type: 'image_review',
          severity: 'info',
          title: 'Image Review Pending',
          message: `${imageReviewCount} image(s) are waiting for review.`,
          count: imageReviewCount,
          href: '/admin/images/review?filter=pending',
          actionLabel: 'Review',
        });
      }
    } catch (err) {
      // Table might not exist, ignore
      console.debug('[getAdminNotifications] image_review_queue table not found or error:', err);
    }

    // 4. Videos with missing thumbnails (but have real URLs)
    const { data: videosWithUrls } = await supabase
      .from('videos')
      .select('id, video_url, thumbnail_url')
      .eq('is_active', true)
      .is('thumbnail_url', null)
      .limit(1000);

    let missingThumbnailCount = 0;
    if (videosWithUrls) {
      missingThumbnailCount = videosWithUrls.filter(
        (v: any) => v.video_url && isEmbeddableVideoUrl(v.video_url)
      ).length;
    }

    if (missingThumbnailCount > 0) {
      notifications.push({
        id: 'missing_thumbnails',
        type: 'video_placeholders',
        severity: 'info',
        title: 'Missing Video Thumbnails',
        message: `${missingThumbnailCount} video(s) have real URLs but missing thumbnails.`,
        count: missingThumbnailCount,
        href: '/admin/videos',
        actionLabel: 'Auto-fill thumbnails',
      });
    }

    // 5. Security alerts (banned users, recent suspicious activity)
    // This could be expanded based on your security monitoring needs
    // Note: Commented out by default - uncomment if you want to show active bans
    // try {
    //   const { count: activeBansCount } = await supabase
    //     .from('user_bans')
    //     .select('id', { count: 'exact', head: true })
    //     .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());
    //
    //   if (activeBansCount && activeBansCount > 0) {
    //     notifications.push({
    //       id: 'security_bans',
    //       type: 'security_alert',
    //       severity: 'info',
    //       title: 'Active User Bans',
    //       message: `${activeBansCount} user(s) are currently banned.`,
    //       count: activeBansCount,
    //       href: '/admin/security/bans',
    //     });
    //   }
    // } catch (err) {
    //   // Table might not exist, ignore
    //   console.debug('[getAdminNotifications] user_bans table not found or error:', err);
    // }

    const totalCount = notifications.reduce((sum, n) => sum + n.count, 0);
    const hasErrors = notifications.some((n) => n.severity === 'error');
    const hasWarnings = notifications.some((n) => n.severity === 'warning');

    return success({
      notifications,
      totalCount,
      hasErrors,
      hasWarnings,
    });
  } catch (err) {
    return handleError(err, 'getAdminNotifications');
  }
}
