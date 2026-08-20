/**
 * A progress ring. Draws the ring only.
 *
 * It used to render its own percentage label centred inside itself. Every
 * caller also overlays its own label in the same absolutely-positioned centre,
 * so the two stacked on top of each other and the home page showed "0%"
 * printed twice, one across the other. The ring is the drawing; what goes in
 * the middle belongs to the caller.
 *
 * It also used to set a fixed pixel width and height from `size`. The home page
 * asked for 288 inside a 256px box, so the ring overflowed its container by
 * 32px and the stats row beneath collided with the stroke. `size` is now the
 * SVG coordinate space only — the element fills whatever box it is given, so
 * the caller can size it responsively and it can never overflow.
 */
interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

export function ProgressRing({ progress, size = 100, strokeWidth = 8 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative h-full w-full">
      <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="text-secondary"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-primary"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: 'stroke-dashoffset 0.3s ease-in-out',
          }}
        />
      </svg>
    </div>
  );
}
