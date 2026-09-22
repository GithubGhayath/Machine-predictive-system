import SectionShell from "@/components/SectionShell";
import StillImage from "@/components/media/StillImage";
import TraceScope from "@/components/motion/TraceScope";
import { getCostSection } from "@/lib/data";
import { segmentStart } from "@/lib/trace";
import type { Locale } from "@/lib/data/types";

/**
 * The reading stays with the paragraph that describes it, instead of sitting
 * above the section as a disconnected header band: a sticky column holds the
 * trace — the moment described in the text, a signal that runs steady and
 * then spikes out of band — beside the copy as it scrolls past.
 */
export default async function Cost({ locale }: { locale: Locale }) {
  const cost = await getCostSection(locale);
  if (!cost) return null;

  return (
    <SectionShell id="cost" index={1} ground="paper" trace={false} heading={cost.heading}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        <div className="lg:col-span-7 flex flex-col gap-7">
          <p data-reveal className="t-body text-fg-muted">
            {cost.body}
          </p>
          {cost.callout ? (
            <aside data-reveal className="callout">
              <p>{cost.callout}</p>
            </aside>
          ) : null}
        </div>

        <div
          data-reveal
          className="lg:col-span-5 lg:sticky lg:top-[calc(var(--nav-h)+2rem)] flex flex-col gap-6"
        >
          <TraceScope
            t0={segmentStart(1)}
            span={16}
            deviation={(p) => (p > 0.6 ? 1 : 0)}
            heightClass="h-[7rem] lg:h-[8.5rem]"
          />
          <StillImage
            src="/images/factory-wide.webp"
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="aspect-[4/3]"
          />
        </div>
      </div>
    </SectionShell>
  );
}
