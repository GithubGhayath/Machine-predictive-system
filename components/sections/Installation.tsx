import MediaClip from "@/components/media/MediaClip";
import { getInstallationSteps } from "@/lib/data";
import { buildTrace, segmentStart } from "@/lib/trace";
import type { Locale } from "@/lib/data/types";

const W = 1000;
const H = 64;
const MID = H / 2;
const STEP = W / 4;

/**
 * Four equal segments that sit exactly over the four step columns. The third —
 * building the baseline — is the one where the system records, so it carries a
 * calm trace; after it the learned band is in place and alerting runs on.
 */
function Timeline() {
  const recording = buildTrace({
    t0: segmentStart(10),
    span: 14,
    width: STEP,
    height: H,
    deviation: 0,
    band: 0.34,
    amplitude: 0.36,
    samples: 120,
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden
      className="trace-flow w-full h-[4rem]"
    >
      <rect
        x={STEP * 3}
        y={recording.bandTop}
        width={STEP}
        height={recording.bandBottom - recording.bandTop}
        fill="var(--corridor)"
      />
      <line
        x1={0}
        y1={MID}
        x2={STEP * 2}
        y2={MID}
        stroke="var(--trace)"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <g transform={`translate(${STEP * 2} 0)`}>
        <path
          d={recording.d}
          fill="none"
          stroke="var(--trace)"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      </g>
      <line
        x1={STEP * 3}
        y1={MID}
        x2={W - 12}
        y2={MID}
        stroke="var(--trace)"
        strokeWidth={1.5}
        strokeDasharray="6 6"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={`M${W - 14} ${MID - 8} L${W - 2} ${MID} L${W - 14} ${MID + 8}`}
        fill="none"
        stroke="var(--trace)"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={i * STEP + (i === 0 ? 1 : 0)}
          y1={2}
          x2={i * STEP + (i === 0 ? 1 : 0)}
          y2={H - 2}
          stroke="var(--fg)"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

export default async function Installation({ locale }: { locale: Locale }) {
  const steps = await getInstallationSteps(locale);
  if (steps.length === 0) return null;

  // A real sequence, so numbering is earned here. Syrian Arabic reads
  // Eastern Arabic digits.
  const format = new Intl.NumberFormat(locale === "ar" ? "ar-SY" : "en", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });

  return (
    <section
      id="installation"
      data-ground="paper"
      data-reveal-group
      className="section-pad fold"
    >
      <div className="shell">
        <div data-reveal className="hidden lg:block">
          <Timeline />
        </div>

        {/* No column gap on desktop, so each column starts exactly on a tick. */}
        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-12 md:gap-x-10 lg:gap-x-0 lg:mt-8">
          {steps.map((step) => (
            <li
              key={step.step}
              data-reveal
              className="border-s-2 border-fg ps-5 lg:border-s-0 lg:ps-0 lg:pe-10"
            >
              <span className="block t-h3 text-fg-muted tabular-nums mb-2">
                {format.format(step.step)}
              </span>
              <h3 className="t-h3 mb-3">{step.title}</h3>
              <p className="t-body text-fg-muted">{step.body}</p>
            </li>
          ))}
        </ol>

        <MediaClip slot="installation" variant="frame" className="mt-20 lg:w-2/3" />
      </div>
    </section>
  );
}
