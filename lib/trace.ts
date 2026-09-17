/**
 * The vibration trace.
 *
 * One continuous signal runs the length of the site. Every segment is a window
 * onto the same function of `t`, so a segment that starts where the previous
 * one ended joins it exactly — which is what lets the desktop gutter column and
 * the mobile fan-fold strips read as one chart recorder.
 *
 * Everything here is deterministic. SSR and the client must produce identical
 * path strings or React will complain about the mismatch, and the page must
 * still show a correct final state with JavaScript disabled.
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * Compact SVG path data: an absolute move, then relative lines. Deltas are
 * taken between already-rounded coordinates, so rounding never accumulates
 * along the line. Every trace ships twice (HTML and the React payload), so
 * this is most of the page's weight.
 *
 * `precision` is decimal places — 0 suits the 1000-unit drawings, small
 * illustrations want 1.
 */
export function toPathData(points: Point[], precision = 0): string {
  if (points.length === 0) return "";
  const scale = 10 ** precision;
  const snap = (n: number) => Math.round(n * scale);
  const text = (n: number) => String(n / scale);

  let px = snap(points[0].x);
  let py = snap(points[0].y);
  let d = `M${text(px)} ${text(py)}`;

  for (let i = 1; i < points.length; i++) {
    const x = snap(points[i].x);
    const y = snap(points[i].y);
    const dx = x - px;
    const dy = y - py;
    px = x;
    py = y;
    // A minus sign separates numbers on its own; anything else needs a space.
    d += (i === 1 ? "l" : dx < 0 ? "" : " ") + text(dx) + (dy < 0 ? "" : " ") + text(dy);
  }
  return d;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const k = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return k * k * (3 - 2 * k);
}

/** Deterministic value noise. Same input, same output, on any machine. */
function hash(n: number): number {
  const s = Math.sin(n * 127.1) * 43758.5453123;
  return s - Math.floor(s);
}

function valueNoise(x: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const smooth = f * f * (3 - 2 * f);
  return (hash(i) * (1 - smooth) + hash(i + 1) * smooth) * 2 - 1;
}

/**
 * The signal at position `t`, normalised to roughly [-1, 1].
 *
 * `deviation` 0 = the machine's learned normal: shaft rotation plus its second
 * harmonic and a little noise. As deviation rises, a higher-frequency component
 * grows — a bearing defect frequency, which is what actually appears in a real
 * signature before a race fails.
 */
export function signalAt(t: number, deviation: number): number {
  const rotation = Math.sin(t * 2.1) * 0.42;
  const harmonic = Math.sin(t * 4.3 + 0.8) * 0.16;
  const noise = valueNoise(t * 3.1) * 0.12;

  // ~4.4x shaft speed: clearly faster than rotation, and still sampled
  // cleanly at the densities the page draws.
  const defect = Math.sin(t * 9.3) * 0.75 * deviation;
  const defectEnvelope = (0.6 + 0.4 * Math.sin(t * 1.3)) * deviation;

  return rotation + harmonic + noise + defect * defectEnvelope;
}

export interface TraceGeometry {
  /** The whole trace as one path. */
  d: string;
  /** Sub-paths for the runs that sit outside the learned band. Stroke-only. */
  outOfBand: string[];
  /** Corridor edges in viewBox units. */
  bandTop: number;
  bandBottom: number;
  mid: number;
  /** Path length approximation, for dash-based draw-on. */
  length: number;
}

export interface TraceOptions {
  /** Where this window starts on the global signal. Gives fan-fold continuity. */
  t0: number;
  /** How much of the signal this window covers. */
  span: number;
  width: number;
  height: number;
  /**
   * 0 = inside the band, 1 = clearly outside it. A function receives progress
   * along the window (0–1), for a fault that develops within one drawing.
   */
  deviation: number | ((progress: number) => number);
  /**
   * Half-height of the learned normal band, as a fraction of height. The
   * default contains a healthy signal and an early drift (deviation ≤ 0.4)
   * completely — measured peaks 0.32 and 0.35 — so neither ever shows amber,
   * while a confirmed fault (deviation 1) leaves it again and again.
   */
  band?: number;
  /** Peak signal excursion, as a fraction of height. */
  amplitude?: number;
  samples?: number;
  /** Render down the page instead of across it (the desktop gutter). */
  vertical?: boolean;
  /** Decimal places in the path data. */
  precision?: number;
}

export const DEFAULT_BAND = 0.38;
export const DEFAULT_AMPLITUDE = 0.46;

export function buildTrace({
  t0,
  span,
  width,
  height,
  deviation,
  band = DEFAULT_BAND,
  amplitude: amplitudeFraction = DEFAULT_AMPLITUDE,
  samples = 220,
  vertical = false,
  precision = 0,
}: TraceOptions): TraceGeometry {
  const along = vertical ? height : width;
  const across = vertical ? width : height;
  const mid = across / 2;
  const bandHalf = across * band;
  const amplitude = across * amplitudeFraction;

  const points: { x: number; y: number; out: boolean }[] = [];

  for (let i = 0; i <= samples; i++) {
    const progress = i / samples;
    const t = t0 + progress * span;
    const value = signalAt(
      t,
      typeof deviation === "function" ? deviation(progress) : deviation,
    );
    const offset = value * amplitude;

    const alongPx = progress * along;
    const acrossPx = mid + offset;

    points.push({
      x: vertical ? acrossPx : alongPx,
      y: vertical ? alongPx : acrossPx,
      out: Math.abs(offset) > bandHalf,
    });
  }

  const d = toPathData(points, precision);

  // Contiguous runs outside the band become their own stroke-only sub-paths.
  const outOfBand: string[] = [];
  let run: typeof points = [];
  const flush = () => {
    if (run.length > 1) outOfBand.push(toPathData(run, precision));
    run = [];
  };

  for (let i = 0; i < points.length; i++) {
    if (points[i].out) {
      // Include the neighbouring in-band point so the run meets the main trace.
      if (run.length === 0 && i > 0) run.push(points[i - 1]);
      run.push(points[i]);
    } else {
      if (run.length > 0) run.push(points[i]);
      flush();
    }
  }
  flush();

  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }

  return {
    d,
    outOfBand,
    bandTop: mid - bandHalf,
    bandBottom: mid + bandHalf,
    mid,
    length: Math.ceil(length),
  };
}

/**
 * The hero's live strip: `span` of healthy signal whose last quarter blends
 * back into its own start, drawn twice side by side. Sliding the strip by
 * exactly one period therefore shows no seam.
 */
export function buildLoopTrace({
  t0,
  span,
  width,
  height,
  band = DEFAULT_BAND,
  amplitude = DEFAULT_AMPLITUDE,
  samples = 260,
}: {
  t0: number;
  span: number;
  width: number;
  height: number;
  band?: number;
  amplitude?: number;
  samples?: number;
}) {
  const mid = height / 2;
  const values: number[] = [];
  for (let i = 0; i < samples; i++) {
    const p = i / samples;
    const t = t0 + p * span;
    const blend = smoothstep(0.75, 1, p);
    values.push((1 - blend) * signalAt(t, 0) + blend * signalAt(t - span, 0));
  }

  const y = (value: number) => mid + value * height * amplitude;
  const points: Point[] = [];
  for (let copy = 0; copy < 2; copy++) {
    for (let i = 0; i < samples; i++) {
      points.push({ x: (copy + i / samples) * width, y: y(values[i]) });
    }
  }
  // The period ends where it began.
  points.push({ x: 2 * width, y: y(values[0]) });

  return {
    d: toPathData(points),
    bandTop: mid - height * band,
    bandBottom: mid + height * band,
  };
}

/**
 * Where each section's window sits on the global signal. Consecutive entries
 * are contiguous, so the trace joins across the whole page.
 */
export const SEGMENT_SPAN = 26;

export function segmentStart(index: number): number {
  return index * SEGMENT_SPAN;
}
