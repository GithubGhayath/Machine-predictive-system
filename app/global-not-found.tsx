import type { Metadata } from "next";
import Link from "next/link";
import { LOCALES, directionOf, siteConfig } from "@/content/site.config";
import { getNotFoundContent } from "@/lib/data";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: `404 — ${siteConfig.brand.name.ar} · ${siteConfig.brand.name.en}`,
};

const W = 1000;
const H = 116;

/**
 * Rendered for any URL that matches no page. It sits outside the locale
 * layout, so it can't know which language was wanted — it says it in both,
 * default language first, each with a way home.
 *
 * No page, no reading: the band is there, and the pen draws a flat line.
 */
export default async function GlobalNotFound() {
  const locales = [
    siteConfig.defaultLocale,
    ...LOCALES.filter((locale) => locale !== siteConfig.defaultLocale),
  ];
  const blocks = await Promise.all(
    locales.map(async (locale) => ({ locale, content: await getNotFoundContent(locale) })),
  );

  return (
    <html
      lang={siteConfig.defaultLocale}
      dir={directionOf(siteConfig.defaultLocale)}
      className={fontVariables}
    >
      <body>
        <main
          data-ground="deep"
          className="min-h-[100svh] flex flex-col justify-center bg-ground text-fg"
        >
          <div className="shell py-20 grid grid-cols-1 md:grid-cols-2 gap-16">
            {blocks.map(({ locale, content }, i) => {
              if (!content) return null;
              const Heading = i === 0 ? "h1" : "h2";
              return (
                <section key={locale} lang={locale} dir={directionOf(locale)}>
                  <p className="font-semibold text-lg mb-12">
                    {siteConfig.brand.name[locale]}
                  </p>
                  <Heading className="t-h2 max-w-[20ch] mb-5">{content.heading}</Heading>
                  <p className="t-lead mb-10">{content.body}</p>
                  <Link href={`/${locale}`} hrefLang={locale} className="cta-quiet">
                    {content.homeLabel}
                  </Link>
                </section>
              );
            })}
          </div>

          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            aria-hidden
            className="w-full h-[7rem]"
          >
            <rect x={0} y={H * 0.13} width={W} height={H * 0.74} fill="var(--corridor)" />
            <line
              x1={0}
              y1={H / 2}
              x2={W}
              y2={H / 2}
              stroke="var(--trace)"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </main>
      </body>
    </html>
  );
}
