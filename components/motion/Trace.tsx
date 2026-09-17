import { buildTrace } from "@/lib/trace";

interface TraceProps {
  t0: number;
  span: number;
  deviation?: number;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

const H_BOX = { w: 1000, h: 116 };
const V_BOX = { w: 116, h: 1000 };

/**
 * A window onto the site-wide signal.
 *
 * Rendered fully drawn on the server. The draw-on is a CSS clip wipe — the
 * pen moving across the paper — that MotionProvider starts when the trace
 * scrolls into view. Without JavaScript, or with reduced motion, the wipe
 * never applies and the trace is simply there. The neighbouring prose carries
 * the meaning, so the drawing is hidden from assistive tech.
 */
export default function Trace({
  t0,
  span,
  deviation = 0,
  orientation = "horizontal",
  className = "",
}: TraceProps) {
  const vertical = orientation === "vertical";
  const box = vertical ? V_BOX : H_BOX;

  const geometry = buildTrace({
    t0,
    span,
    width: box.w,
    height: box.h,
    deviation,
    vertical,
    samples: vertical ? 300 : 240,
  });

  return (
    <svg
      viewBox={`0 0 ${box.w} ${box.h}`}
      preserveAspectRatio="none"
      data-orientation={orientation}
      className={`trace-draw ${className}`}
      aria-hidden
    >
      {/* the learned normal band */}
      <rect
        x={vertical ? geometry.bandTop : 0}
        y={vertical ? 0 : geometry.bandTop}
        width={vertical ? geometry.bandBottom - geometry.bandTop : box.w}
        height={vertical ? box.h : geometry.bandBottom - geometry.bandTop}
        fill="var(--corridor)"
      />

      {[geometry.bandTop, geometry.bandBottom].map((edge, i) => (
        <line
          key={i}
          x1={vertical ? edge : 0}
          y1={vertical ? 0 : edge}
          x2={vertical ? edge : box.w}
          y2={vertical ? box.h : edge}
          stroke="var(--rule)"
          strokeWidth={1}
          strokeDasharray="3 5"
          vectorEffect="non-scaling-stroke"
        />
      ))}

      <path
        d={geometry.d}
        fill="none"
        stroke="var(--trace)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* out of band — the LINE form of the signal colour. Never filled. */}
      {geometry.outOfBand.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="var(--signal)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
