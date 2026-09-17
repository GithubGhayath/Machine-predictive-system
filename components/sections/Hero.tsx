import MediaClip from "@/components/media/MediaClip";
import LiveToggle from "@/components/motion/LiveToggle";
import LiveTrace from "@/components/motion/LiveTrace";
import { getHeroContent } from "@/lib/data";
import { SEGMENT_SPAN, segmentStart } from "@/lib/trace";
import type { Locale } from "@/lib/data/types";

/** Stagger order for the CSS entrance. */
const order = (i: number) => ({ "--i": i }) as React.CSSProperties;

/**
 * The claim, and the signal starting under it. The product name lives in the
 * header lockup, so nothing sits above the headline.
 */
export default async function Hero({ locale }: { locale: Locale }) {
  const hero = await getHeroContent(locale);
  if (!hero) return null;

  return (
    <section
      data-ground="deep"
      className="relative min-h-[100svh] flex flex-col pt-[var(--nav-h)]"
    >
      <MediaClip slot="hero" variant="backdrop" />

      <div className="shell relative flex-1 flex flex-col justify-center py-16">
        <h1
          id="hero-heading"
          tabIndex={-1}
          className="t-display max-w-[18ch] hero-enter"
          style={order(0)}
        >
          {hero.headline}
        </h1>

        <p className="t-lead mt-7 hero-enter" style={order(1)}>
          {hero.subline}
        </p>

        <div
          className="mt-10 flex flex-wrap items-center gap-4 hero-enter"
          style={order(2)}
        >
          <a href={hero.primaryCta.href} className="cta-solid">
            {hero.primaryCta.label}
          </a>
          <a href={hero.secondaryCta.href} className="cta-quiet">
            {hero.secondaryCta.label}
          </a>
        </div>
      </div>

      {/* The signal starts here and runs the length of the site. */}
      <div className="relative">
        <div className="shell flex justify-end pb-3">
          <LiveToggle labels={hero.liveControl} />
        </div>
        <LiveTrace
          t0={segmentStart(0)}
          span={SEGMENT_SPAN}
          className="w-full h-[7rem] lg:h-[9rem]"
        />
      </div>
    </section>
  );
}
