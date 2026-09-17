"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildTrace, DEFAULT_AMPLITUDE, signalAt } from "@/lib/trace";
import { BOX, Band, SPAN, T0, storyDeviation } from "./warning-window-story";
import type { WarningStage } from "@/lib/data/types";

/**
 * The scroll-scrubbed chart. Only shown with JavaScript and without reduced
 * motion; WarningWindowStatic covers every other case.
 */
export default function WarningWindowClient({ stages }: { stages: WarningStage[] }) {
  const { geometry, deviation } = useMemo(() => {
    const deviation = storyDeviation(stages);
    const geometry = buildTrace({
      t0: T0,
      span: SPAN,
      width: BOX.w,
      height: BOX.h,
      deviation,
      samples: 520,
    });
    return { geometry, deviation };
  }, [stages]);

  const trackRef = useRef<HTMLElement>(null);
  const revealRef = useRef<SVGRectElement>(null);
  const headRef = useRef<HTMLSpanElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const place = (p: number) => {
      revealRef.current?.setAttribute("width", `${p * BOX.w}`);

      const t = T0 + p * SPAN;
      const y = geometry.mid + signalAt(t, deviation(p)) * DEFAULT_AMPLITUDE * BOX.h;
      if (headRef.current) {
        headRef.current.style.left = `${p * 100}%`;
        headRef.current.style.top = `${(y / BOX.h) * 100}%`;
      }

      const index = Math.min(Math.floor(p * stages.length), stages.length - 1);
      if (index !== activeRef.current) {
        activeRef.current = index;
        track.dataset.ground = stages[index].ground;
        setActive(index);
      }
    };

    // GSAP loads after first paint; the track is below the fold anyway.
    let cancelled = false;
    let kill = () => {};
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ default: gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        const trigger = ScrollTrigger.create({
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => place(self.progress),
          onRefresh: (self) => place(self.progress),
        });
        kill = () => trigger.kill();
      },
    );

    return () => {
      cancelled = true;
      kill();
    };
  }, [geometry.mid, deviation, stages]);

  return (
    <section
      ref={trackRef}
      data-ground={stages[0].ground}
      // Read by scripts/screenshots.mjs to measure how much of the track each
      // ground occupies.
      data-stage-grounds={stages.map((stage) => stage.ground).join(",")}
      className="motion-only scrub-track relative"
      style={{ "--stages": stages.length } as React.CSSProperties}
    >
      <div className="sticky top-0 min-h-[100svh] flex flex-col justify-center overflow-clip pt-[var(--nav-h)]">
        <div className="shell w-full">
          <div className="relative min-h-[15rem] md:min-h-[11rem]">
            {stages.map((stage, i) => (
              // Inactive stages are only faded, not hidden from assistive tech:
              // a screen reader reads all four in order without having to
              // scroll the track.
              <div
                key={stage.id}
                className="absolute inset-0 transition-[opacity,translate] duration-500"
                style={{
                  opacity: i === active ? 1 : 0,
                  translate: i === active ? "0 0" : "0 0.6rem",
                  pointerEvents: i === active ? "auto" : "none",
                }}
              >
                <h3 className="t-h3 mb-3 max-w-[46ch]">{stage.title}</h3>
                <p className="t-body text-fg-muted">{stage.body}</p>
              </div>
            ))}
          </div>

          {/* The wrapper mirrors in RTL, so the chart and its pen tip flip together. */}
          <div aria-hidden className="trace-flow relative mt-8">
            <svg
              viewBox={`0 0 ${BOX.w} ${BOX.h}`}
              preserveAspectRatio="none"
              className="block w-full h-[10rem] lg:h-[15rem]"
            >
              <defs>
                <clipPath id="warning-window-pen">
                  <rect ref={revealRef} x={0} y={0} width={0} height={BOX.h} />
                </clipPath>
              </defs>

              <Band top={geometry.bandTop} bottom={geometry.bandBottom} />

              {/* stage boundaries */}
              {stages.slice(1).map((stage, i) => (
                <line
                  key={stage.id}
                  x1={((i + 1) / stages.length) * BOX.w}
                  y1={0}
                  x2={((i + 1) / stages.length) * BOX.w}
                  y2={BOX.h}
                  stroke="var(--rule)"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              ))}

              <g clipPath="url(#warning-window-pen)">
                <path
                  d={geometry.d}
                  fill="none"
                  stroke="var(--trace)"
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                {geometry.outOfBand.map((d, i) => (
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
              </g>
            </svg>

            {/* The pen tip is HTML: inside the stretched viewBox a circle would
                render as a flattened ellipse. */}
            <span
              ref={headRef}
              className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg"
              style={{ left: 0, top: `${(geometry.mid / BOX.h) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
