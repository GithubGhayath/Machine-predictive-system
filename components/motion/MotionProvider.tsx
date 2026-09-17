"use client";

import { useEffect } from "react";

/**
 * One place wires every scroll behaviour on the site. Sections declare intent
 * with attributes and stay free of motion code:
 *
 *   data-reveal-group   a block whose children reveal together, once
 *   data-reveal         an element in that orchestration
 *   data-reveal="mask"  same, but rising out of a clipped container
 *   .trace-draw         a trace that wipes on when it scrolls into view
 *   data-live           a strip that crawls; paused while off screen
 *
 * There is deliberately one reveal vocabulary, not a different effect per
 * section. Headings rise out of a mask as whole blocks rather than being split
 * into lines: line-splitting reflows Arabic and risks breaking connected
 * letterforms, and a block mask reads the same in both scripts.
 *
 * Nothing is hidden before this runs, so the page is complete without it.
 * Groups already on screen when it runs are left alone rather than hidden and
 * replayed — that would be a visible flash. GSAP and Lenis load after first
 * paint, so they never delay the page becoming usable.
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // The hero trace's first-pass reveal used to run on its own fixed delay.
    // Now the preloader owns that moment on a first visit — it dispatches
    // this the instant it starts exiting, so the loader's own trace and the
    // hero's crawling one meet with no gap. On a repeat visit this session
    // the preloader never mounts at all, so nothing will ever fire the
    // event; fall back to the old delay so the reveal still happens once.
    const reveal = () =>
      document.querySelectorAll(".trace-cover").forEach((el) => el.classList.add("reveal"));

    let revealedByPreloader = false;
    window.addEventListener(
      "rasd:preloader-exit",
      () => {
        revealedByPreloader = true;
        reveal();
      },
      { once: true },
    );
    const fallback = window.setTimeout(() => {
      if (!revealedByPreloader) reveal();
    }, 300);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => window.clearTimeout(fallback);
    }

    // Traces: the CSS wipe starts when the pen reaches the paper.
    const traces = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-drawn");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    document.querySelectorAll(".trace-draw").forEach((trace) => traces.observe(trace));

    // The live strip stops crawling while nobody can see it.
    const live = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle("is-paused", !entry.isIntersecting);
      }
    });
    document.querySelectorAll("[data-live]").forEach((strip) => live.observe(strip));

    let cancelled = false;
    let teardown = () => {};

    Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      import("gsap/CustomEase"),
      import("lenis"),
    ]).then(([{ default: gsap }, { ScrollTrigger }, { CustomEase }, { default: Lenis }]) => {
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger, CustomEase);
      CustomEase.create("rasd", "0.62, 0.05, 0, 1");

      const navHeight =
        document.querySelector("header")?.getBoundingClientRect().height ?? 0;

      const lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        anchors: { offset: -navHeight },
      });
      lenis.on("scroll", ScrollTrigger.update);

      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-reveal-group]").forEach((group) => {
          if (group.getBoundingClientRect().top < window.innerHeight) return;

          // Only this group's own items; a nested group orchestrates its own.
          const items = gsap.utils
            .toArray<HTMLElement>("[data-reveal]", group)
            .filter((item) => item.closest("[data-reveal-group]") === group);
          if (items.length === 0) return;

          // Opacity only. autoAlpha would also set visibility: hidden, which
          // takes unrevealed text out of the accessibility tree — a screen
          // reader could never reach it, so it would never scroll in and be
          // revealed.
          const masks = items.filter((item) => item.dataset.reveal === "mask");
          const rest = items.filter((item) => item.dataset.reveal !== "mask");
          if (masks.length) gsap.set(masks, { opacity: 0, yPercent: 100 });
          if (rest.length) gsap.set(rest, { opacity: 0, y: 14 });

          ScrollTrigger.batch(items, {
            start: "top 88%",
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, {
                opacity: 1,
                y: 0,
                yPercent: 0,
                duration: 0.9,
                ease: "rasd",
                stagger: 0.07,
                overwrite: true,
              }),
          });
        });
      });

      teardown = () => {
        ctx.revert();
        gsap.ticker.remove(tick);
        lenis.destroy();
      };

      // The preloader's fourth gate: GSAP, Lenis and every ScrollTrigger batch
      // are registered. Under reduced motion this file returns before reaching
      // here, so the preloader treats that case as satisfied on its own.
      window.dispatchEvent(new Event("rasd:motion-ready"));
    });

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      traces.disconnect();
      live.disconnect();
      teardown();
    };
  }, []);

  return <>{children}</>;
}
