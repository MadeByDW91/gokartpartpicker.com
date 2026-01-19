'use server';

/**
 * Admin Reports server actions
 * Generate reports for missing data, quality checks, etc.
 */

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '../admin';
import { 
  type ActionResult, 
  success, 
  error 
} from '@/lib/api/types';
import type { AdminEngine, AdminPart } from '@/types/admin';

interface MissingDataReport {
  engines: {
    missingPrice: AdminEngine[];
    missingImage: AdminEngine[];
    missingAffiliate: AdminEngine[];
    missingNotes: AdminEngine[];
  };
  parts: {
    missingPrice: AdminPart[];
    missingImage: AdminPart[];
    missingAffiliate: AdminPart[];
    missingBrand: AdminPart[];
  };
}

/**
 * Get missing data report
 */
export async function getMissingDataReport(): Promise<ActionResult<MissingDataReport>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();

    // Fetch all engines
    const { data: engines, error: enginesError } = await supabase
      .from('engines')
      .select('*')
      .order('brand')
      .order('name');

    if (enginesError) {
      return error('Failed to fetch engines');
    }

    // Fetch all parts
    const { data: parts, error: partsError } = await supabase
      .from('parts')
      .select('*')
      .order('category')
      .order('name');

    if (partsError) {
      return error('Failed to fetch parts');
    }

    const report: MissingDataReport = {
      engines: {
        missingPrice: (engines as AdminEngine[]).filter(e => !e.price || e.price === 0),
        missingImage: (engines as AdminEngine[]).filter(e => !e.image_url),
        missingAffiliate: (engines as AdminEngine[]).filter(e => !e.affiliate_url),
        missingNotes: (engines as AdminEngine[]).filter(e => !e.notes || e.notes.trim() === ''),
      },
      parts: {
        missingPrice: (parts as AdminPart[]).filter(p => !p.price || p.price === 0),
        missingImage: (parts as AdminPart[]).filter(p => !p.image_url),
        missingAffiliate: (parts as AdminPart[]).filter(p => !p.affiliate_url),
        missingBrand: (parts as AdminPart[]).filter(p => !p.brand || p.brand.trim() === ''),
      },
    };

    return success(report);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to generate report');
  }
}

/**
 * Export missing data report to CSV
 */
export async function exportMissingDataReport(): Promise<ActionResult<string>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const reportResult = await getMissingDataReport();
    if (!reportResult.success || !reportResult.data) {
      return error('Failed to generate report');
    }

    const report = reportResult.data;
    const rows: string[] = [];

    // CSV Header
    rows.push('Type,Category,ID,Name,Missing Field');

    // Engine rows
    report.engines.missingPrice.forEach(e => {
      rows.push(`Engine,Price,${e.id},"${e.name.replace(/"/g, '""')}",Price`);
    });
    report.engines.missingImage.forEach(e => {
      rows.push(`Engine,Image,${e.id},"${e.name.replace(/"/g, '""')}",Image URL`);
    });
    report.engines.missingAffiliate.forEach(e => {
      rows.push(`Engine,Affiliate,${e.id},"${e.name.replace(/"/g, '""')}",Affiliate URL`);
    });
    report.engines.missingNotes.forEach(e => {
      rows.push(`Engine,Notes,${e.id},"${e.name.replace(/"/g, '""')}",Notes`);
    });

    // Part rows
    report.parts.missingPrice.forEach(p => {
      rows.push(`Part,Price,${p.id},"${p.name.replace(/"/g, '""')}",Price`);
    });
    report.parts.missingImage.forEach(p => {
      rows.push(`Part,Image,${p.id},"${p.name.replace(/"/g, '""')}",Image URL`);
    });
    report.parts.missingAffiliate.forEach(p => {
      rows.push(`Part,Affiliate,${p.id},"${p.name.replace(/"/g, '""')}",Affiliate URL`);
    });
    report.parts.missingBrand.forEach(p => {
      rows.push(`Part,Brand,${p.id},"${p.name.replace(/"/g, '""')}",Brand`);
    });

    const csv = rows.join('\n');
    return success(csv);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Export failed');
  }
}
