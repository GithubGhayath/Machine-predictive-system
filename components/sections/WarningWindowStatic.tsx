import { buildTrace, SEGMENT_SPAN } from "@/lib/trace";
import { BOX, Band, T0, readoutFor, storyDeviation } from "./warning-window-story";
import type { Locale, WarningStage } from "@/lib/data/types";

/**
 * Without motion (or without JavaScript): every stage in order, each showing
 * its own stretch of the chart. Server-rendered — it never changes.
 */
export default function WarningWindowStatic({
  stages,
  locale,
}: {
  stages: WarningStage[];
  locale: Locale;
}) {
  const deviation = storyDeviation(stages);
  const n = stages.length;

  return (
    <div className="static-only">
      {stages.map((stage, i) => {
        // Each static strip is full width, so it gets a full segment of signal.
        const geo = buildTrace({
          t0: T0 + SEGMENT_SPAN * i,
          span: SEGMENT_SPAN,
          width: BOX.w,
          height: BOX.h,
          deviation: (q) => deviation((i + q) / n),
          samples: 260,
        });

        return (
          <div
            key={stage.id}
            data-ground={stage.ground}
            className="bg-ground text-fg py-8 lg:py-14"
          >
            <div className="shell">
              {(() => {
                const readout = readoutFor(locale, stage.deviation);
                return (
                  <p className="status-readout mb-4" data-alert={readout.alert ? "" : undefined}>
                    {readout.label}
                  </p>
                );
              })()}
              <h3 className="t-h3 mb-3 max-w-[46ch]">{stage.title}</h3>
              <p className="t-body text-fg-muted mb-8">{stage.body}</p>
              <svg
                viewBox={`0 0 ${BOX.w} ${BOX.h}`}
                preserveAspectRatio="none"
                aria-hidden
                className="trace-flow w-full h-[8rem] lg:h-[11rem]"
              >
                <Band top={geo.bandTop} bottom={geo.bandBottom} />
                <path
                  d={geo.d}
                  fill="none"
                  stroke="var(--trace)"
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                {geo.outOfBand.map((d, j) => (
                  <path
                    key={j}
                    d={d}
                    fill="none"
                    stroke="var(--signal)"
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}
