import { buildLoopTrace } from "@/lib/trace";

const W = 1000;
const H = 116;

/**
 * The hero's trace, running. The band stays put — it is the machine's learned
 * normal — while the signal crawls under it like paper under a recorder's pen.
 *
 * The outer box mirrors in RTL. On load a ground-coloured cover slides off it
 * — the pen's first pass — using transform only, so it never costs the main
 * thread while the page is still loading. The inner strip is twice as wide as
 * the box and slides by exactly one period, so the loop is seamless.
 * The crawl only runs with JavaScript (so the hold switch exists) and without
 * reduced motion.
 */
export default function LiveTrace({
  t0,
  span,
  className = "",
}: {
  t0: number;
  span: number;
  className?: string;
}) {
  const loop = buildLoopTrace({ t0, span, width: W, height: H });

  return (
    <div aria-hidden className={`trace-flow relative overflow-clip ${className}`}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
      >
        <rect
          x={0}
          y={loop.bandTop}
          width={W}
          height={loop.bandBottom - loop.bandTop}
          fill="var(--corridor)"
        />
        {[loop.bandTop, loop.bandBottom].map((edge, i) => (
          <line
            key={i}
            x1={0}
            y1={edge}
            x2={W}
            y2={edge}
            stroke="var(--rule)"
            strokeWidth={1}
            strokeDasharray="3 5"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      <div data-live className="trace-live absolute inset-y-0 left-0 w-[200%]">
        <svg
          viewBox={`0 0 ${W * 2} ${H}`}
          preserveAspectRatio="none"
          className="block size-full"
        >
          <path
            d={loop.d}
            fill="none"
            stroke="var(--trace)"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <div className="trace-cover absolute inset-0 bg-ground" />
    </div>
  );
}
