import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Sans_Arabic } from "next/font/google";

// next/font downloads these at build time and serves them from this origin.
// There is no request to Google at runtime. Shared by the locale layout and the
// global 404, which renders outside that layout.
//
// The two text faces are preloaded so they arrive before first paint: the
// headline then renders once, in the right face. Without preload the swap
// happens later and re-triggers Largest Contentful Paint (measured: ~0.3s with
// preload, ~1.3s without). Mono only sets small labels, so it waits.
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  // 500 is body copy on the graphite ground only — 400 reads thin there.
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-arabic",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-plex-mono",
  display: "swap",
  preload: false,
});

export const fontVariables = `${plexSans.variable} ${plexArabic.variable} ${plexMono.variable}`;
