import SectionShell from "@/components/SectionShell";
import ThresholdDiagram from "@/components/motion/ThresholdDiagram";
import { getLimits } from "@/lib/data";
import type { Locale } from "@/lib/data/types";

export default async function Limits({ locale }: { locale: Locale }) {
  const limits = await getLimits(locale);
  if (!limits) return null;

  return (
    <SectionShell id="limits" index={9} ground="paper" heading={limits.heading}>
      <p data-reveal className="t-body text-fg-muted mb-8">
        {limits.body}
      </p>
      <div data-reveal>
        <ThresholdDiagram labels={limits.diagram} />
      </div>
    </SectionShell>
  );
}
