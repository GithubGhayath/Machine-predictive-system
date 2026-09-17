import { NextResponse, type NextRequest } from "next/server";
import { LOCALES, siteConfig } from "@/content/site.config";

/**
 * Every page lives under /ar or /en. A path without a locale is redirected to
 * the default one, which is set once in site.config.ts.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${siteConfig.defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, public assets and anything with a file extension.
  matcher: ["/((?!_next|media|fonts|.*\\..*).*)"],
};
