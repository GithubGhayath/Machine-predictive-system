/**
 * The handoff between two sections, drawn rather than cut. A thin rule wipes
 * across the boundary the same way every trace on the page draws on — reusing
 * MotionProvider's existing IntersectionObserver (it queries `.trace-draw`
 * generically), so this needs no motion code of its own. Steel only: it marks
 * a transition, not a reading, so it never takes the signal colour.
 */
export default function SectionBoundary() {
  return (
    <div
      aria-hidden="true"
      data-orientation="horizontal"
      className="trace-draw absolute inset-x-0 bottom-0 h-px bg-[var(--steel)] pointer-events-none z-[3]"
    />
  );
}
