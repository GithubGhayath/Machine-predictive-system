import Link from "next/link";
import { siteConfig } from "@/content/site.config";
import { getFooterContent, getNavContent } from "@/lib/data";
import type { Locale } from "@/lib/data/types";

export default async function Footer({ locale }: { locale: Locale }) {
  const [footer, nav] = await Promise.all([
    getFooterContent(locale),
    getNavContent(locale),
  ]);
  if (!footer) return null;

  const other: Locale = locale === "ar" ? "en" : "ar";
  const { email, phone } = siteConfig.contact;

  return (
    <footer data-ground="deep" className="bg-ground text-fg border-t border-rule">
      <div className="shell py-14 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-6">
          <p className="font-semibold text-lg mb-3">{siteConfig.brand.name[locale]}</p>
          <p className="t-body text-fg-muted max-w-[44ch]">{footer.description}</p>
        </div>

        <div className="md:col-span-4">
          <p className="t-label mb-3">{footer.contactLabel}</p>
          <ul className="flex flex-col gap-2">
            <li>
              <a href={`mailto:${email}`} className="hover:underline underline-offset-4">
                <span className="num">{email}</span>
              </a>
            </li>
            <li>
              <a href={`tel:${phone}`} className="hover:underline underline-offset-4">
                <span className="num">{phone}</span>
              </a>
            </li>
            {siteConfig.social.map((account) => (
              <li key={account.href}>
                <a href={account.href} className="hover:underline underline-offset-4">
                  {account.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2 md:justify-self-end">
          {nav ? (
            <Link href={`/${other}`} hrefLang={other} prefetch={false} className="lang-switch">
              {nav.languageLabel}
            </Link>
          ) : null}
        </div>

        <p className="md:col-span-12 t-label pt-8 border-t border-rule">
          © <span className="num">{new Date().getFullYear()}</span>{" "}
          {siteConfig.brand.name[locale]} — {footer.copyright}
        </p>
      </div>
    </footer>
  );
}
