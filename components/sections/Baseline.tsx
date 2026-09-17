import SectionShell from "@/components/SectionShell";
import { getBaseline } from "@/lib/data";
import { buildTrace, segmentStart } from "@/lib/trace";
import type { Locale } from "@/lib/data/types";

const BOX = { w: 1000, h: 120 };

/**
 * Two machines of the same model, both healthy, each inside its own band. The
 * bands are different widths — that is the whole argument of this section, so
 * it is drawn rather than stated. Nothing here is out of band, so nothing here
 * is amber.
 */
function MachinePair({ labels }: { labels: [string, string] }) {
  const machines = [
    { label: labels[0], t0: segmentStart(7), amplitude: 0.24, band: 0.21 },
    { label: labels[1], t0: segmentStart(7) + 9.3, amplitude: 0.42, band: 0.35 },
  ];

  return (
    <div className="flex flex-col gap-8">
      {machines.map((machine) => {
        const geo = buildTrace({
          t0: machine.t0,
          span: 22,
          width: BOX.w,
          height: BOX.h,
          deviation: 0,
          amplitude: machine.amplitude,
          band: machine.band,
          samples: 260,
        });

        return (
          <figure key={machine.label} data-reveal>
            <figcaption className="mb-2 text-[0.95rem] text-fg-muted">
              {machine.label}
            </figcaption>
            <svg
              viewBox={`0 0 ${BOX.w} ${BOX.h}`}
              preserveAspectRatio="none"
              aria-hidden
              className="trace-flow w-full h-[6rem] lg:h-[7rem]"
            >
              <rect
                x={0}
                y={geo.bandTop}
                width={BOX.w}
                height={geo.bandBottom - geo.bandTop}
                fill="var(--corridor)"
              />
              {[geo.bandTop, geo.bandBottom].map((edge, i) => (
                <line
                  key={i}
                  x1={0}
                  y1={edge}
                  x2={BOX.w}
                  y2={edge}
                  stroke="var(--rule)"
                  strokeWidth={1}
                  strokeDasharray="4 6"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              <path
                d={geo.d}
                fill="none"
                stroke="var(--trace)"
                strokeWidth={1.5}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </figure>
        );
      })}
    </div>
  );
}

export default async function Baseline({ locale }: { locale: Locale }) {
  const baseline = await getBaseline(locale);
  if (!baseline) return null;

  return (
    <SectionShell
      id="baseline"
      index={7}
      ground="paper"
      unit="mm/s RMS"
      fold
      heading={baseline.heading}
    >
      <p data-reveal className="t-body text-fg-muted mb-14">
        {baseline.body}
      </p>

      <MachinePair labels={baseline.machineLabels} />

      <aside data-reveal className="callout mt-16">
        <p>{baseline.callout}</p>
      </aside>
    </SectionShell>
  );
}
