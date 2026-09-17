"use client";

import { useEffect, useRef } from "react";

const W = 1200;
const H = 96;

/** Deterministic pseudo-random — same output every render, no hydration mismatch. */
function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

/**
 * An irregular capture, not a clean sine: a drifting carrier, a second
 * harmonic, electrical noise, and sparse mechanical impulse spikes. Built in
 * fixed viewBox units (0..W, 0..H) regardless of the element's actual
 * rendered size — preserveAspectRatio="none" handles stretching to fit, so
 * the path itself must stay in one coordinate space or it only ever fills a
 * fraction of the box on any width but exactly 1200px.
 */
export function buildBurstPath(seed: number): string {
  const rand = lcg(seed);
  const cy = H * 0.5;
  const pts: [number, number][] = [];
  const N = 300;

  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x = t * W;

    const freq = 4.1 + rand() * 1.8;
    const amp = 0.22 * H * (0.7 + rand() * 0.6);
    const carrier = Math.sin(t * Math.PI * 2 * freq + rand() * 0.4) * amp;

    const h2 = Math.sin(t * Math.PI * 2 * (freq * 2.73) + rand()) * 0.07 * H;
    const hf = (rand() - 0.5) * 0.04 * H;
    const impulse = rand() > 0.965 ? (rand() > 0.5 ? 1 : -1) * rand() * 0.38 * H : 0;

    const y = cy + carrier + h2 + hf + impulse;
    pts.push([x, Math.max(4, Math.min(H - 4, y))]);
  }

  let d = `M ${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

/**
 * Full-bleed and static — the hero's ambient presence, not an instrument
 * reading. Every other trace on the page is a narrow chart strip with a
 * corridor band that a viewer is meant to read; this one is a texture. Drawn
 * once on the client so SSR ships an empty path with no layout shift, then
 * filled in immediately after mount.
 */
export default function HeroBurst({ rtl = false }: { rtl?: boolean }) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    pathRef.current?.setAttribute("d", buildBurstPath(0xdeadbeef));
  }, []);

  return (
    <div className="absolute inset-x-0 bottom-0 h-24 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-x-0"
        style={{ top: "25%", bottom: "25%", background: "var(--corridor)" }}
      />
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="block size-full"
        style={{ transform: rtl ? "scaleX(-1)" : undefined }}
        aria-hidden="true"
      >
        <path
          ref={pathRef}
          fill="none"
          stroke="rgba(234,237,236,0.55)"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
