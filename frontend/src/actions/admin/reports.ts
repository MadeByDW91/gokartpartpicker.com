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
import type { AdminEngine, AdminPart, AdminElectricMotor } from '@/types/admin';

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

// ============================================================================
// Data Quality Scoring
// ============================================================================

export interface DataQualityScore {
  entityType: 'engine' | 'motor' | 'part';
  entityId: string;
  entityName: string;
  score: number; // 0-100
  issues: Array<{
    field: string;
    severity: 'critical' | 'warning' | 'info';
    message: string;
  }>;
  completeness: number; // 0-1
}

export interface DataQualityReport {
  overallScore: number; // 0-100
  categoryScores: {
    engines: number;
    motors: number;
    parts: number;
  };
  itemScores: DataQualityScore[];
  summary: {
    totalItems: number;
    itemsWithIssues: number;
    criticalIssues: number;
    warnings: number;
  };
  topIssues: Array<{
    field: string;
    count: number;
    severity: 'critical' | 'warning' | 'info';
  }>;
}

/**
 * Calculate data quality score for a single item
 */
function calculateItemScore(
  item: AdminEngine | AdminElectricMotor | AdminPart,
  type: 'engine' | 'motor' | 'part'
): DataQualityScore {
  const issues: DataQualityScore['issues'] = [];
  let completeness = 0;
  const maxCompleteness = type === 'part' ? 6 : type === 'motor' ? 8 : 7;

  // Required fields
  if (!item.name || item.name.trim() === '') {
    issues.push({ field: 'name', severity: 'critical', message: 'Missing name' });
  } else {
    completeness++;
  }

  if (!item.slug || item.slug.trim() === '') {
    issues.push({ field: 'slug', severity: 'critical', message: 'Missing slug' });
  } else {
    completeness++;
  }

  // Price (important for revenue)
  if (!item.price || item.price === 0) {
    issues.push({ field: 'price', severity: 'warning', message: 'Missing price' });
  } else {
    completeness++;
  }

  // Image (important for UX)
  if (!item.image_url) {
    issues.push({ field: 'image_url', severity: 'warning', message: 'Missing image' });
  } else {
    completeness++;
  }

  // Affiliate link (important for revenue)
  if (!item.affiliate_url) {
    issues.push({ field: 'affiliate_url', severity: 'warning', message: 'Missing affiliate link' });
  } else {
    completeness++;
  }

  // Type-specific checks
  if (type === 'engine') {
    const engine = item as AdminEngine;
    if (!engine.brand || engine.brand.trim() === '') {
      issues.push({ field: 'brand', severity: 'critical', message: 'Missing brand' });
    } else {
      completeness++;
    }
    if (!engine.displacement_cc || engine.displacement_cc === 0) {
      issues.push({ field: 'displacement_cc', severity: 'critical', message: 'Missing displacement' });
    } else {
      completeness++;
    }
    if (!engine.horsepower || engine.horsepower === 0) {
      issues.push({ field: 'horsepower', severity: 'warning', message: 'Missing horsepower' });
    } else {
      completeness++;
    }
  } else if (type === 'motor') {
    const motor = item as AdminElectricMotor;
    if (!motor.brand || motor.brand.trim() === '') {
      issues.push({ field: 'brand', severity: 'critical', message: 'Missing brand' });
    } else {
      completeness++;
    }
    if (!motor.voltage || motor.voltage === 0) {
      issues.push({ field: 'voltage', severity: 'critical', message: 'Missing voltage' });
    } else {
      completeness++;
    }
    if (!motor.power_kw || motor.power_kw === 0) {
      issues.push({ field: 'power_kw', severity: 'critical', message: 'Missing power' });
    } else {
      completeness++;
    }
    if (!motor.horsepower || motor.horsepower === 0) {
      issues.push({ field: 'horsepower', severity: 'warning', message: 'Missing horsepower' });
    } else {
      completeness++;
    }
  } else if (type === 'part') {
    const part = item as AdminPart;
    if (!part.brand || part.brand.trim() === '') {
      issues.push({ field: 'brand', severity: 'warning', message: 'Missing brand' });
    } else {
      completeness++;
    }
    if (!part.category || part.category.trim() === '') {
      issues.push({ field: 'category', severity: 'critical', message: 'Missing category' });
    } else {
      completeness++;
    }
  }

  // Calculate score (0-100)
  const completenessRatio = completeness / maxCompleteness;
  const criticalPenalty = issues.filter(i => i.severity === 'critical').length * 20;
  const warningPenalty = issues.filter(i => i.severity === 'warning').length * 5;
  const score = Math.max(0, Math.min(100, (completenessRatio * 100) - criticalPenalty - warningPenalty));

  return {
    entityType: type,
    entityId: item.id,
    entityName: item.name,
    score: Math.round(score),
    issues,
    completeness: completenessRatio,
  };
}

/**
 * Get comprehensive data quality report
 */
export async function getDataQualityReport(): Promise<ActionResult<DataQualityReport>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();

    // Fetch all items
    const [enginesRes, motorsRes, partsRes] = await Promise.all([
      supabase.from('engines').select('*'),
      supabase.from('electric_motors').select('*'),
      supabase.from('parts').select('*'),
    ]);

    if (enginesRes.error) return error('Failed to fetch engines');
    if (motorsRes.error) return error('Failed to fetch motors');
    if (partsRes.error) return error('Failed to fetch parts');

    const engines = (enginesRes.data || []) as AdminEngine[];
    const motors = (motorsRes.data || []) as AdminElectricMotor[];
    const parts = (partsRes.data || []) as AdminPart[];

    // Calculate scores for all items
    const engineScores = engines.map(e => calculateItemScore(e, 'engine'));
    const motorScores = motors.map(m => calculateItemScore(m, 'motor'));
    const partScores = parts.map(p => calculateItemScore(p, 'part'));

    const allScores = [...engineScores, ...motorScores, ...partScores];

    // Calculate category averages
    const engineAvg = engineScores.length > 0
      ? engineScores.reduce((sum, s) => sum + s.score, 0) / engineScores.length
      : 100;
    const motorAvg = motorScores.length > 0
      ? motorScores.reduce((sum, s) => sum + s.score, 0) / motorScores.length
      : 100;
    const partAvg = partScores.length > 0
      ? partScores.reduce((sum, s) => sum + s.score, 0) / partScores.length
      : 100;

    // Overall score
    const overallScore = allScores.length > 0
      ? allScores.reduce((sum, s) => sum + s.score, 0) / allScores.length
      : 100;

    // Count issues
    const itemsWithIssues = allScores.filter(s => s.issues.length > 0).length;
    const criticalIssues = allScores.reduce((sum, s) => 
      sum + s.issues.filter(i => i.severity === 'critical').length, 0
    );
    const warnings = allScores.reduce((sum, s) => 
      sum + s.issues.filter(i => i.severity === 'warning').length, 0
    );

    // Top issues
    const issueCounts = new Map<string, { count: number; severity: 'critical' | 'warning' | 'info' }>();
    allScores.forEach(score => {
      score.issues.forEach(issue => {
        const key = issue.field;
        const existing = issueCounts.get(key);
        if (existing) {
          existing.count++;
          // Upgrade severity if needed
          if (issue.severity === 'critical' && existing.severity !== 'critical') {
            existing.severity = 'critical';
          } else if (issue.severity === 'warning' && existing.severity === 'info') {
            existing.severity = 'warning';
          }
        } else {
          issueCounts.set(key, { count: 1, severity: issue.severity });
        }
      });
    });

    const topIssues = Array.from(issueCounts.entries())
      .map(([field, data]) => ({ field, ...data }))
      .sort((a, b) => {
        // Sort by severity first, then count
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[a.severity] - severityOrder[b.severity];
        }
        return b.count - a.count;
      })
      .slice(0, 10);

    const report: DataQualityReport = {
      overallScore: Math.round(overallScore),
      categoryScores: {
        engines: Math.round(engineAvg),
        motors: Math.round(motorAvg),
        parts: Math.round(partAvg),
      },
      itemScores: allScores.sort((a, b) => a.score - b.score), // Lowest scores first
      summary: {
        totalItems: allScores.length,
        itemsWithIssues,
        criticalIssues,
        warnings,
      },
      topIssues,
    };

    return success(report);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to generate data quality report');
  }
}
