'use client';

interface MiniChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  type?: 'bar' | 'pie';
  height?: number;
  className?: string;
}

/**
 * Mini bar or pie chart for dashboard cards
 */
export function MiniChart({
  data,
  type = 'bar',
  height = 40,
  className = '',
}: MiniChartProps) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  if (type === 'bar') {
    return (
      <div className={`flex items-end gap-1 ${className}`} style={{ height }}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * height;
          return (
            <div
              key={index}
              className="flex-1 bg-orange-500 rounded-t transition-all hover:bg-orange-400"
              style={{
                height: `${barHeight}px`,
                minHeight: barHeight > 0 ? '2px' : '0',
              }}
              title={`${item.label}: ${item.value}`}
            />
          );
        })}
      </div>
    );
  }

  // Pie chart (simple donut)
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = -90;

  return (
    <svg width={height} height={height} className={className} viewBox="0 0 100 100">
      {data.map((item, index) => {
        const percentage = (item.value / total) * 100;
        const angle = (percentage / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle = endAngle;

        const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
        const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
        const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
        const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
        const largeArc = angle > 180 ? 1 : 0;

        return (
          <g key={index}>
            <title>{`${item.label}: ${item.value}`}</title>
            <path
              d={`M 50,50 L ${x1},${y1} A 40,40 0 ${largeArc},1 ${x2},${y2} Z`}
              fill={item.color || `hsl(${(index * 360) / data.length}, 70%, 50%)`}
              opacity="0.8"
            />
          </g>
        );
      })}
      <circle cx="50" cy="50" r="25" fill="rgb(30, 41, 30)" />
    </svg>
  );
}
