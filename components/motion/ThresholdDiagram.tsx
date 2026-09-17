"use client";

import { useEffect, useRef } from "react";
import { toPathData, type Point } from "@/lib/trace";
import type { LimitsDiagramLabels } from "@/lib/data/types";

const W = 1000;
const BASE = 272;
const PEAK = 216;
const SAMPLES = 120;

const HEALTHY = { mu: 0.36, sigma: 0.1 };
const FAULTY = { mu: 0.63, sigma: 0.11 };

/** Where the threshold sweeps between as the section scrolls past. */
const SWEEP = { from: 0.42, to: 0.58, rest: 0.5 };

const gauss = (x: number, { mu, sigma }: { mu: number; sigma: number }) =>
  Math.exp(-((x - mu) ** 2) / (2 * sigma ** 2));

const pt = (x: number, dist: typeof HEALTHY): Point => ({
  x: x * W,
  y: BASE - PEAK * gauss(x, dist),
});

function curve(dist: typeof HEALTHY) {
  const points: Point[] = [];
  for (let i = 0; i <= SAMPLES; i++) points.push(pt(i / SAMPLES, dist));
  return toPathData(points);
}

/** Area under `dist` between a and b, closed down to the baseline. */
function area(dist: typeof HEALTHY, a: number, b: number) {
  const points: Point[] = [{ x: a * W, y: BASE }, pt(a, dist)];
  for (let i = 0; i <= SAMPLES; i++) {
    const x = i / SAMPLES;
    if (x > a && x < b) points.push(pt(x, dist));
  }
  points.push(pt(b, dist), { x: b * W, y: BASE });
  return `${toPathData(points)}Z`;
}

const HEALTHY_CURVE = curve(HEALTHY);
const FAULTY_CURVE = curve(FAULTY);

/**
 * The trade-off in the limits section, drawn. Moving the threshold right
 * shrinks the false alarms and grows the missed faults; moving it left does the
 * reverse. Scroll sweeps it once so the reader watches that happen.
 *
 * The x axis is a score, not time, so this drawing does not mirror in RTL.
 */
export default function ThresholdDiagram({ labels }: { labels: LimitsDiagramLabels }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const falseRef = useRef<SVGPathElement>(null);
  const missedRef = useRef<SVGPathElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const place = (tau: number) => {
      falseRef.current?.setAttribute("d", area(HEALTHY, tau, 1));
      missedRef.current?.setAttribute("d", area(FAULTY, 0, tau));
      lineRef.current?.setAttribute("x1", `${tau * W}`);
      lineRef.current?.setAttribute("x2", `${tau * W}`);
      if (tagRef.current) tagRef.current.style.left = `${tau * 100}%`;
    };

    let cancelled = false;
    let kill = () => {};
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ default: gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        const trigger = ScrollTrigger.create({
          trigger: root,
          start: "top 85%",
          end: "bottom 35%",
          scrub: true,
          onUpdate: (self) => place(SWEEP.from + (SWEEP.to - SWEEP.from) * self.progress),
        });
        kill = () => trigger.kill();
      },
    );

    return () => {
      cancelled = true;
      kill();
    };
  }, []);

  const tau = SWEEP.rest;

  return (
    // The paragraph beside this states the same trade-off in words, so the
    // drawing is hidden from assistive tech rather than read as loose labels.
    <div ref={rootRef} dir="ltr" aria-hidden>
      <div className="relative">
        <span
          ref={tagRef}
          className="t-label absolute -top-1 -translate-x-1/2 -translate-y-full whitespace-nowrap text-fg"
          style={{ left: `${tau * 100}%` }}
        >
          {labels.threshold}
        </span>

        <svg
          viewBox={`0 0 ${W} 290`}
          preserveAspectRatio="none"
          aria-hidden
          className="w-full h-[12rem] lg:h-[17rem] mt-8"
        >
          <defs>
            <pattern
              id="hatch"
              width={9}
              height={9}
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line x1={0} y1={0} x2={0} y2={9} stroke="var(--fg-muted)" strokeWidth={2.5} />
            </pattern>
          </defs>

          <line
            x1={0}
            y1={BASE}
            x2={W}
            y2={BASE}
            stroke="var(--rule)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />

          <path ref={falseRef} d={area(HEALTHY, tau, 1)} fill="url(#hatch)" />
          <path
            ref={missedRef}
            d={area(FAULTY, 0, tau)}
            fill="var(--fg)"
            fillOpacity={0.16}
          />

          <path
            d={HEALTHY_CURVE}
            fill="none"
            stroke="var(--trace)"
            strokeWidth={1.75}
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={FAULTY_CURVE}
            fill="none"
            stroke="var(--trace)"
            strokeWidth={1.75}
            strokeDasharray="7 5"
            vectorEffect="non-scaling-stroke"
          />

          <line
            ref={lineRef}
            x1={tau * W}
            y1={18}
            x2={tau * W}
            y2={BASE}
            stroke="var(--fg)"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      {/* Curve names sit under the axis, where the moving threshold never reaches. */}
      <div className="relative h-7 mt-1">
        {[
          { label: labels.healthy, at: HEALTHY.mu },
          { label: labels.faulty, at: FAULTY.mu },
        ].map(({ label, at }) => (
          <span
            key={label}
            className="absolute top-0 -translate-x-1/2 whitespace-nowrap text-[0.9rem] text-fg-muted"
            style={{ left: `${at * 100}%` }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* The legend follows the page direction even though the axis does not. */}
      <ul dir="auto" className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-[0.95rem]">
        <li className="flex items-center gap-3">
          <svg viewBox="0 0 18 18" aria-hidden className="size-[1.1rem] shrink-0">
            <rect width={18} height={18} fill="url(#hatch)" stroke="var(--fg-muted)" />
          </svg>
          {labels.falseAlarms}
        </li>
        <li className="flex items-center gap-3">
          <svg viewBox="0 0 18 18" aria-hidden className="size-[1.1rem] shrink-0">
            <rect
              width={18}
              height={18}
              fill="var(--fg)"
            fillOpacity={0.16}
              stroke="var(--fg-muted)"
            />
          </svg>
          {labels.missedFaults}
        </li>
      </ul>
    </div>
  );
}
