import type { Locale } from "@/lib/data/types";

/**
 * The product name is a working name. It lives HERE and nowhere else — not in
 * ar.json / en.json, not in any component. Renaming the product means editing
 * the two names below and nothing more.
 */
export const siteConfig = {
  brand: {
    name: {
      ar: "رَصْد",
      en: "RASD",
    } satisfies Record<Locale, string>,
  },

  /**
   * The public origin, for canonical and hreflang links and the sitemap. Set
   * SITE_URL once the domain is known. On Vercel the production URL is used
   * automatically until then.
   */
  url:
    process.env.SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),

  contact: {
    email: "info@rasd.sy",
    // Still a placeholder pattern, not a dialable number — the tel: link
    // this feeds will not work until this is a real number.
    phone: "+963 11 XXX XXXX",
  },

  /** Empty until the client supplies real accounts. Rendered only if non-empty. */
  social: [] as { label: string; href: string }[],

  locales: ["ar", "en"] as const,

  /** Flip this single value to make English the primary audience. */
  defaultLocale: "ar" as Locale,
} as const;

export const LOCALES = siteConfig.locales;

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function directionOf(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}
