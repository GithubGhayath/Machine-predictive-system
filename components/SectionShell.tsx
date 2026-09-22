import TraceScope from "@/components/motion/TraceScope";
import { SEGMENT_SPAN, segmentStart } from "@/lib/trace";

interface SectionShellProps {
  id: string;
  /** Position on the global signal. Consecutive sections join exactly. */
  index: number;
  ground?: "paper" | "deep";
  deviation?: number;
  /** A real measurement, e.g. "mm/s RMS". Never a decorative eyebrow. */
  unit?: string;
  /** Turn the band off where the section draws its own charts. */
  trace?: boolean;
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
 * Every section reads a window onto the same continuous signal. The window is
 * an oscilloscope band that runs the full width under the heading — the same
 * instrument screen the sensor drawings use — rather than a narrow chart
 * boxed into a side column. Because each section's `t0` starts where the
 * previous one ended, the bands still read as one recording.
 */
export default function SectionShell({
  id,
  index,
  ground = "paper",
  deviation = 0,
  unit,
  trace = true,
  heading,
  fold = false,
  backdrop,
  children,
}: SectionShellProps) {
  return (
    <section
      id={id}
      data-ground={ground}
      data-reveal-group
      className={`section-pad relative ${fold ? "fold" : ""}`}
    >
      {backdrop}
      <div className="shell relative">
        {heading ? (
          <div className="overflow-clip mb-7">
            <h2 data-reveal="mask" className="t-h2 max-w-[24ch]">
              {heading}
            </h2>
          </div>
        ) : null}

        {trace ? (
          <div className="mb-8 lg:mb-10">
            <TraceScope
              t0={segmentStart(index)}
              span={SEGMENT_SPAN}
              deviation={deviation}
              unit={unit}
            />
          </div>
        ) : null}

        {children}
      </div>
    </section>
  );
}
