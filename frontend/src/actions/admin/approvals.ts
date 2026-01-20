'use server';

/**
 * Unified Approval Queue server actions
 * Consolidates all pending approvals in one place
 */

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '../admin';
import { 
  type ActionResult, 
  success, 
  error, 
  handleError 
} from '@/lib/api/types';
import type { BuildTemplate } from '@/types/database';

export type ApprovalType = 'template' | 'forum_post' | 'forum_topic' | 'build' | 'guide' | 'video';

export interface ApprovalItem {
  id: string;
  type: ApprovalType;
  title: string;
  description?: string | null;
  submittedBy?: {
    id: string;
    username: string | null;
    email: string | null;
    avatar_url: string | null;
  };
  submittedAt: string;
  priority?: 'low' | 'medium' | 'high';
  metadata?: Record<string, unknown>;
  // For templates
  template?: BuildTemplate;
}

/**
 * Get all pending approvals across all content types
 */
export async function getPendingApprovals(
  type?: ApprovalType
): Promise<ActionResult<ApprovalItem[]>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();
    const approvals: ApprovalItem[] = [];

    // Fetch pending templates
    if (!type || type === 'template') {
      const { data: templates, error: templatesError } = await supabase
        .from('build_templates')
        .select(`
          *,
          submitter:profiles!build_templates_submitted_by_fkey(id, username, email, avatar_url)
        `)
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (templatesError) {
        console.error('[getPendingApprovals] Templates error:', templatesError);
      } else if (templates) {
        approvals.push(...templates.map((template: any) => {
          const templateData = template as BuildTemplate;
          return {
            id: template.id,
            type: 'template' as const,
            title: template.name,
            description: template.description,
            submittedBy: template.submitter
              ? {
                  id: template.submitter.id,
                  username: template.submitter.username,
                  email: template.submitter.email,
                  avatar_url: template.submitter.avatar_url,
                }
              : undefined,
            submittedAt: template.created_at,
            priority: 'medium' as const,
            metadata: {
              goal: template.goal,
              engine_id: template.engine_id,
              parts_count: Object.keys(template.parts || {}).length,
            },
            template: templateData,
          };
        }));
      }
    }

    // TODO: Add forum flagged content when implemented
    // TODO: Add builds requiring review when criteria defined
    // TODO: Add guides/videos requiring approval when implemented

    return success(approvals);
  } catch (err) {
    return handleError(err, 'getPendingApprovals');
  }
}

/**
 * Get count of pending approvals (for badge)
 */
export async function getPendingApprovalsCount(): Promise<ActionResult<{
  total: number;
  byType: Record<ApprovalType, number>;
}>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();

    // Count pending templates
    const { count: templatesCount, error: templatesError } = await supabase
      .from('build_templates')
      .select('id', { count: 'exact', head: true })
      .eq('approval_status', 'pending');

    if (templatesError) {
      console.error('[getPendingApprovalsCount] Templates error:', templatesError);
    }

    const byType: Record<ApprovalType, number> = {
      template: templatesCount || 0,
      forum_post: 0, // TODO: Implement when forum flagging is added
      forum_topic: 0, // TODO: Implement when forum flagging is added
      build: 0, // TODO: Implement when build review criteria are defined
      guide: 0, // TODO: Implement when guide approval is added
      video: 0, // TODO: Implement when video approval is added
    };

    const total = Object.values(byType).reduce((sum, count) => sum + count, 0);

    return success({ total, byType });
  } catch (err) {
    return handleError(err, 'getPendingApprovalsCount');
  }
}

/**
 * Batch approve items
 */
export async function batchApprove(
  itemIds: string[],
  type: ApprovalType,
  reviewNotes?: string
): Promise<ActionResult<{ approved: number; failed: number }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }
    const { userId } = authResult as { userId: string };

    const supabase = await createClient();
    let approved = 0;
    let failed = 0;

    if (type === 'template') {
      for (const id of itemIds) {
        const { error } = await supabase
          .from('build_templates')
          .update({
            approval_status: 'approved',
            reviewed_by: userId,
            review_notes: reviewNotes || null,
            reviewed_at: new Date().toISOString(),
            is_public: true,
          })
          .eq('id', id)
          .eq('approval_status', 'pending');

        if (error) {
          console.error(`[batchApprove] Failed to approve template ${id}:`, error);
          failed++;
        } else {
          approved++;
        }
      }
    }

    // TODO: Add other types as they're implemented

    revalidatePath('/admin/approvals');
    revalidatePath('/admin/templates');
    revalidatePath('/templates');

    return success({ approved, failed });
  } catch (err) {
    return handleError(err, 'batchApprove');
  }
}

/**
 * Batch reject items
 */
export async function batchReject(
  itemIds: string[],
  type: ApprovalType,
  reviewNotes?: string
): Promise<ActionResult<{ rejected: number; failed: number }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }
    const { userId } = authResult as { userId: string };

    const supabase = await createClient();
    let rejected = 0;
    let failed = 0;

    if (type === 'template') {
      for (const id of itemIds) {
        const { error } = await supabase
          .from('build_templates')
          .update({
            approval_status: 'rejected',
            reviewed_by: userId,
            review_notes: reviewNotes || null,
            reviewed_at: new Date().toISOString(),
            is_public: false,
          })
          .eq('id', id)
          .eq('approval_status', 'pending');

        if (error) {
          console.error(`[batchReject] Failed to reject template ${id}:`, error);
          failed++;
        } else {
          rejected++;
        }
      }
    }

    // TODO: Add other types as they're implemented

    revalidatePath('/admin/approvals');
    revalidatePath('/admin/templates');
    revalidatePath('/templates');

    return success({ rejected, failed });
  } catch (err) {
    return handleError(err, 'batchReject');
  }
}

/**
 * Approve single item
 */
export async function approveItem(
  itemId: string,
  type: ApprovalType,
  reviewNotes?: string
): Promise<ActionResult<{ approved: true }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }
    const { userId } = authResult as { userId: string };

    const supabase = await createClient();

    if (type === 'template') {
      const { error } = await supabase
        .from('build_templates')
        .update({
          approval_status: 'approved',
          reviewed_by: userId,
          review_notes: reviewNotes || null,
          reviewed_at: new Date().toISOString(),
          is_public: true,
        })
        .eq('id', itemId)
        .eq('approval_status', 'pending');

      if (error) {
        return error('Failed to approve template');
      }
    } else {
      return error(`Approval for type "${type}" not yet implemented`);
    }

    revalidatePath('/admin/approvals');
    revalidatePath('/admin/templates');
    revalidatePath('/templates');

    return success({ approved: true });
  } catch (err) {
    return handleError(err, 'approveItem');
  }
}

/**
 * Reject single item
 */
export async function rejectItem(
  itemId: string,
  type: ApprovalType,
  reviewNotes?: string
): Promise<ActionResult<{ rejected: true }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }
    const { userId } = authResult as { userId: string };

    const supabase = await createClient();

    if (type === 'template') {
      const { error } = await supabase
        .from('build_templates')
        .update({
          approval_status: 'rejected',
          reviewed_by: userId,
          review_notes: reviewNotes || null,
          reviewed_at: new Date().toISOString(),
          is_public: false,
        })
        .eq('id', itemId)
        .eq('approval_status', 'pending');

      if (error) {
        return error('Failed to reject template');
      }
    } else {
      return error(`Rejection for type "${type}" not yet implemented`);
    }

    revalidatePath('/admin/approvals');
    revalidatePath('/admin/templates');
    revalidatePath('/templates');

    return success({ rejected: true });
  } catch (err) {
    return handleError(err, 'rejectItem');
  }
}
