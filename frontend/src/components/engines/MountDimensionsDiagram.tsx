'use client';

import { useCallback } from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type ParsedMount = { lengthMm: number; widthMm: number; unit: 'mm' | 'in'; raw: string };

/**
 * Parses mount_type strings like "162mm x 75.5mm" or "6.5 x 7.5 inch"
 */
function parseMountType(mountType: string | null | undefined): ParsedMount | null {
  if (!mountType || typeof mountType !== 'string') return null;
  const s = mountType.trim();

  const mmMatch = s.match(/^(\d+(?:\.\d+)?)\s*mm\s*[x×]\s*(\d+(?:\.\d+)?)\s*mm$/i)
    ?? s.match(/^(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*mm$/i);
  if (mmMatch) {
    const a = parseFloat(mmMatch[1]);
    const b = parseFloat(mmMatch[2]);
    if (Number.isFinite(a) && Number.isFinite(b) && a > 0 && b > 0)
      return { lengthMm: a, widthMm: b, unit: 'mm', raw: mountType };
  }

  const inMatch = s.match(/^(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*in(?:ch|ches)?$/i);
  if (inMatch) {
    const a = parseFloat(inMatch[1]) * 25.4;
    const b = parseFloat(inMatch[2]) * 25.4;
    if (Number.isFinite(a) && Number.isFinite(b) && a > 0 && b > 0)
      return { lengthMm: a, widthMm: b, unit: 'in', raw: mountType };
  }

  return null;
}

/** Shared diagram geometry */
function getDiagramGeometry(parsed: ParsedMount) {
  const { lengthMm, widthMm } = parsed;
  const maxLen = Math.max(lengthMm, widthMm);
  const scale = 180 / maxLen;
  const dx = lengthMm * scale;
  const dy = widthMm * scale;
  const pad = 44;
  const cx = pad;
  const cy = pad;
  const r = 5;
  const ext = 12;
  const tick = 4;
  const viewW = dx + pad * 2 + 28;
  const viewH = dy + pad * 2 + 32;
  return { dx, dy, pad, cx, cy, r, ext, tick, viewW, viewH };
}

/** Build SVG markup for print (white bg, high-contrast dark strokes) */
function buildPrintSvg(parsed: ParsedMount): string {
  const { lengthMm, widthMm, unit } = parsed;
  const g = getDiagramGeometry(parsed);
  const { dx, dy, cx, cy, r, ext, tick } = g;
  const stroke = '#0d0f0c';
  const strokeLight = '#2d3226';
  const fill = '#0d0f0c';
  const lengthLabel = unit === 'mm' ? `${lengthMm} mm` : `${(lengthMm / 25.4).toFixed(1)} in`;
  const widthLabel = unit === 'mm' ? `${widthMm} mm` : `${(widthMm / 25.4).toFixed(1)} in`;

  const holes = [
    [cx, cy],
    [cx + dx, cy],
    [cx + dx, cy + dy],
    [cx, cy + dy],
  ]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${stroke}" stroke-width="2.5"/>`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.viewW} ${g.viewH}" class="mount-print-svg">
  <rect x="${cx}" y="${cy}" width="${dx}" height="${dy}" fill="#fff" stroke="${stroke}" stroke-width="3" rx="3"/>
  ${holes}
  <line x1="${cx}" y1="${cy + dy}" x2="${cx}" y2="${cy + dy + ext}" stroke="${strokeLight}" stroke-width="2"/>
  <line x1="${cx + dx}" y1="${cy + dy}" x2="${cx + dx}" y2="${cy + dy + ext}" stroke="${strokeLight}" stroke-width="2"/>
  <line x1="${cx}" y1="${cy + dy + ext + tick}" x2="${cx + dx}" y2="${cy + dy + ext + tick}" stroke="${stroke}" stroke-width="2"/>
  <line x1="${cx}" y1="${cy + dy + ext}" x2="${cx}" y2="${cy + dy + ext + tick}" stroke="${strokeLight}" stroke-width="2"/>
  <line x1="${cx + dx}" y1="${cy + dy + ext}" x2="${cx + dx}" y2="${cy + dy + ext + tick}" stroke="${strokeLight}" stroke-width="2"/>
  <text x="${cx + dx / 2}" y="${cy + dy + ext + tick + 15}" text-anchor="middle" font-size="14" font-weight="700" fill="${fill}" font-family="system-ui,sans-serif">${lengthLabel}</text>
  <line x1="${cx}" y1="${cy}" x2="${cx - ext}" y2="${cy}" stroke="${strokeLight}" stroke-width="2"/>
  <line x1="${cx}" y1="${cy + dy}" x2="${cx - ext}" y2="${cy + dy}" stroke="${strokeLight}" stroke-width="2"/>
  <line x1="${cx - ext - tick}" y1="${cy}" x2="${cx - ext - tick}" y2="${cy + dy}" stroke="${stroke}" stroke-width="2"/>
  <line x1="${cx - ext}" y1="${cy}" x2="${cx - ext - tick}" y2="${cy}" stroke="${strokeLight}" stroke-width="2"/>
  <line x1="${cx - ext}" y1="${cy + dy}" x2="${cx - ext - tick}" y2="${cy + dy}" stroke="${strokeLight}" stroke-width="2"/>
  <text x="${cx - ext - tick - 10}" y="${cy + dy / 2}" text-anchor="middle" font-size="14" font-weight="700" fill="${fill}" font-family="system-ui,sans-serif" transform="rotate(-90, ${cx - ext - tick - 10}, ${cy + dy / 2})">${widthLabel}</text>
</svg>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Build full print HTML and open print dialog */
function openPrintDialog(parsed: ParsedMount, productName?: string, productType?: 'engine' | 'motor') {
  const svg = buildPrintSvg(parsed);
  const rawEsc = escapeHtml(parsed.raw);
  const productLine =
    productName && productType
      ? `<p class="product-line">${productType === 'engine' ? 'Engine' : 'Motor'}: ${escapeHtml(productName)}</p>`
      : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mounting Footprint – GoKart Part Picker</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #fff;
      font-family: system-ui, -apple-system, sans-serif;
      color: #1a1e15;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .sheet {
      max-width: 400px;
      width: 100%;
      text-align: center;
    }
    .brand {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #4d5340;
      margin-bottom: 1.5rem;
    }
    h1 {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #4d5340;
      margin-bottom: 0.35rem;
    }
    .dimensions {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: #1a1e15;
      margin-bottom: 1rem;
    }
    .product-line {
      font-size: 13px;
      color: #4d5340;
      margin-bottom: 1.25rem;
    }
    .diagram-wrap {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.25rem;
    }
    .mount-print-svg {
      width: 100%;
      max-width: 280px;
      height: auto;
      display: block;
      margin: 0 auto;
    }
    .footer {
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #6b7280;
    }
    @media print {
      body { padding: 0.75in; }
      .sheet { max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <p class="brand">GoKart Part Picker</p>
    <h1>Mounting footprint</h1>
    <p class="dimensions">${rawEsc}</p>
    ${productLine}
    <div class="diagram-wrap">
      ${svg}
    </div>
    <p class="footer">Center-to-center dimensions</p>
  </div>
  <script>
    window.onload = function() {
      window.print();
      window.onafterprint = function() { try { window.close(); } catch (_) {} };
    };
  </script>
</body>
</html>`;

  const w = window.open('', '_blank', 'noopener,noreferrer');
  if (!w) return;
  w.document.write(html);
  w.document.close();
}

export interface MountDimensionsDiagramProps {
  mountType: string | null | undefined;
  className?: string;
  /** Product name for print (e.g. engine or motor name) */
  productName?: string;
  /** 'engine' | 'motor' for print header */
  productType?: 'engine' | 'motor';
}

/**
 * Renders a 4-bolt mounting pattern diagram with white background
 * and a print option.
 */
export function MountDimensionsDiagram({
  mountType,
  className = '',
  productName,
  productType,
}: MountDimensionsDiagramProps) {
  const parsed = parseMountType(mountType);
  const handlePrint = useCallback(() => {
    if (!parsed) return;
    openPrintDialog(parsed, productName, productType);
  }, [parsed, productName, productType]);

  if (!parsed) return null;

  const { lengthMm, widthMm, unit } = parsed;
  const g = getDiagramGeometry(parsed);
  const { dx, dy, cx, cy, r, ext, tick } = g;

  return (
    <div
      className={`rounded-xl border border-olive-600/50 bg-olive-800/60 overflow-hidden shadow-sm ${className}`}
      role="img"
      aria-label={`Mounting hole dimensions: ${lengthMm}mm by ${widthMm}mm. Four-bolt rectangular pattern.`}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-olive-600/40 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-cream-500/90 mb-1.5">
            Mounting footprint
          </p>
          <p className="text-xl font-bold text-cream-100 tabular-nums tracking-tight">{parsed.raw}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrint}
          icon={<Printer className="w-4 h-4" />}
          className="shrink-0 text-cream-400 hover:text-orange-400 hover:bg-olive-700/50"
          aria-label="Print mounting diagram"
        >
          Print
        </Button>
      </div>

      {/* Diagram — white background, high-contrast dark strokes */}
      <div className="p-4 bg-white border border-gray-200">
        <svg
          viewBox={`0 0 ${g.viewW} ${g.viewH}`}
          className="w-full max-w-[260px] h-auto mx-auto block"
          style={{ minHeight: 130 }}
        >
          {/* Plate outline — dark, thick */}
          <rect
            x={cx}
            y={cy}
            width={dx}
            height={dy}
            fill="none"
            stroke="#0d0f0c"
            strokeWidth="3"
            rx="3"
          />
          {/* Bolt holes */}
          {[
            [cx, cy],
            [cx + dx, cy],
            [cx + dx, cy + dy],
            [cx, cy + dy],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={r}
              fill="#ffffff"
              stroke="#0d0f0c"
              strokeWidth="2.5"
            />
          ))}
          {/* Horizontal dimension */}
          <line x1={cx} y1={cy + dy} x2={cx} y2={cy + dy + ext} stroke="#2d3226" strokeWidth="2" />
          <line x1={cx + dx} y1={cy + dy} x2={cx + dx} y2={cy + dy + ext} stroke="#2d3226" strokeWidth="2" />
          <line x1={cx} y1={cy + dy + ext + tick} x2={cx + dx} y2={cy + dy + ext + tick} stroke="#0d0f0c" strokeWidth="2" />
          <line x1={cx} y1={cy + dy + ext} x2={cx} y2={cy + dy + ext + tick} stroke="#2d3226" strokeWidth="2" />
          <line x1={cx + dx} y1={cy + dy + ext} x2={cx + dx} y2={cy + dy + ext + tick} stroke="#2d3226" strokeWidth="2" />
          <text
            x={cx + dx / 2}
            y={cy + dy + ext + tick + 15}
            textAnchor="middle"
            fill="#0d0f0c"
            fontSize="14"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {unit === 'mm' ? `${lengthMm} mm` : `${(lengthMm / 25.4).toFixed(1)} in`}
          </text>
          {/* Vertical dimension */}
          <line x1={cx} y1={cy} x2={cx - ext} y2={cy} stroke="#2d3226" strokeWidth="2" />
          <line x1={cx} y1={cy + dy} x2={cx - ext} y2={cy + dy} stroke="#2d3226" strokeWidth="2" />
          <line x1={cx - ext - tick} y1={cy} x2={cx - ext - tick} y2={cy + dy} stroke="#0d0f0c" strokeWidth="2" />
          <line x1={cx - ext} y1={cy} x2={cx - ext - tick} y2={cy} stroke="#2d3226" strokeWidth="2" />
          <line x1={cx - ext} y1={cy + dy} x2={cx - ext - tick} y2={cy + dy} stroke="#2d3226" strokeWidth="2" />
          <text
            x={cx - ext - tick - 10}
            y={cy + dy / 2}
            textAnchor="middle"
            fill="#0d0f0c"
            fontSize="14"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
            style={{ fontVariantNumeric: 'tabular-nums' }}
            transform={`rotate(-90, ${cx - ext - tick - 10}, ${cy + dy / 2})`}
          >
            {unit === 'mm' ? `${widthMm} mm` : `${(widthMm / 25.4).toFixed(1)} in`}
          </text>
        </svg>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-olive-800/30 border-t border-olive-600/40">
        <p className="text-[10px] font-medium uppercase tracking-wider text-cream-500/80">
          Center-to-center dimensions
        </p>
      </div>
    </div>
  );
}
