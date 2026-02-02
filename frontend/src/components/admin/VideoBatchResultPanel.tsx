'use client';

import { X, CheckCircle, AlertCircle, RefreshCw, BarChart3, Lightbulb, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export type FillResult = {
  filled: number;
  remaining: number;
  limit: number;
  errors: number;
  skippedDuplicates: number;
};

export type ThumbResult = {
  updated: number;
  placeholderUrlCount: number;
  fixed?: number;
};

type BatchResult = 
  | { type: 'fill'; data: FillResult }
  | { type: 'thumb'; data: ThumbResult };

interface VideoBatchResultPanelProps {
  result: BatchResult | null;
  onDismiss: () => void;
  onRunFill?: () => void;
  onRunThumb?: () => void;
  onViewDuplicates?: () => void;
  isFilling?: boolean;
  isRefreshingThumbnails?: boolean;
}

export function VideoBatchResultPanel({
  result,
  onDismiss,
  onRunFill,
  onRunThumb,
  onViewDuplicates,
  isFilling = false,
  isRefreshingThumbnails = false,
}: VideoBatchResultPanelProps) {
  if (!result) return null;

  const isFill = result.type === 'fill';
  const data = result.data;

  return (
    <Card className="border-olive-500/50 bg-olive-900/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-3">
            {isFill ? (
              <FillSummary
                data={data as FillResult}
                onRunAgain={onRunFill}
                onViewDuplicates={onViewDuplicates}
                isRunning={isFilling}
              />
            ) : (
              <ThumbSummary
                data={data as ThumbResult}
                onRunThumb={onRunThumb}
                onRunFill={onRunFill}
                isRefreshingThumbnails={isRefreshingThumbnails}
                isFilling={isFilling}
              />
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="shrink-0 text-cream-400 hover:text-cream-200"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FillSummary({
  data,
  onRunAgain,
  onViewDuplicates,
  isRunning,
}: {
  data: FillResult;
  onRunAgain?: () => void;
  onViewDuplicates?: () => void;
  isRunning: boolean;
}) {
  const { filled, remaining, limit, errors, skippedDuplicates } = data;
  const hasSuccess = filled > 0;
  const hasRemaining = remaining > 0;
  const noNewFilled = filled === 0 && remaining > 0;

  return (
    <>
      <div className="flex items-center gap-2">
        {hasSuccess ? (
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden />
        ) : noNewFilled ? (
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" aria-hidden />
        ) : (
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden />
        )}
        <h3 className="font-semibold text-cream-100">
          {hasSuccess
            ? `Filled ${filled} video URL${filled !== 1 ? 's' : ''} from YouTube`
            : hasRemaining
              ? 'No new URLs filled'
              : 'No placeholder URLs left to fill'}
        </h3>
      </div>
      <ul className="space-y-1.5 text-sm text-cream-300">
        {errors > 0 && (
          <li className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            {errors} video{errors !== 1 ? 's' : ''} had no search results or API errors.
          </li>
        )}
        {skippedDuplicates > 0 && (
          <li className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-sky-400 shrink-0" />
            {skippedDuplicates} skipped (duplicate — already on site).
          </li>
        )}
        {hasRemaining && (
          <li className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cream-400 shrink-0" />
            {remaining} placeholder{remaining !== 1 ? 's' : ''} remaining.
          </li>
        )}
        {hasSuccess && hasRemaining && (
          <li className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
            Run again to process more (processes {limit} per run, quota: ~100/day).
          </li>
        )}
        {hasSuccess && !hasRemaining && (
          <li className="text-emerald-300">All placeholder URLs have been filled. Thumbnails should now be visible.</li>
        )}
        {noNewFilled && (
          <li className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
            Possible reasons: YouTube API quota exceeded (run again tomorrow), no matching videos, or API key issues.
          </li>
        )}
      </ul>
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {hasRemaining && onRunAgain && (
          <Button
            variant="primary"
            size="sm"
            onClick={onRunAgain}
            disabled={isRunning}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            {isRunning ? 'Running…' : 'Run again'}
          </Button>
        )}
        {skippedDuplicates > 0 && onViewDuplicates && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewDuplicates}
            icon={<Link2 className="w-4 h-4" />}
            className="text-sky-400 hover:text-sky-300"
          >
            View duplicates
          </Button>
        )}
      </div>
    </>
  );
}

function ThumbSummary({
  data,
  onRunThumb,
  onRunFill,
  isRefreshingThumbnails,
  isFilling = false,
}: {
  data: ThumbResult;
  onRunThumb?: () => void;
  onRunFill?: () => void;
  isRefreshingThumbnails: boolean;
  isFilling?: boolean;
}) {
  const { updated, placeholderUrlCount } = data;
  const hasSuccess = updated > 0;
  const hasPlaceholders = placeholderUrlCount > 0;
  const noThumbsUpdated = updated === 0;

  return (
    <>
      <div className="flex items-center gap-2">
        {hasSuccess ? (
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden />
        ) : hasPlaceholders ? (
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" aria-hidden />
        ) : (
          <CheckCircle className="w-5 h-5 text-cream-400 shrink-0" aria-hidden />
        )}
        <h3 className="font-semibold text-cream-100">
          {hasSuccess
            ? `Updated ${updated} thumbnail${updated !== 1 ? 's' : ''} from video URLs${data.fixed && data.fixed > 0 ? ` (fixed ${data.fixed} broken)` : ''}`
            : hasPlaceholders
              ? 'No thumbnails updated'
              : 'No thumbnails to update'}
        </h3>
      </div>
      <ul className="space-y-1.5 text-sm text-cream-300">
        {hasPlaceholders && noThumbsUpdated && (
          <>
            <li>{placeholderUrlCount} video{placeholderUrlCount !== 1 ? 's' : ''} still have placeholder URLs.</li>
            <li>Run &quot;Auto-fill URLs from YouTube&quot; first. Thumbnails are set automatically when URLs are updated.</li>
          </>
        )}
        {!hasSuccess && !hasPlaceholders && (
          <li>All videos either already have thumbnails or use non-YouTube URLs.</li>
        )}
      </ul>
      {hasPlaceholders && onRunFill && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRunFill}
            disabled={isFilling}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            {isFilling ? 'Running…' : 'Auto-fill URLs first'}
          </Button>
          <span className="text-xs text-cream-500">Then thumbnails update automatically.</span>
        </div>
      )}
      {hasSuccess && onRunThumb && (
        <div className="pt-1">
          <Button variant="ghost" size="sm" onClick={onRunThumb} disabled={isRefreshingThumbnails}>
            {isRefreshingThumbnails ? 'Refreshing…' : 'Run again'}
          </Button>
        </div>
      )}
    </>
  );
}
