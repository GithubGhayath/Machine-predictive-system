import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, directionOf, isLocale, siteConfig } from "@/content/site.config";
import { getHeroContent } from "@/lib/data";
import { fontVariables } from "../fonts";
import "../globals.css";

// Only the locales below exist. Anything else in this position is an unmatched
// URL and gets the global 404 (app/global-not-found.tsx).
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const hero = await getHeroContent(locale);
  const name = siteConfig.brand.name[locale];

  return {
    metadataBase: new URL(siteConfig.url),
    title: hero ? `${name} — ${hero.headline}` : name,
    description: hero?.subline,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [l, `/${l}`])),
        "x-default": `/${siteConfig.defaultLocale}`,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html
      lang={locale}
      dir={directionOf(locale)}
      className={fontVariables}
      // The inline script below adds a class before hydration.
      suppressHydrationWarning
    >
      <head>
        {/* Runs during HTML parsing, before first paint. Motion-only layouts key
            off this class, so without JavaScript the static versions show.
            Second line: if this session already sat through the preloader,
            mark it so CSS can hide the freshly-server-rendered one before it
            ever paints — React still hydrates the same DOM, so there is
            nothing to reconcile. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');" +
              "try{if(sessionStorage.getItem('rasd:preloader-shown'))document.documentElement.setAttribute('data-preloader-skip','')}catch(e){}",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
