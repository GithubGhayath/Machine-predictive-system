import "server-only";
import ar from "@/content/ar.json";
import en from "@/content/en.json";
import media from "@/content/media.json";
import { isLive, resolve } from "./endpoints";
import type { ContactSubmission, Locale, MediaAsset, SiteContent } from "./types";

/**
 * THE SWAP POINT.
 *
 * Nothing above this file knows whether content comes from /content/*.json or
 * from an HTTP API. Give `endpoints.ts` a real URL and the matching function
 * below starts fetching it; the local JSON stays as the offline fallback.
 */

const localContent: Record<Locale, SiteContent> = {
  ar: ar as unknown as SiteContent,
  en: en as unknown as SiteContent,
};

export async function fetchSiteContent(locale: Locale): Promise<SiteContent | null> {
  const fallback = localContent[locale] ?? null;

  if (!isLive("siteContent")) return fallback;

  try {
    const res = await fetch(resolve("siteContent", { locale }), {
      next: { revalidate: 300 },
    });
    if (!res.ok) return fallback;
    return (await res.json()) as SiteContent;
  } catch {
    return fallback;
  }
}

const localMedia: MediaAsset[] = media.assets;

/**
 * Clip and poster URLs for one slot. Returns null while no footage exists —
 * sections render their drawn treatment alone rather than a broken frame.
 *
 * Without a backend, list files from /public/media in content/media.json.
 */
export async function fetchMediaAsset(id: string): Promise<MediaAsset | null> {
  if (!isLive("media")) {
    return localMedia.find((asset) => asset.id === id) ?? null;
  }

  try {
    const res = await fetch(`${resolve("media")}/${encodeURIComponent(id)}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as MediaAsset;
  } catch {
    return null;
  }
}

export async function postContactForm(
  submission: ContactSubmission,
): Promise<{ ok: boolean }> {
  if (!isLive("contactForm")) {
    // TODO: POST to endpoints.contactForm
    // Nothing is sent anywhere today. Give endpoints.contactForm a URL and the
    // branch below runs instead.
    return { ok: true };
  }

  try {
    const res = await fetch(resolve("contactForm"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}
