import Link from "next/link";
import { siteConfig } from "@/content/site.config";
import { getNavContent } from "@/lib/data";
import type { Locale } from "@/lib/data/types";

export default async function Header({ locale }: { locale: Locale }) {
  const nav = await getNavContent(locale);
  if (!nav) return null;

  const other: Locale = locale === "ar" ? "en" : "ar";

  return (
    <header
      data-ground="deep"
      className="fixed inset-x-0 top-0 z-50 h-[var(--nav-h)] bg-ground/90 backdrop-blur-sm border-b border-rule"
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:bg-fg focus:text-ground focus:px-3 focus:py-2"
      >
        {nav.skipToContent}
      </a>

      <div className="shell flex h-full items-center justify-between gap-6">
        {/* The product name in this page's script, with the other script beside it. */}
        <Link
          href={`/${locale}`}
          prefetch={false}
          className="flex items-baseline gap-2.5 text-fg"
        >
          <span className="font-semibold text-lg">{siteConfig.brand.name[locale]}</span>
          <span lang={other} className="t-label">
            {siteConfig.brand.name[other]}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-fg-muted hover:text-fg transition-colors text-[0.95rem]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Link
          href={`/${other}`}
          hrefLang={other}
          prefetch={false}
          className="t-label border border-rule px-3 py-2 hover:border-fg-muted transition-colors min-h-11 flex items-center"
        >
          {nav.languageLabel}
        </Link>
      </div>
    </header>
  );
}
