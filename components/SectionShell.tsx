import Trace from "@/components/motion/Trace";
import { SEGMENT_SPAN, segmentStart } from "@/lib/trace";

interface SectionShellProps {
  id: string;
  /** Position on the global signal. Consecutive sections join exactly. */
  index: number;
  ground?: "paper" | "deep";
  deviation?: number;
  /** A real measurement, e.g. "mm/s RMS". Never a decorative eyebrow. */
  unit?: string;
  heading?: React.ReactNode;
  /**
   * Draws the fan-fold perforation along the top edge. Use it where this
   * section sits on the same ground as the one before, so they don't merge.
   */
  fold?: boolean;
  /** Rendered behind everything, filling the section. For MediaClip backdrops. */
  backdrop?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * The chart recorder.
 *
 * Desktop (≥62rem): a gutter column carries the trace down the page beside the
 * prose. Mobile: the gutter has nowhere to go, so the same window on the signal
 * is rendered as a full-width horizontal strip under the heading. Because both
 * read the same `t0`, the chart stays continuous either way — the axis rotates,
 * the signal does not restart.
 */
export default function SectionShell({
  id,
  index,
  ground = "paper",
  deviation = 0,
  unit,
  heading,
  fold = false,
  backdrop,
  children,
}: SectionShellProps) {
  const t0 = segmentStart(index);

  return (
    <section
      id={id}
      data-ground={ground}
      data-reveal-group
      className={`section-pad relative ${fold ? "fold" : ""}`}
    >
      {backdrop}
      <div className="shell recorder relative">
        <div className="hidden lg:block sticky top-[calc(var(--nav-h)+2rem)]">
          {unit ? (
            <p className="t-label mb-3">
              <span className="num">{unit}</span>
            </p>
          ) : null}
          <Trace
            t0={t0}
            span={SEGMENT_SPAN}
            deviation={deviation}
            orientation="vertical"
            className="h-[26rem] w-[7rem]"
          />
        </div>

        <div>
          {heading ? (
            <div className="overflow-clip mb-7">
              <h2 data-reveal="mask" className="t-h2 max-w-[24ch]">
                {heading}
              </h2>
            </div>
          ) : null}

          <div className="lg:hidden mb-8">
            {unit ? (
              <p className="t-label mb-2">
                <span className="num">{unit}</span>
              </p>
            ) : null}
            <Trace
              t0={t0}
              span={SEGMENT_SPAN}
              deviation={deviation}
              orientation="horizontal"
              className="trace-flow h-[5.5rem] w-full"
            />
          </div>

          {children}
        </div>
      </div>
    </section>
  );
}
