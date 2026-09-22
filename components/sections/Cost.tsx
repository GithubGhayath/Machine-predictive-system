import SectionShell from "@/components/SectionShell";
import StillImage from "@/components/media/StillImage";
import { getCostSection } from "@/lib/data";
import type { Locale } from "@/lib/data/types";

export default async function Cost({ locale }: { locale: Locale }) {
  const cost = await getCostSection(locale);
  if (!cost) return null;

  return (
    <SectionShell id="cost" index={1} ground="paper" heading={cost.heading}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <p data-reveal className="t-body text-fg-muted lg:col-span-5">
          {cost.body}
        </p>
        <div data-reveal className="lg:col-span-7">
          <StillImage
            src="/images/factory-wide.webp"
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="aspect-[16/10]"
          />
        </div>
      </div>
    </SectionShell>
  );
}
