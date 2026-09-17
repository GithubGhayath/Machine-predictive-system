"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Locale, NavLink } from "@/lib/data/types";

const LABELS: Record<Locale, { menu: string; close: string }> = {
  ar: { menu: "القائمة", close: "إغلاق" },
  en: { menu: "Menu", close: "Close" },
};

interface NavBarProps {
  locale: Locale;
  otherLocale: Locale;
  brandName: string;
  otherBrandName: string;
  links: NavLink[];
  languageLabel: string;
  skipToContent: string;
}

/**
 * The bar itself carries only the logo and the menu toggle — every link lives
 * in the full-screen overlay this opens. Transparent over the hero at rest,
 * so the video reads uninterrupted; scrolling any distance swaps in a
 * blurred ground so the bar stays legible once it's sitting over page
 * content instead of the video. The hairline underneath is a plain scroll
 * progress read-out, not a data trace, so it stays steel — the amber rule
 * covers instrument readings and the primary button, nothing decorative.
 */
export default function NavBar({
  locale,
  otherLocale,
  brandName,
  otherBrandName,
  links,
  languageLabel,
  skipToContent,
}: NavBarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const labels = LABELS[locale];

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      setScrolled(window.scrollY > 8);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstLinkRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      toggleRef.current?.focus();
    };
  }, [open]);

  return (
    <header
      data-ground="deep"
      data-scrolled={scrolled ? "" : undefined}
      className="nav-bar fixed inset-x-0 top-0 z-50 h-[var(--nav-h)]"
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:bg-fg focus:text-ground focus:px-3 focus:py-2"
      >
        {skipToContent}
      </a>

      <div className="shell relative z-40 flex h-full items-center justify-between gap-6">
        <Link
          href={`/${locale}`}
          prefetch={false}
          className="flex items-baseline gap-2.5 text-fg"
        >
          <span className="font-semibold text-lg">{brandName}</span>
          <span lang={otherLocale} className="t-label">
            {otherBrandName}
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href={`/${otherLocale}`} hrefLang={otherLocale} prefetch={false} className="lang-switch">
            {languageLabel}
          </Link>

          <button
            ref={toggleRef}
            type="button"
            className="hamburger"
            data-open={open ? "" : undefined}
            aria-expanded={open}
            aria-controls="nav-overlay"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? labels.close : labels.menu}</span>
            <span className="hamburger-line hamburger-line--top" aria-hidden="true" />
            <span className="hamburger-line hamburger-line--mid" aria-hidden="true" />
            <span className="hamburger-line hamburger-line--bottom" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        className="nav-progress"
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden="true"
      />

      <div id="nav-overlay" className="nav-overlay" data-open={open ? "" : undefined}>
        <nav aria-label={labels.menu} className="nav-overlay-list">
          {links.map((link, i) => (
            <a
              key={link.href}
              ref={i === 0 ? firstLinkRef : undefined}
              href={link.href}
              className="nav-overlay-link"
              style={{ "--i": i } as React.CSSProperties}
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
            >
              <span className="num t-label" aria-hidden="true">
                0{i + 1}
              </span>
              <span>{link.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
