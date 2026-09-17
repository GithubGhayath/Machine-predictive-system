import type { MetadataRoute } from "next";
import { LOCALES, siteConfig } from "@/content/site.config";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    LOCALES.map((locale) => [locale, `${siteConfig.url}/${locale}`]),
  );

  return LOCALES.map((locale) => ({
    url: `${siteConfig.url}/${locale}`,
    alternates: { languages },
  }));
}
