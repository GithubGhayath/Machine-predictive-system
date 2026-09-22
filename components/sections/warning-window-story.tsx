import { SEGMENT_SPAN, segmentStart, smoothstep } from "@/lib/trace";
import type { Locale, WarningStage } from "@/lib/data/types";

/** Shared by the server-rendered static stages and the client scrub. */

export const BOX = { w: 1000, h: 300 };
export const T0 = segmentStart(2);
/** Two segments' worth of signal: dense enough to read as vibration, sparse
    enough to stay legible across a phone screen. */
export const SPAN = SEGMENT_SPAN * 2;

/**
 * How far the machine sits from its learned normal at each point of the story,
 * with p running 0 → 1 across all four stages. The chart carries its own
 * history — calm, a drift that stays inside the band, a confirmed excursion,
 * then the repair — and scrolling only moves the pen through it. That keeps the
 * amber exactly where the copy says the alert happens.
 */
export function storyDeviation(stages: WarningStage[]) {
  const n = stages.length;
  return (p: number) => {
    const scaled = Math.min(p * n, n - 1e-6);
    const i = Math.floor(scaled);
    const within = scaled - i;
    const from = i === 0 ? stages[0].deviation : stages[i - 1].deviation;
    const to = stages[i].deviation;
    // Each stage eases from the previous reading to its own, early, then holds —
    // so the text and the chart agree for most of the stage. A fault develops
    // over a while; a repair ends it at once.
    const settle = to > from ? 0.3 : 0.06;
    return from + (to - from) * smoothstep(0, settle, within);
  };
}

const STATUS_LABEL: Record<Locale, { normal: string; drift: string; alert: string }> = {
  ar: { normal: "طبيعي", drift: "انحراف", alert: "تنبيه" },
  en: { normal: "NORMAL", drift: "DRIFT", alert: "ALERT" },
};

/**
 * The live status word beside the trace, derived from the same deviation
 * number that drives the chart — never a separate, hand-typed state, so the
 * two can't drift apart. Amber only crosses over at the same threshold the
 * out-of-band paths already use for their own colour.
 */
export function readoutFor(locale: Locale, deviation: number) {
  const labels = STATUS_LABEL[locale];
  if (deviation >= 0.7) return { label: labels.alert, alert: true };
  if (deviation >= 0.25) return { label: labels.drift, alert: false };
  return { label: labels.normal, alert: false };
}

export function Band({ top, bottom }: { top: number; bottom: number }) {
  return (
    <>
      <rect x={0} y={top} width={BOX.w} height={bottom - top} fill="var(--corridor)" />
      {[top, bottom].map((edge, i) => (
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
    </>
  );
}
