import { siteConfig } from "@/content/site.config";
import { getNavContent } from "@/lib/data";
import type { Locale } from "@/lib/data/types";
import NavBar from "@/components/chrome/NavBar";

export default async function Header({ locale }: { locale: Locale }) {
  const nav = await getNavContent(locale);
  if (!nav) return null;

  const other: Locale = locale === "ar" ? "en" : "ar";

  return (
    <NavBar
      locale={locale}
      otherLocale={other}
      brandName={siteConfig.brand.name[locale]}
      otherBrandName={siteConfig.brand.name[other]}
      links={nav.links}
      languageLabel={nav.languageLabel}
      skipToContent={nav.skipToContent}
    />
  );
}
