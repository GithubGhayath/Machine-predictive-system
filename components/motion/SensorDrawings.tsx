import { buildTrace, segmentStart, smoothstep, toPathData, type Point } from "@/lib/trace";

/**
 * Three instruments, three drawings. They are deliberately different shapes and
 * heights: a waveform, a rising curve against a threshold, and a modulated
 * envelope. Nothing here is a card.
 *
 * Labels live in HTML, never inside the SVGs: these drawings stretch to their
 * box and mirror in RTL, and both would distort text.
 *
 * Amber appears only where the argument puts it. Temperature takes the warning
 * colour after it crosses its threshold, and only because vibration is already
 * out of band above it. It never earns the colour alone.
 */

/** The early channel: a signature that starts to leave its band partway along. */
export function VibrationDrawing() {
  const box = { w: 1000, h: 150 };
  const geo = buildTrace({
    t0: segmentStart(6),
    span: 30,
    width: box.w,
    height: box.h,
    deviation: (p) => smoothstep(0.4, 0.75, p),
    samples: 320,
  });

  return (
    <svg
      viewBox={`0 0 ${box.w} ${box.h}`}
      preserveAspectRatio="none"
      aria-hidden
      className="trace-flow w-full h-[7.5rem] lg:h-[9rem]"
    >
      <rect
        x={0}
        y={geo.bandTop}
        width={box.w}
        height={geo.bandBottom - geo.bandTop}
        fill="var(--corridor)"
      />
      <path
        d={geo.d}
        fill="none"
        stroke="var(--trace)"
        strokeWidth={1.5}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {geo.outOfBand.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="var(--signal)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

/** Where the temperature rise is steepest. It crosses its threshold at ~0.72. */
const TEMPERATURE_RISE_MIDPOINT = 0.62;
/** Where vibration starts leaving its band — well before temperature crosses. */
const VIBRATION_ONSET = 0.24;

export function TemperatureDrawing({
  vibrationLabel,
  unit,
}: {
  vibrationLabel: string;
  unit: string;
}) {
  const box = { w: 1000, h: 170 };
  const threshold = 70;
  const samples = 200;

  // Lane 1: vibration, calm at first, then out of band from the onset onward.
  const vibration = buildTrace({
    t0: segmentStart(6) + 30,
    span: 30,
    width: 1000,
    height: 64,
    deviation: (p) =>
      Math.min(1, Math.max(0, (p - VIBRATION_ONSET) / 0.12)),
    band: 0.26,
    amplitude: 0.34,
    samples: 300,
    precision: 1,
  });

  // Lane 2: temperature. A slow drift, then a rise that lags the vibration.
  const before: Point[] = [];
  const after: Point[] = [];
  for (let i = 0; i <= samples; i++) {
    const p = i / samples;
    const rise = 1 / (1 + Math.exp(-(p - TEMPERATURE_RISE_MIDPOINT) * 12));
    const point = { x: p * box.w, y: 150 - p * 14 - rise * 92 };
    if (point.y >= threshold) before.push(point);
    else after.push(point);
  }
  // Join the two runs so the curve is continuous across the crossing.
  if (before.length && after.length) after.unshift(before[before.length - 1]);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="t-label mb-1">{vibrationLabel}</p>
        <svg
          viewBox="0 0 1000 64"
          preserveAspectRatio="none"
          aria-hidden
          className="trace-flow w-full h-[3.5rem]"
        >
          <rect
            x={0}
            y={vibration.bandTop}
            width={1000}
            height={vibration.bandBottom - vibration.bandTop}
            fill="var(--corridor)"
          />
          <path
            d={vibration.d}
            fill="none"
            stroke="var(--trace)"
            strokeWidth={1.25}
            vectorEffect="non-scaling-stroke"
          />
          {vibration.outOfBand.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="var(--signal)"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      </div>

      <div>
        <p className="t-label mb-1">
          <span className="num">{unit}</span>
        </p>
        <svg
          viewBox={`0 0 ${box.w} ${box.h}`}
          preserveAspectRatio="none"
          aria-hidden
          className="trace-flow w-full h-[8rem] lg:h-[9.5rem]"
        >
          <line
            x1={0}
            y1={threshold}
            x2={box.w}
            y2={threshold}
            stroke="var(--rule)"
            strokeWidth={1}
            strokeDasharray="4 6"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={toPathData(before)}
            fill="none"
            stroke="var(--trace)"
            strokeWidth={1.75}
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={toPathData(after)}
            fill="none"
            stroke="var(--signal)"
            strokeWidth={2.5}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
}

export function CurrentDrawing() {
  const box = { w: 1000, h: 130 };
  const mid = box.h / 2;
  const samples = 260;

  const upper: Point[] = [];
  const lower: Point[] = [];
  for (let i = 0; i <= samples; i++) {
    const p = i / samples;
    const t = p * 26;
    const envelope =
      (0.62 + 0.24 * Math.sin(t * 0.9) + 0.1 * Math.sin(t * 2.7)) * (mid * 0.82);
    upper.push({ x: p * box.w, y: mid - envelope });
    lower.push({ x: p * box.w, y: mid + envelope });
  }

  const envelopeArea = `${toPathData([...upper, ...[...lower].reverse()])}Z`;

  return (
    <svg
      viewBox={`0 0 ${box.w} ${box.h}`}
      preserveAspectRatio="none"
      aria-hidden
      className="trace-flow w-full h-[6.5rem] lg:h-[7.5rem]"
    >
      <path d={envelopeArea} fill="var(--corridor)" />
      <path
        d={toPathData(upper)}
        fill="none"
        stroke="var(--trace)"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={toPathData(lower)}
        fill="none"
        stroke="var(--trace)"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={0}
        y1={mid}
        x2={box.w}
        y2={mid}
        stroke="var(--rule)"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
