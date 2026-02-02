'use client';

/**
 * Shaft callout diagram — side view of output shaft with diameter, length, type.
 * Use in engine/motor detail Shaft section. Matches MountDimensionsDiagram style.
 */

export interface ShaftCalloutDiagramProps {
  shaftDiameter: number; // inches
  shaftLength: number; // inches
  shaftType: string;
  shaftKeyway?: number | null; // inches, optional
  className?: string;
}

const stroke = '#0d0f0c';
const strokeLight = '#2d3226';

export function ShaftCalloutDiagram({
  shaftDiameter,
  shaftLength,
  shaftType,
  shaftKeyway,
  className = '',
}: ShaftCalloutDiagramProps) {
  const viewW = 260;
  const viewH = 120;
  const blockW = 28;
  const blockH = 48;
  const by = (viewH - blockH) / 2;
  const shaftY = viewH / 2;
  const shaftLen = 120;
  const shaftRx = 56 + blockW;
  const shaftEnd = shaftRx + shaftLen;
  const diam = Math.min(24, Math.max(12, shaftDiameter * 20));

  return (
    <div
      className={`rounded-xl border border-olive-600/50 bg-olive-800/60 overflow-hidden shadow-sm ${className}`}
      role="img"
      aria-label={`Output shaft: ${shaftDiameter} inch diameter, ${shaftLength} inch length, ${shaftType}${shaftKeyway != null && shaftKeyway > 0 ? `, ${shaftKeyway} inch keyway` : ''}.`}
    >
      <div className="px-4 pt-4 pb-3 border-b border-olive-600/40">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-cream-500/90 mb-1.5">
          Output shaft
        </p>
        <p className="text-lg font-bold text-cream-100 tabular-nums tracking-tight">
          {shaftDiameter}&quot; × {shaftLength}&quot; · {shaftType}
          {shaftKeyway != null && shaftKeyway > 0 ? ` · ${shaftKeyway}" keyway` : ''}
        </p>
      </div>
      <div className="p-4 bg-white border border-gray-200">
        <svg
          viewBox={`0 0 ${viewW} ${viewH}`}
          className="w-full max-w-[260px] h-auto mx-auto block"
          style={{ minHeight: 100 }}
        >
          {/* Engine block (simplified) */}
          <rect x="24" y={by} width={blockW} height={blockH} fill="none" stroke={stroke} strokeWidth="2" rx="2" />
          {/* Shaft */}
          <line x1={56 + blockW} y1={shaftY} x2={shaftEnd} y2={shaftY} stroke={stroke} strokeWidth="3" />
          <ellipse cx={shaftEnd} cy={shaftY} rx="4" ry="6" fill="none" stroke={stroke} strokeWidth="2" />
          {/* Keyway notch (simplified) */}
          {shaftKeyway != null && shaftKeyway > 0 && (
            <rect
              x={shaftEnd - 6}
              y={shaftY - 2}
              width="4"
              height="4"
              fill="none"
              stroke={strokeLight}
              strokeWidth="1.5"
            />
          )}
          {/* Diameter dimension */}
          <line x1={shaftEnd + 10} y1={shaftY - diam / 2} x2={shaftEnd + 10} y2={shaftY + diam / 2} stroke={strokeLight} strokeWidth="2" />
          <line x1={shaftEnd + 6} y1={shaftY - diam / 2} x2={shaftEnd + 14} y2={shaftY - diam / 2} stroke={strokeLight} strokeWidth="1.5" />
          <line x1={shaftEnd + 6} y1={shaftY + diam / 2} x2={shaftEnd + 14} y2={shaftY + diam / 2} stroke={strokeLight} strokeWidth="1.5" />
          <text
            x={shaftEnd + 22}
            y={shaftY + 4}
            textAnchor="start"
            fill={stroke}
            fontSize="13"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
          >
            {shaftDiameter}&quot;
          </text>
          {/* Length dimension */}
          <line x1={shaftRx} y1={shaftY + 22} x2={shaftEnd} y2={shaftY + 22} stroke={strokeLight} strokeWidth="2" />
          <line x1={shaftRx} y1={shaftY + 18} x2={shaftRx} y2={shaftY + 26} stroke={strokeLight} strokeWidth="1.5" />
          <line x1={shaftEnd} y1={shaftY + 18} x2={shaftEnd} y2={shaftY + 26} stroke={strokeLight} strokeWidth="1.5" />
          <text
            x={(shaftRx + shaftEnd) / 2}
            y={shaftY + 38}
            textAnchor="middle"
            fill={stroke}
            fontSize="13"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
          >
            {shaftLength}&quot; length
          </text>
        </svg>
      </div>
      <div className="px-4 py-3 bg-olive-800/30 border-t border-olive-600/40">
        <p className="text-[10px] font-medium uppercase tracking-wider text-cream-500/80">
          Clutch, torque converter & sprocket bore must match diameter
        </p>
      </div>
    </div>
  );
}
