"use client";

import { useEffect, useRef } from "react";

interface InViewVideoProps {
  webm?: string;
  mp4?: string;
  poster?: string;
  label?: string;
  className?: string;
  /** Identifies the hero's own clip, so the preloader can gate on its first frame. */
  isHero?: boolean;
}

/**
 * Plays only while on screen, and never under reduced motion — then it is just
 * its poster frame. Pausing off screen keeps phones cool on a long page.
 */
export default function InViewVideo({
  webm,
  mp4,
  poster,
  label,
  className,
  isHero,
}: InViewVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.15 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      data-hero-video={isHero ? "" : undefined}
      className={className}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {webm ? <source src={webm} type="video/webm" /> : null}
      {mp4 ? <source src={mp4} type="video/mp4" /> : null}
    </video>
  );
}
