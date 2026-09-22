import SectionBoundary from "@/components/chrome/SectionBoundary";
import WarningWindowClient from "./WarningWindowClient";
import WarningWindowStatic from "./WarningWindowStatic";
import { getWarningWindow } from "@/lib/data";
import type { Locale } from "@/lib/data/types";

/**
 * Both versions are in the HTML; CSS shows one. The scrub needs JavaScript and
 * motion, the static list needs neither.
 */
export default async function WarningWindow({ locale }: { locale: Locale }) {
  const content = await getWarningWindow(locale);
  if (!content) return null;

  return (
    <div id="warning-window" className="scroll-mt-[var(--nav-h)]">
      <WarningWindowStatic stages={content.stages} locale={locale} />
      <WarningWindowClient stages={content.stages} locale={locale} />

      <section data-ground="paper" data-reveal-group className="relative pt-8 pb-12">
        <div className="shell">
          <p data-reveal className="t-body text-fg-muted">
            {content.closing}
          </p>
        </div>
        <SectionBoundary />
      </section>
    </div>
  );
}
