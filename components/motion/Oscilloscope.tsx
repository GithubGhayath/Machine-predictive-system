"use client";

import { useEffect, useRef } from "react";
import type { Point } from "@/lib/trace";

export interface OscilloscopeLayer {
  points: Point[];
  color: "paper" | "amber" | "steel";
  width?: number;
  dash?: number[];
}

export interface OscilloscopeFill {
  points: Point[];
  alpha?: number;
}

interface OscilloscopeProps {
  /** The coordinate space `points` were computed in — same box the old SVG used. */
  box: { w: number; h: number };
  layers: OscilloscopeLayer[];
  fill?: OscilloscopeFill;
  /** A dashed amber line at this y (box units) — the alarm threshold. No text: labels live in HTML, per the sibling drawings' own rule. */
  thresholdY?: number;
  className?: string;
  style?: React.CSSProperties;
}

const GRID_COLS = 16;
const GRID_ROWS = 5;

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.trim().replace("#", "");
  return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)];
}

/**
 * The oscilloscope screen every trace on the site draws itself onto: dark,
 * dot-grid reticle, a center hairline, then whatever lines the caller passes.
 * Deliberately dumb about what the data means — every variant (vibration,
 * temperature, current, the hero burst) still comes from the same
 * `buildTrace`/`signalAt` functions the old SVGs used, just handed to this as
 * plain points instead of path strings. Nothing here invents a reading.
 */
export default function Oscilloscope({
  box,
  layers,
  fill,
  thresholdY,
  className = "",
  style,
}: OscilloscopeProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const root = getComputedStyle(document.documentElement);
    const paper = hexToRgb(root.getPropertyValue("--paper") || "#eaedec");
    const steel = hexToRgb(root.getPropertyValue("--steel") || "#58676e");
    const amber = hexToRgb(root.getPropertyValue("--signal") || "#e9a23b");
    const rgba = (c: [number, number, number], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
    const solid: Record<OscilloscopeLayer["color"], string> = {
      paper: rgba(paper, 0.75),
      amber: rgba(amber, 0.95),
      steel: rgba(steel, 0.8),
    };

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const sx = w / box.w;
      const sy = h / box.h;
      const toPx = (p: Point): [number, number] => [p.x * sx, p.y * sy];
      const stroke = (points: Point[]) => {
        if (points.length < 2) return;
        ctx.beginPath();
        const [x0, y0] = toPx(points[0]);
        ctx.moveTo(x0, y0);
        for (let i = 1; i < points.length; i++) {
          const [x, y] = toPx(points[i]);
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      };

      // dot-grid reticle
      ctx.fillStyle = rgba(steel, 0.28);
      for (let c = 1; c < GRID_COLS; c++) {
        for (let r = 1; r < GRID_ROWS; r++) {
          ctx.beginPath();
          ctx.arc((c / GRID_COLS) * w, (r / GRID_ROWS) * h, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // center hairline
      ctx.strokeStyle = rgba(steel, 0.32);
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      if (fill) {
        ctx.beginPath();
        const [fx0, fy0] = toPx(fill.points[0]);
        ctx.moveTo(fx0, fy0);
        for (let i = 1; i < fill.points.length; i++) {
          const [x, y] = toPx(fill.points[i]);
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = rgba(steel, fill.alpha ?? 0.14);
        ctx.fill();
      }

      if (thresholdY !== undefined) {
        const y = thresholdY * sy;
        ctx.strokeStyle = rgba(amber, 0.55);
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 5]);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      for (const layer of layers) {
        ctx.strokeStyle = solid[layer.color];
        ctx.lineWidth = layer.width ?? (layer.color === "amber" ? 2 : 1.4);
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.setLineDash(layer.dash ?? []);
        stroke(layer.points);
      }
      ctx.setLineDash([]);
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
    // Most callers compute their geometry synchronously at render time, so
    // this would redraw with identical data on every parent re-render — but
    // HeroBurst fills its points in after mount (client-only, to avoid an
    // SSR layout computation), so a real re-run on data change is required,
    // not just on resize.
  }, [box, layers, fill, thresholdY]);

  return (
    <canvas
      ref={ref}
      className={`block size-full bg-[var(--deep)] ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}
