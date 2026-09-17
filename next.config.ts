import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The root layout lives under the dynamic [locale] segment, so a 404 can't
    // be composed from layout + not-found. This renders app/global-not-found.tsx
    // for unmatched URLs instead. See the Next.js not-found docs.
    globalNotFound: true,

    // The whole stylesheet is a few KB and most visitors arrive once, so it
    // ships inside the HTML instead of as a render-blocking request.
    inlineCss: true,
  },
};

export default nextConfig;
