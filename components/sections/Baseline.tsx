import SectionShell from "@/components/SectionShell";
import TraceScope from "@/components/motion/TraceScope";
import { getBaseline } from "@/lib/data";
import { segmentStart } from "@/lib/trace";
import type { Locale } from "@/lib/data/types";

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
      {machines.map((machine) => (
        <figure key={machine.label} data-reveal>
          <figcaption className="mb-2 text-[0.95rem] text-fg-muted">
            {machine.label}
          </figcaption>
          <TraceScope
            t0={machine.t0}
            span={22}
            amplitude={machine.amplitude}
            band={machine.band}
            unit="mm/s RMS"
            heightClass="h-[6rem] lg:h-[7rem]"
          />
        </figure>
      ))}
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
      trace={false}
      fold
      heading={baseline.heading}
    >
      <p data-reveal className="t-body text-fg-muted mb-14">
        {baseline.body}
      </p>

      <MachinePair labels={baseline.machineLabels} />

      <aside data-reveal className="callout mt-8">
        <p>{baseline.callout}</p>
      </aside>
    </SectionShell>
  );
}
