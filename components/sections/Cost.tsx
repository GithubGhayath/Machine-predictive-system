import SectionShell from "@/components/SectionShell";
import { getCostSection } from "@/lib/data";
import type { Locale } from "@/lib/data/types";

export default async function Cost({ locale }: { locale: Locale }) {
  const cost = await getCostSection(locale);
  if (!cost) return null;

  return (
    <SectionShell
      id="cost"
      index={1}
      ground="paper"
      unit="mm/s RMS"
      heading={cost.heading}
    >
      <p data-reveal className="t-body text-fg-muted">
        {cost.body}
      </p>
    </SectionShell>
  );
}
