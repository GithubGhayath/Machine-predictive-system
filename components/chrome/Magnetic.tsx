"use client";

import { useEffect } from "react";

const SELECTOR = ".cta-solid, .cta-quiet, .lang-switch, .hamburger";
const PULL = 4;

/**
 * A slight magnetic pull: while the pointer is over a control it leans a few
 * pixels toward it. Pulling toward the pointer (never away) means the edge
 * under the cursor always moves under it, so the control can't jitter out from
 * beneath its own hover. One delegated listener, no per-button setup.
 * Skipped for touch and reduced motion.
 */
export default function Magnetic() {
  useEffect(() => {
    if (window.matchMedia("(hover: none), (prefers-reduced-motion: reduce)").matches) return;

    let active: HTMLElement | null = null;
    const release = (el: HTMLElement) => {
      el.style.removeProperty("--mx");
      el.style.removeProperty("--my");
    };

    const onMove = (event: PointerEvent) => {
      const el = (event.target as Element | null)?.closest<HTMLElement>(SELECTOR) ?? null;
      if (active && active !== el) release(active);
      active = el;
      if (!el || (el as HTMLButtonElement).disabled) return;

      const rect = el.getBoundingClientRect();
      const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      const clamp = (n: number) => Math.max(-1, Math.min(1, n));
      el.style.setProperty("--mx", `${(clamp(dx) * PULL).toFixed(2)}px`);
      el.style.setProperty("--my", `${(clamp(dy) * PULL).toFixed(2)}px`);
    };

    const onLeaveWindow = () => {
      if (active) release(active);
      active = null;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeaveWindow);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeaveWindow);
      if (active) release(active);
    };
  }, []);

  return null;
}
