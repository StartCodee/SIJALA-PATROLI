import { PenLine } from 'lucide-react';

const clamp = (value) => Math.min(1, Math.max(0, Number(value) || 0));

export const SignaturePreview = ({ signature, className = '' }) => {
  const strokes = Array.isArray(signature?.strokes) ? signature.strokes : [];
  const segments = strokes.filter((stroke) => Array.isArray(stroke) && stroke.length > 1);

  if (segments.length === 0) {
    return (
      <div
        className={`flex items-center justify-center rounded-md border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground ${className}`.trim()}
      >
        <PenLine className="mr-2 h-3.5 w-3.5" />
        Tidak ada tanda tangan
      </div>
    );
  }

  const normalizedPoints = segments.flatMap((stroke) =>
    stroke.map((point) => ({ x: clamp(point?.x), y: clamp(point?.y) })),
  );

  const minX = Math.min(...normalizedPoints.map((point) => point.x));
  const maxX = Math.max(...normalizedPoints.map((point) => point.x));
  const minY = Math.min(...normalizedPoints.map((point) => point.y));
  const maxY = Math.max(...normalizedPoints.map((point) => point.y));

  const contentWidth = Math.max(0.0001, maxX - minX);
  const contentHeight = Math.max(0.0001, maxY - minY);
  const canvasWidth = 100;
  const canvasHeight = 40;
  const padding = 3;
  const drawWidth = canvasWidth - padding * 2;
  const drawHeight = canvasHeight - padding * 2;
  const scale = Math.min(drawWidth / contentWidth, drawHeight / contentHeight);
  const offsetX = (canvasWidth - contentWidth * scale) / 2;
  const offsetY = (canvasHeight - contentHeight * scale) / 2;

  return (
    <div className={`rounded-md border border-border bg-white p-2 ${className}`.trim()}>
      <svg viewBox="0 0 100 40" className="h-20 w-full" preserveAspectRatio="xMidYMid meet">
        {segments.map((stroke, index) => {
          const points = stroke
            .map((point) => {
              const x = ((clamp(point?.x) - minX) * scale + offsetX).toFixed(2);
              const y = ((clamp(point?.y) - minY) * scale + offsetY).toFixed(2);
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <polyline
              key={`stroke-${index}`}
              points={points}
              fill="none"
              stroke="#0f4c81"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
      </svg>
    </div>
  );
};
