"use client";

import { useState } from "react";
import type { LiveControlContent } from "@/lib/data/types";

/**
 * The recorder's run/hold switch. Anything that moves on its own for more than
 * five seconds needs a way to stop it (WCAG 2.2.2). CSS hides this switch when
 * there is nothing to stop: no JavaScript, or reduced motion.
 */
export default function LiveToggle({
  labels,
  className = "",
}: {
  labels: LiveControlContent;
  className?: string;
}) {
  const [held, setHeld] = useState(false);

  const toggle = () => {
    const next = !held;
    document
      .querySelectorAll("[data-live]")
      .forEach((strip) => strip.classList.toggle("is-held", next));
    setHeld(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={held}
      aria-label={held ? labels.resume : labels.pause}
      className={`live-toggle t-label items-center gap-2 min-h-11 px-3 border border-rule hover:border-fg-muted transition-colors ${className}`}
    >
      <span
        aria-hidden
        className={`size-2 rounded-full border border-fg ${held ? "" : "bg-fg"}`}
      />
      {held ? labels.held : labels.running}
    </button>
  );
}
