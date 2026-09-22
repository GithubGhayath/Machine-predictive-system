"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { buildTrace, SEGMENT_SPAN, segmentStart, toPathData } from "@/lib/trace";
import { siteConfig } from "@/content/site.config";
import type { Locale } from "@/lib/data/types";

const STORAGE_KEY = "rasd:preloader-shown";
const MIN_DISPLAY_MS = 600;
const HARD_TIMEOUT_MS = 6000;
const EXIT_MS = 700;

const W = 1000;
const H = 116;
const T0 = segmentStart(0);

/** The whole signal, built once. The pen traces along it instead of rescaling it. */
const SIGNAL = buildTrace({
  t0: T0,
  span: SEGMENT_SPAN,
  width: W,
  height: H,
  deviation: 0,
  samples: 320,
  precision: 1,
}).points;

/** The signal up to `progress` (0..1), ending on an interpolated tip so the pen never jumps between samples. */
function traceUpTo(progress: number) {
  const last = SIGNAL.length - 1;
  const at = Math.min(1, Math.max(0, progress)) * last;
  const whole = Math.floor(at);
  const points = SIGNAL.slice(0, whole + 1);
  if (whole < last) {
    const a = SIGNAL[whole];
    const b = SIGNAL[whole + 1];
    const f = at - whole;
    points.push({ x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f });
  }
  return points;
}

/** Names shown in the console if the hard timeout fires before they settle. */
const GATE_NAMES = ["fonts", "hero video", "hero poster", "motion engine"] as const;

/**
 * The first thing built, because everything else renders behind it.
 *
 * A real gate, not a timed animation: it holds the page until the four things
 * the first screen actually needs are ready (or 6s pass, whichever first —
 * nobody on a bad connection gets stuck staring at a loader), then hands off
 * to the hero's own trace with one continuous line.
 *
 * Skipped entirely without JavaScript (see the .js-gated rule in globals.css)
 * and on every load after the first one this session (see the inline script
 * in layout.tsx, which hides it via CSS before this component ever hydrates).
 */
export default function Preloader({
  locale,
  loading,
}: {
  locale: Locale;
  /** The one string announced to assistive tech; null renders no announcement. */
  loading: string | null;
}) {
  const [mounted, setMounted] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(0); // eased, 0..1, what's drawn
  const [reducedMotion, setReducedMotion] = useState(false);
  const target = useRef(0); // real, stepped, 0..1
  const settled = useRef<boolean[]>([false, false, false, false]);
  const mountedAt = useRef(0);
  const dismissedRef = useRef(false);
  const reduced = useRef(false);

  // Layout effect, not a plain effect: it can still flip `reducedMotion`
  // before the browser paints the first frame, so a reduced-motion visitor
  // never sees the animated variant even for one frame.
  useLayoutEffect(() => {
    let alreadyShown = false;
    try {
      alreadyShown = !!sessionStorage.getItem(STORAGE_KEY);
    } catch {
      alreadyShown = true; // storage unavailable — don't risk blocking every load
    }
    if (alreadyShown) {
      // On a fresh document parse the inline script in layout.tsx already set
      // [data-preloader-skip] before this ever painted, so the CSS rule alone
      // would be enough. But page.tsx remounts this component on every
      // client-side route change too (e.g. the language switch), and that
      // inline script never re-runs there — only sessionStorage does, so this
      // is the one path that actually unmounts it in that case.
      setMounted(false);
      return;
    }

    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(reduced.current);
    mountedAt.current = performance.now();

    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    document.body.style.overflow = "hidden";

    const markSettled = (index: number) => {
      if (settled.current[index]) return;
      settled.current[index] = true;
      const count = settled.current.filter(Boolean).length;
      target.current = count / 4;
      // No rAF loop runs in this mode (see below), so this is the only place
      // the static variant's number ever moves — straight to each real value.
      if (reduced.current) setProgress(target.current);
      if (count === 4) finish();
    };

    const finish = () => {
      if (dismissedRef.current) return;
      dismissedRef.current = true;
      const elapsed = performance.now() - mountedAt.current;
      const wait = Math.max(0, MIN_DISPLAY_MS - elapsed);
      window.setTimeout(dismiss, wait);
    };

    const dismiss = () => {
      setExiting(true);
      // Fires the instant the exit starts, not after — the hero's cover
      // shrink and the loader's own fade begin in the same frame.
      window.dispatchEvent(new Event("rasd:preloader-exit"));
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* a private window with blocked storage just replays the intro next time */
      }
      window.setTimeout(() => {
        setMounted(false);
        document.body.style.overflow = "";
        window.scrollTo(scrollX, scrollY);
        document.getElementById("hero-heading")?.focus();
        // InViewVideo's own IntersectionObserver already fired once, while
        // this overlay still made the video count as hidden, and its one
        // .play() call was refused — so nothing will ever retry it on its
        // own. Now that this is actually gone, ask again.
        heroVideo?.play().catch(() => {});
      }, EXIT_MS);
    };

    // Gate 1 — both self-hosted font families for this locale, plus mono for
    // the digits shown right here. All three are already requested by the
    // SSR'd text under this component, so this promise reflects real network
    // time, not a guess.
    if (typeof document.fonts?.ready?.then === "function") {
      document.fonts.ready.then(() => markSettled(0)).catch(() => markSettled(0));
    } else {
      markSettled(0);
    }

    // Gates 2 & 3 — the hero clip's first frame and its poster. The video
    // sits in the DOM already (Hero renders underneath this overlay) with
    // preload="none", waiting for InViewVideo's own IntersectionObserver to
    // call .play() once visible. That never happens while this overlay is
    // up: Chromium refuses autoplay on video it judges hidden — "background
    // media... paused to save power" — and geometrically-in-viewport but
    // opaquely-covered qualifies. So loading a real frame here can't go
    // through .play() at all; it has to ask for the bytes directly.
    const heroVideo = document.querySelector<HTMLVideoElement>("[data-hero-video]");
    if (heroVideo) {
      if (heroVideo.readyState >= 3) markSettled(1);
      else {
        heroVideo.addEventListener("canplay", () => markSettled(1), { once: true });
        heroVideo.addEventListener("error", () => markSettled(1), { once: true });
        heroVideo.preload = "auto";
        heroVideo.load();
      }
      if (heroVideo.poster) {
        const img = new Image();
        img.onload = () => markSettled(2);
        img.onerror = () => markSettled(2);
        img.src = heroVideo.poster;
      } else {
        markSettled(2);
      }
    } else {
      // No footage registered for this slot — nothing to wait for.
      markSettled(1);
      markSettled(2);
    }

    // Gate 4 — GSAP + Lenis + ScrollTrigger. MotionProvider never reaches its
    // own ready signal under reduced motion (it returns before setting any of
    // this up), so that case is satisfied on its own terms instead.
    if (reduced.current) {
      markSettled(3);
    } else {
      window.addEventListener("rasd:motion-ready", () => markSettled(3), { once: true });
    }

    const hardTimeout = window.setTimeout(() => {
      if (dismissedRef.current) return;
      settled.current.forEach((done, i) => {
        if (!done) console.warn(`[preloader] timed out waiting on: ${GATE_NAMES[i]}`);
      });
      settled.current = [true, true, true, true];
      target.current = 1;
      finish();
    }, HARD_TIMEOUT_MS);

    // Visual easing only — the numbers above are the truth; this just keeps
    // the drawn line from snapping between the four real checkpoints. The
    // pace itself drifts (two out-of-phase sines modulate the easing rate), so
    // the pen slows into detail and hurries across flat stretches like a hand
    // or a scope beam following a live signal, not a constant sweep.
    let raf = 0;
    const tick = (now: number) => {
      const pace = 0.045 + 0.085 * (0.5 + 0.5 * Math.sin(now * 0.0031 + Math.sin(now * 0.0011) * 2.4));
      setProgress((current) => {
        const gap = target.current - current;
        const step = Math.max(Math.abs(gap) * pace, Math.min(Math.abs(gap), 0.0007));
        const next = current + Math.sign(gap) * step;
        return Math.abs(target.current - next) < 0.002 ? target.current : next;
      });
      raf = requestAnimationFrame(tick);
    };
    if (!reduced.current) raf = requestAnimationFrame(tick);

    return () => {
      window.clearTimeout(hardTimeout);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  if (!mounted) return null;

  const brand = siteConfig.brand.name[locale];
  const pct = Math.round(progress * 100);

  const drawn = reducedMotion ? [] : traceUpTo(progress);
  const tip = drawn[drawn.length - 1];

  return (
    <div
      id="rasd-preloader"
      role="status"
      dir={locale === "ar" ? "rtl" : "ltr"}
      data-exiting={exiting ? "" : undefined}
      className="preloader fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-[var(--deep)]"
    >
      <div className="flex items-center gap-2.5">
        <PreloaderMark />
        <span className="text-sm font-semibold tracking-tight text-[var(--paper)]">
          {brand}
        </span>
      </div>

      {/* Reduced motion: the mark and the number above and below are all
          there is — no growing line, matching "no animation" literally. */}
      {!reducedMotion ? (
        <div className="preloader-trace w-[min(86vw,28rem)]">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="block w-full h-auto overflow-visible"
            style={{ transform: locale === "ar" ? "scaleX(-1)" : undefined }}
            aria-hidden
          >
            {drawn.length > 1 ? (
              <path
                d={toPathData(drawn, 1)}
                fill="none"
                stroke="var(--paper)"
                strokeOpacity={0.9}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
            {tip && progress < 0.995 ? (
              <>
                <circle cx={tip.x} cy={tip.y} r={20} fill="var(--paper)" opacity={0.14} />
                <circle cx={tip.x} cy={tip.y} r={8} fill="var(--paper)" />
              </>
            ) : null}
          </svg>
        </div>
      ) : null}

      {loading ? <span className="sr-only">{loading}</span> : null}
      <span aria-live="polite" className="num t-label text-[var(--paper)]">
        {pct}%
      </span>
    </div>
  );
}

function PreloaderMark() {
  return (
    <svg viewBox="0 0 32 32" className="size-5" aria-hidden>
      <path
        d="M3 16 L6 14 L8 17.5 L10 15 L12 17 L14 15.5"
        fill="none"
        stroke="var(--paper)"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 15.5 L16 6 L18 26 L20 9 L22 16"
        fill="none"
        stroke="var(--steel)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 16 L24 14.5 L26 17 L29 16"
        fill="none"
        stroke="var(--paper)"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
