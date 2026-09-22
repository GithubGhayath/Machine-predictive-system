import Oscilloscope from "@/components/motion/Oscilloscope";
import { buildTrace } from "@/lib/trace";

const BOX = { w: 1000, h: 116 };

interface TraceScopeProps {
  /** Where this window starts on the site-wide signal, so bands join up. */
  t0: number;
  span: number;
  deviation?: number;
  amplitude?: number;
  band?: number;
  /** A real measurement unit, shown as a small mono tag. Never a decorative label. */
  unit?: string;
  /** Tailwind height classes; the scope always fills its container's width. */
  heightClass?: string;
}

/**
 * A window onto the site-wide signal, drawn as instrument output: a dark
 * screen edge to edge, dot-grid reticle, a faint centre line, the learned
 * normal band as a soft fill between two dashed limits, and the trace itself.
 * Only the stretches that leave the band take the signal colour.
 *
 * The canvas version (`.motion-only`) and a plain SVG built from the same
 * points (`.static-only`, for no-JS and reduced motion) both live in the
 * markup, so the page is complete either way. Draw-on is the same CSS wipe
 * MotionProvider starts when it scrolls into view.
 */
export default function TraceScope({
  t0,
  span,
  deviation = 0,
  amplitude,
  band,
  unit,
  heightClass = "h-[6.5rem] lg:h-[8.5rem]",
}: TraceScopeProps) {
  const geo = buildTrace({
    t0,
    span,
    width: BOX.w,
    height: BOX.h,
    deviation,
    amplitude,
    band,
    samples: 260,
  });

  const bandArea = [
    { x: 0, y: geo.bandTop },
    { x: BOX.w, y: geo.bandTop },
    { x: BOX.w, y: geo.bandBottom },
    { x: 0, y: geo.bandBottom },
  ];
  const edge = (y: number) => [
    { x: 0, y },
    { x: BOX.w, y },
  ];

  return (
    <div
      data-orientation="horizontal"
      className={`trace-draw relative w-full bg-[var(--deep)] ${heightClass}`}
    >
      <svg
        viewBox={`0 0 ${BOX.w} ${BOX.h}`}
        preserveAspectRatio="none"
        aria-hidden
        className="static-only trace-flow absolute inset-0 size-full"
      >
        <rect
          x={0}
          y={geo.bandTop}
          width={BOX.w}
          height={geo.bandBottom - geo.bandTop}
          fill="var(--paper)"
          opacity={0.07}
        />
        <line
          x1={0}
          y1={BOX.h / 2}
          x2={BOX.w}
          y2={BOX.h / 2}
          stroke="var(--steel)"
          strokeWidth={1}
          strokeDasharray="2 4"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={geo.d}
          fill="none"
          stroke="var(--paper)"
          strokeOpacity={0.7}
          strokeWidth={1.4}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {geo.outOfBand.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="var(--signal)"
            strokeWidth={2}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      <Oscilloscope
        className="motion-only trace-flow absolute inset-0"
        box={BOX}
        fill={{ points: bandArea, alpha: 0.2 }}
        layers={[
          { points: edge(geo.bandTop), color: "steel", width: 1, dash: [3, 5] },
          { points: edge(geo.bandBottom), color: "steel", width: 1, dash: [3, 5] },
          { points: geo.points, color: "paper" },
          ...geo.outOfBandPoints.map((points) => ({ points, color: "amber" as const })),
        ]}
      />

      {unit ? (
        <span
          className="t-label absolute pointer-events-none"
          style={{
            insetInlineStart: "0.75rem",
            top: "0.5rem",
            color: "color-mix(in srgb, var(--paper) 62%, transparent)",
          }}
        >
          <span className="num">{unit}</span>
        </span>
      ) : null}
    </div>
  );
}
