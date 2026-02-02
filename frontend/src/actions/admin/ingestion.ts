'use server';

/**
 * Product Ingestion server actions
 * Handles staged product imports with admin approval workflow
 */

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '../admin';
import { 
  type ActionResult, 
  success, 
  error 
} from '@/lib/api/types';
import { slugify } from '@/lib/utils';
import type { 
  ImportJob, 
  ImportRawRecord, 
  PartProposal, 
  CompatibilityProposal, 
  LinkCandidate,
  ReviewQueueItem,
  IngestionResult,
  ImportJobDetails,
  PartProposalDetail,
  BulkPublishResult
} from '@/types/admin';

// ============================================================================
// CSV Parsing (reused from import.ts pattern)
// ============================================================================

interface CSVRow {
  [key: string]: string;
}

function parseCSV(csvText: string): CSVRow[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  return lines.slice(1).map((line) => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: CSVRow = {};
    headers.forEach((header, i) => {
      row[header] = values[i] || '';
    });
    return row;
  });
}

// ============================================================================
// Import & Ingestion
// ============================================================================

/**
 * Create a new import job
 */
export async function createImportJob(
  name: string,
  sourceType: string,
  sourceFile?: string
): Promise<ActionResult<ImportJob>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }
    const { userId } = authResult as { userId: string };

    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from('import_jobs')
      .insert({
        name,
        source_type: sourceType,
        source_file: sourceFile || null,
        status: 'ingesting',
        created_by: userId,
      })
      .select()
      .single();

    if (dbError || !data) {
      return error(dbError?.message || 'Failed to create import job');
    }

    revalidatePath('/admin/ingestion');
    return success(data as ImportJob);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to create import job');
  }
}

/**
 * Ingest CSV data into raw records
 */
export async function ingestCSV(
  csvText: string,
  importJobId: string
): Promise<ActionResult<IngestionResult>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const rows = parseCSV(csvText);
    const supabase = await createClient();

    // Verify job exists and belongs to user
    const { data: job } = await supabase
      .from('import_jobs')
      .select('id, created_by')
      .eq('id', importJobId)
      .single();

    if (!job) {
      return error('Import job not found');
    }

    // Insert raw records
    const rawRecords = rows.map((row, index) => ({
      import_job_id: importJobId,
      row_number: index + 1,
      raw_data: row as unknown as Record<string, unknown>,
      status: 'pending',
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('import_raw_records')
      .insert(rawRecords)
      .select();

    if (insertError) {
      return error(insertError.message);
    }

    // Update job with total rows
    await supabase
      .from('import_jobs')
      .update({
        total_rows: rows.length,
        processed_rows: 0,
      })
      .eq('id', importJobId);

    revalidatePath(`/admin/ingestion/${importJobId}`);
    return success({
      totalRows: rows.length,
      processedRows: inserted?.length || 0,
      errors: [],
    });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to ingest CSV');
  }
}

/**
 * Ingest JSON data into raw records
 */
export async function ingestJSON(
  data: Array<Record<string, unknown>>,
  importJobId: string
): Promise<ActionResult<IngestionResult>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();

    // Verify job exists
    const { data: job } = await supabase
      .from('import_jobs')
      .select('id')
      .eq('id', importJobId)
      .single();

    if (!job) {
      return error('Import job not found');
    }

    // Insert raw records
    const rawRecords = data.map((row, index) => ({
      import_job_id: importJobId,
      row_number: index + 1,
      raw_data: row,
      status: 'pending',
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('import_raw_records')
      .insert(rawRecords)
      .select();

    if (insertError) {
      return error(insertError.message);
    }

    // Update job
    await supabase
      .from('import_jobs')
      .update({
        total_rows: data.length,
        processed_rows: 0,
      })
      .eq('id', importJobId);

    revalidatePath(`/admin/ingestion/${importJobId}`);
    return success({
      totalRows: data.length,
      processedRows: inserted?.length || 0,
      errors: [],
    });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to ingest JSON');
  }
}

// ============================================================================
// Proposal Generation
// ============================================================================

/**
 * Generate part proposals from raw records
 */
export async function generatePartProposals(
  importJobId: string
): Promise<ActionResult<{ generated: number }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();

    // Get pending raw records
    const { data: rawRecords, error: recordsError } = await supabase
      .from('import_raw_records')
      .select('*')
      .eq('import_job_id', importJobId)
      .eq('status', 'pending');

    if (recordsError || !rawRecords || rawRecords.length === 0) {
      return success({ generated: 0 });
    }

    // Get all existing parts for matching
    const { data: existingParts } = await supabase
      .from('parts')
      .select('id, name, brand, slug');

    type PartForMatching = { id: string; name: string; brand: string | null; slug: string };
    const partsMap = new Map<string, PartForMatching>(
      (existingParts || []).map((p: PartForMatching) => [p.slug, p])
    );

    const proposals: Array<{
      import_job_id: string;
      raw_record_id: string;
      proposed_data: Record<string, unknown>;
      proposed_part_id?: string;
      match_confidence?: number;
      match_reason?: string;
      status: string;
    }> = [];

    for (const record of rawRecords) {
      const rawData = record.raw_data as Record<string, unknown>;
      const name = String(rawData.name || '');
      const brand = String(rawData.brand || '');

      if (!name) {
        // Mark record as error
        await supabase
          .from('import_raw_records')
          .update({
            status: 'error',
            error_message: 'Missing required field: name',
          })
          .eq('id', record.id);
        continue;
      }

      const slug = slugify(name);
      const proposedData = {
        ...rawData,
        slug,
        name,
        brand: brand || null,
      };

      // Try to match existing part
      let proposedPartId: string | undefined;
      let matchConfidence: number | undefined;
      let matchReason: string | undefined;

      const existingPart = partsMap.get(slug);
      if (existingPart) {
        proposedPartId = existingPart.id;
        matchConfidence = 1.0;
        matchReason = 'Exact slug match';
      } else {
        // Fuzzy matching on name and brand
        for (const [partSlug, part] of partsMap.entries()) {
          const partData = part as any;
          const partName = partData.name.toLowerCase();
          const partBrand = (partData.brand || '').toLowerCase();
          const recordName = name.toLowerCase();
          const recordBrand = brand.toLowerCase();

          if (partName === recordName && partBrand === recordBrand) {
            proposedPartId = part.id;
            matchConfidence = 0.95;
            matchReason = 'Name and brand match';
            break;
          } else if (partName === recordName) {
            proposedPartId = part.id;
            matchConfidence = 0.8;
            matchReason = 'Name match';
            break;
          }
        }
      }

      proposals.push({
        import_job_id: importJobId,
        raw_record_id: record.id,
        proposed_data: proposedData,
        proposed_part_id: proposedPartId,
        match_confidence: matchConfidence,
        match_reason: matchReason,
        status: 'proposed',
      });

      // Mark record as processed
      await supabase
        .from('import_raw_records')
        .update({ status: 'processed' })
        .eq('id', record.id);
    }

    if (proposals.length === 0) {
      return success({ generated: 0 });
    }

    // Insert proposals
    const { data: inserted, error: insertError } = await supabase
      .from('part_proposals')
      .insert(proposals)
      .select();

    if (insertError) {
      return error(insertError.message);
    }

    // Auto-create link candidates for proposals with affiliate URLs (Amazon imports)
    if (inserted && inserted.length > 0) {
      const linkCandidates: Array<{
        part_proposal_id: string;
        link_type: string;
        url: string;
        vendor_name: string;
        price?: number;
        generated_by: string;
        status: string;
      }> = [];

      for (const proposal of inserted) {
        const proposedData = proposal.proposed_data as Record<string, unknown>;
        const affiliateUrl = String(proposedData.affiliate_url || proposedData.amazon_url || '');
        const asin = String(proposedData.asin || '');

        if (affiliateUrl && affiliateUrl.includes('amazon.com')) {
          // Auto-approve Amazon affiliate links from imports
          linkCandidates.push({
            part_proposal_id: proposal.id,
            link_type: affiliateUrl.includes('tag=') ? 'amazon_affiliate' : 'non_affiliate',
            url: affiliateUrl,
            vendor_name: 'Amazon',
            price: proposedData.price ? Number(proposedData.price) : undefined,
            generated_by: 'automated',
            status: 'approved', // Auto-approve for Amazon imports
          });
        } else if (asin) {
          // Generate affiliate link from ASIN
          const affiliateTag = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG;
          const url = affiliateTag
            ? `https://www.amazon.com/dp/${asin}?tag=${affiliateTag}`
            : `https://www.amazon.com/dp/${asin}`;
          linkCandidates.push({
            part_proposal_id: proposal.id,
            link_type: affiliateTag ? 'amazon_affiliate' : 'non_affiliate',
            url,
            vendor_name: 'Amazon',
            price: proposedData.price ? Number(proposedData.price) : undefined,
            generated_by: 'automated',
            status: 'approved', // Auto-approve for Amazon imports
          });
        }
      }

      if (linkCandidates.length > 0) {
        await supabase
          .from('link_candidates')
          .insert(linkCandidates);
      }
    }

    // Update job processed count
    await supabase
      .from('import_jobs')
      .update({
        processed_rows: rawRecords.length,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', importJobId);

    revalidatePath(`/admin/ingestion/${importJobId}`);
    revalidatePath('/admin/ingestion/review');
    return success({ generated: inserted?.length || 0 });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to generate proposals');
  }
}

/**
 * Generate compatibility proposals for a part proposal
 */
export async function generateCompatibilityProposals(
  partProposalId: string
): Promise<ActionResult<{ generated: number }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();

    // Get part proposal
    const { data: proposal } = await supabase
      .from('part_proposals')
      .select('*')
      .eq('id', partProposalId)
      .single();

    if (!proposal) {
      return error('Part proposal not found');
    }

    const proposedData = proposal.proposed_data as Record<string, unknown>;
    const category = String(proposedData.category || '');

    // Get all active engines
    const { data: engines } = await supabase
      .from('engines')
      .select('id, shaft_diameter, displacement_cc')
      .eq('is_active', true);

    if (!engines || engines.length === 0) {
      return success({ generated: 0 });
    }

    const compatibilityProposals: Array<{
      part_proposal_id: string;
      engine_id: string;
      compatibility_level: string;
      status: string;
    }> = [];

    // Simple compatibility logic based on category
    // This is a basic implementation - can be enhanced with more sophisticated matching
    for (const engine of engines) {
      let compatibilityLevel = 'direct_fit';
      let notes: string | undefined;

      // Example: Clutches need to match shaft diameter
      if (category === 'clutch') {
        const clutchShaftDiameter = Number(proposedData.shaft_diameter || 0);
        if (clutchShaftDiameter && engine.shaft_diameter) {
          if (Math.abs(clutchShaftDiameter - engine.shaft_diameter) > 0.01) {
            compatibilityLevel = 'requires_modification';
            notes = `Shaft diameter mismatch: clutch ${clutchShaftDiameter}" vs engine ${engine.shaft_diameter}"`;
          }
        }
      }

      compatibilityProposals.push({
        part_proposal_id: partProposalId,
        engine_id: engine.id,
        compatibility_level: compatibilityLevel,
        status: 'proposed',
      });
    }

    if (compatibilityProposals.length === 0) {
      return success({ generated: 0 });
    }

    const { data: inserted, error: insertError } = await supabase
      .from('compatibility_proposals')
      .insert(compatibilityProposals)
      .select();

    if (insertError) {
      return error(insertError.message);
    }

    revalidatePath(`/admin/ingestion/proposals/${partProposalId}`);
    return success({ generated: inserted?.length || 0 });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to generate compatibility proposals');
  }
}

/**
 * Generate link candidates for a part proposal
 */
export async function generateLinkCandidates(
  partProposalId: string,
  partId?: string
): Promise<ActionResult<{ generated: number }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();

    // Get part proposal
    const { data: proposal } = await supabase
      .from('part_proposals')
      .select('*, import_jobs!inner(*)')
      .eq('id', partProposalId)
      .single();

    if (!proposal) {
      return error('Part proposal not found');
    }

    const proposedData = proposal.proposed_data as Record<string, unknown>;
    const candidates: Array<{
      part_proposal_id?: string;
      part_id?: string;
      link_type: string;
      url: string;
      vendor_name?: string;
      price?: number;
      generated_by: string;
      status: string;
    }> = [];

    // Check for Amazon ASIN or URL
    const asin = String(proposedData.asin || proposedData.amazon_asin || '');
    const amazonUrl = String(proposedData.amazon_url || proposedData.affiliate_url || '');
    const affiliateTag = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG;

    if (asin) {
      const url = affiliateTag
        ? `https://www.amazon.com/dp/${asin}?tag=${affiliateTag}`
        : `https://www.amazon.com/dp/${asin}`;
      candidates.push({
        part_proposal_id: partProposalId,
        part_id: partId,
        link_type: affiliateTag ? 'amazon_affiliate' : 'non_affiliate',
        url,
        vendor_name: 'Amazon',
        price: proposedData.price ? Number(proposedData.price) : undefined,
        generated_by: 'automated',
        status: 'candidate',
      });
    } else if (amazonUrl) {
      const url = affiliateTag && !amazonUrl.includes('tag=')
        ? `${amazonUrl}${amazonUrl.includes('?') ? '&' : '?'}tag=${affiliateTag}`
        : amazonUrl;
      candidates.push({
        part_proposal_id: partProposalId,
        part_id: partId,
        link_type: affiliateTag ? 'amazon_affiliate' : 'non_affiliate',
        url,
        vendor_name: 'Amazon',
        price: proposedData.price ? Number(proposedData.price) : undefined,
        generated_by: 'automated',
        status: 'candidate',
      });
    }

    // Check for eBay URL
    const ebayUrl = String(proposedData.ebay_url || '');
    if (ebayUrl) {
      candidates.push({
        part_proposal_id: partProposalId,
        part_id: partId,
        link_type: 'non_affiliate', // Can be enhanced with eBay affiliate
        url: ebayUrl,
        vendor_name: 'eBay',
        price: proposedData.price ? Number(proposedData.price) : undefined,
        generated_by: 'automated',
        status: 'candidate',
      });
    }

    // Check for other URLs
    const otherUrl = String(proposedData.url || proposedData.product_url || '');
    if (otherUrl && !otherUrl.includes('amazon.com') && !otherUrl.includes('ebay.com')) {
      candidates.push({
        part_proposal_id: partProposalId,
        part_id: partId,
        link_type: 'non_affiliate',
        url: otherUrl,
        vendor_name: String(proposedData.vendor || ''),
        price: proposedData.price ? Number(proposedData.price) : undefined,
        generated_by: 'automated',
        status: 'candidate',
      });
    }

    if (candidates.length === 0) {
      return success({ generated: 0 });
    }

    const { data: inserted, error: insertError } = await supabase
      .from('link_candidates')
      .insert(candidates)
      .select();

    if (insertError) {
      return error(insertError.message);
    }

    revalidatePath(`/admin/ingestion/proposals/${partProposalId}`);
    return success({ generated: inserted?.length || 0 });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to generate link candidates');
  }
}

// ============================================================================
// Review & Approval
// ============================================================================

/**
 * Get review queue with filters
 */
export async function getReviewQueue(
  filters?: {
    status?: 'proposed' | 'approved' | 'rejected';
    importJobId?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<ActionResult<ReviewQueueItem[]>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();

    let query = supabase
      .from('part_proposals')
      .select(`
        *,
        import_jobs!inner(name, source_type, created_at),
        raw_records:import_raw_records(row_number)
      `);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.importJobId) {
      query = query.eq('import_job_id', filters.importJobId);
    }
    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error: dbError } = await query;

    if (dbError) {
      return error(dbError.message);
    }

    // Filter by category if provided
    let results = (data || []) as ReviewQueueItem[];
    if (filters?.category) {
      results = results.filter(item => {
        const proposedData = item.proposed_data as Record<string, unknown>;
        return String(proposedData.category || '') === filters.category;
      });
    }

    return success(results);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to fetch review queue');
  }
}

/**
 * Get a single part proposal with details
 */
export async function getPartProposal(
  proposalId: string
): Promise<ActionResult<PartProposalDetail>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from('part_proposals')
      .select(`
        *,
        import_jobs!inner(*),
        raw_records:import_raw_records(*),
        proposed_part:parts(*),
        compatibility_proposals(*, engines(*)),
        link_candidates(*)
      `)
      .eq('id', proposalId)
      .single();

    if (dbError || !data) {
      return error(dbError?.message || 'Part proposal not found');
    }

    return success(data as PartProposalDetail);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to fetch part proposal');
  }
}

/**
 * Approve a part proposal
 */
export async function approvePartProposal(
  proposalId: string,
  notes?: string
): Promise<ActionResult<PartProposal>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }
    const { userId } = authResult as { userId: string };

    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from('part_proposals')
      .update({
        status: 'approved',
        reviewed_by: userId,
        review_notes: notes || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', proposalId)
      .select()
      .single();

    if (dbError || !data) {
      return error(dbError?.message || 'Failed to approve proposal');
    }

    revalidatePath(`/admin/ingestion/proposals/${proposalId}`);
    revalidatePath('/admin/ingestion/review');
    return success(data as PartProposal);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to approve proposal');
  }
}

/**
 * Reject a part proposal
 */
export async function rejectPartProposal(
  proposalId: string,
  notes: string
): Promise<ActionResult<PartProposal>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }
    const { userId } = authResult as { userId: string };

    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from('part_proposals')
      .update({
        status: 'rejected',
        reviewed_by: userId,
        review_notes: notes,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', proposalId)
      .select()
      .single();

    if (dbError || !data) {
      return error(dbError?.message || 'Failed to reject proposal');
    }

    revalidatePath(`/admin/ingestion/proposals/${proposalId}`);
    revalidatePath('/admin/ingestion/review');
    return success(data as PartProposal);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to reject proposal');
  }
}

/**
 * Approve a compatibility proposal
 */
export async function approveCompatibilityProposal(
  proposalId: string,
  notes?: string
): Promise<ActionResult<CompatibilityProposal>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }
    const { userId } = authResult as { userId: string };

    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from('compatibility_proposals')
      .update({
        status: 'approved',
        reviewed_by: userId,
        review_notes: notes || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', proposalId)
      .select()
      .single();

    if (dbError || !data) {
      return error(dbError?.message || 'Failed to approve compatibility proposal');
    }

    return success(data as CompatibilityProposal);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to approve compatibility proposal');
  }
}

/**
 * Reject a compatibility proposal
 */
export async function rejectCompatibilityProposal(
  proposalId: string,
  notes: string
): Promise<ActionResult<CompatibilityProposal>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }
    const { userId } = authResult as { userId: string };

    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from('compatibility_proposals')
      .update({
        status: 'rejected',
        reviewed_by: userId,
        review_notes: notes,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', proposalId)
      .select()
      .single();

    if (dbError || !data) {
      return error(dbError?.message || 'Failed to reject compatibility proposal');
    }

    return success(data as CompatibilityProposal);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to reject compatibility proposal');
  }
}

/**
 * Approve a link candidate
 */
export async function approveLinkCandidate(
  candidateId: string,
  notes?: string
): Promise<ActionResult<LinkCandidate>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }
    const { userId } = authResult as { userId: string };

    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from('link_candidates')
      .update({
        status: 'approved',
        reviewed_by: userId,
        review_notes: notes || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', candidateId)
      .select()
      .single();

    if (dbError || !data) {
      return error(dbError?.message || 'Failed to approve link candidate');
    }

    return success(data as LinkCandidate);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to approve link candidate');
  }
}

/**
 * Reject a link candidate
 */
export async function rejectLinkCandidate(
  candidateId: string,
  notes: string
): Promise<ActionResult<LinkCandidate>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }
    const { userId } = authResult as { userId: string };

    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from('link_candidates')
      .update({
        status: 'rejected',
        reviewed_by: userId,
        review_notes: notes,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', candidateId)
      .select()
      .single();

    if (dbError || !data) {
      return error(dbError?.message || 'Failed to reject link candidate');
    }

    return success(data as LinkCandidate);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to reject link candidate');
  }
}

// ============================================================================
// Publishing
// ============================================================================

/**
 * Publish a part proposal to production
 */
export async function publishPartProposal(
  proposalId: string
): Promise<ActionResult<{ partId: string }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }
    const { userId } = authResult as { userId: string };

    const supabase = await createClient();

    // Get proposal
    const { data: proposal, error: proposalError } = await supabase
      .from('part_proposals')
      .select('*')
      .eq('id', proposalId)
      .single();

    if (proposalError || !proposal) {
      return error(proposalError?.message || 'Part proposal not found');
    }

    if (proposal.status !== 'approved') {
      return error('Only approved proposals can be published');
    }

    const proposedData = proposal.proposed_data as Record<string, unknown>;

    // Create or update part
    let partId: string;
    if (proposal.proposed_part_id) {
      // Update existing part
      const { data: updated, error: updateError } = await supabase
        .from('parts')
        .update({
          name: String(proposedData.name || ''),
          category: proposedData.category as string,
          brand: proposedData.brand ? String(proposedData.brand) : null,
          specifications: proposedData.specifications || {},
          price: proposedData.price ? Number(proposedData.price) : null,
          image_url: proposedData.image_url ? String(proposedData.image_url) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', proposal.proposed_part_id)
        .select()
        .single();

      if (updateError || !updated) {
        return error(updateError?.message || 'Failed to update part');
      }
      partId = updated.id;
    } else {
      // Create new part
      const { data: created, error: createError } = await supabase
        .from('parts')
        .insert({
          slug: String(proposedData.slug || slugify(String(proposedData.name || ''))),
          name: String(proposedData.name || ''),
          category: proposedData.category as string,
          brand: proposedData.brand ? String(proposedData.brand) : null,
          specifications: proposedData.specifications || {},
          price: proposedData.price ? Number(proposedData.price) : null,
          image_url: proposedData.image_url ? String(proposedData.image_url) : null,
          created_by: userId,
        })
        .select()
        .single();

      if (createError || !created) {
        return error(createError?.message || 'Failed to create part');
      }
      partId = created.id;
    }

    // Get approved compatibility proposals and publish them
    const { data: compatibilityProposals } = await supabase
      .from('compatibility_proposals')
      .select('*')
      .eq('part_proposal_id', proposalId)
      .eq('status', 'approved');

    if (compatibilityProposals && compatibilityProposals.length > 0) {
      const compatibilities = compatibilityProposals.map((cp: CompatibilityProposal) => ({
        engine_id: cp.engine_id,
        part_id: partId,
        compatibility_level: cp.compatibility_level,
        notes: cp.notes || null,
        created_by: userId,
      }));

      // Remove existing compatibilities for this part
      await supabase
        .from('engine_part_compatibility')
        .delete()
        .eq('part_id', partId);

      // Insert new compatibilities
      await supabase
        .from('engine_part_compatibility')
        .insert(compatibilities);
    }

    // Get approved link candidate and update part affiliate_url
    const { data: approvedLink } = await supabase
      .from('link_candidates')
      .select('*')
      .eq('part_proposal_id', proposalId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (approvedLink) {
      await supabase
        .from('parts')
        .update({ affiliate_url: approvedLink.url })
        .eq('id', partId);
    }

    // Update proposal status
    await supabase
      .from('part_proposals')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', proposalId);

    // Create audit log entry
    await supabase
      .from('audit_log')
      .insert({
        user_id: userId,
        action: proposal.proposed_part_id ? 'update' : 'create',
        table_name: 'parts',
        record_id: partId,
        old_data: proposal.proposed_part_id ? { id: proposal.proposed_part_id } : null,
        new_data: proposedData,
      });

    revalidatePath('/parts');
    revalidatePath(`/admin/ingestion/proposals/${proposalId}`);
    revalidatePath('/admin/ingestion/review');
    return success({ partId });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to publish proposal');
  }
}

/**
 * Bulk publish multiple proposals
 */
export async function bulkPublishProposals(
  proposalIds: string[]
): Promise<ActionResult<BulkPublishResult>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const results: BulkPublishResult = {
      published: [],
      failed: [],
    };

    for (const proposalId of proposalIds) {
      const result = await publishPartProposal(proposalId);
      if (result.success) {
        results.published.push({
          proposalId,
          partId: result.data.partId,
        });
      } else {
        results.failed.push({
          proposalId,
          error: result.error,
        });
      }
    }

    return success(results);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to bulk publish');
  }
}

// ============================================================================
// Query & Status
// ============================================================================

/**
 * Get import jobs with filters
 */
export async function getImportJobs(filters?: {
  status?: string;
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<ActionResult<ImportJob[]>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();

    let query = supabase
      .from('import_jobs')
      .select('*, created_by_profile:profiles!import_jobs_created_by_fkey(username, email)')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.createdBy) {
      query = query.eq('created_by', filters.createdBy);
    }
    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    const { data, error: dbError } = await query;

    if (dbError) {
      return error(dbError.message);
    }

    return success((data || []) as ImportJob[]);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to fetch import jobs');
  }
}

/**
 * Get import job details
 */
export async function getImportJobDetails(
  jobId: string
): Promise<ActionResult<ImportJobDetails>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from('import_jobs')
      .select(`
        *,
        created_by_profile:profiles!import_jobs_created_by_fkey(*),
        raw_records:import_raw_records(*),
        part_proposals(*)
      `)
      .eq('id', jobId)
      .single();

    if (dbError || !data) {
      return error(dbError?.message || 'Import job not found');
    }

    return success(data as ImportJobDetails);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to fetch import job details');
  }
}

/**
 * Get part proposals for a job
 */
export async function getPartProposalsForJob(
  jobId: string
): Promise<ActionResult<PartProposal[]>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from('part_proposals')
      .select('*')
      .eq('import_job_id', jobId)
      .order('created_at', { ascending: false });

    if (dbError) {
      return error(dbError.message);
    }

    return success((data || []) as PartProposal[]);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to fetch part proposals');
  }
}
