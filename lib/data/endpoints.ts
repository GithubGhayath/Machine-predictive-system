/**
 * Every backend URL this site will ever call, in one object.
 *
 * Today every value is an empty string, which tells `client.ts` to read the
 * local JSON in /content instead of going over the network. Fill a value in
 * and that logical name starts hitting the real API — no component changes.
 *
 * See ./README.md for a worked before/after example.
 */
export const endpoints = {
  /** GET → the full SiteContent object for one locale. `:locale` is substituted. */
  siteContent: "", // TODO: e.g. "https://api.example.com/v1/content/:locale"

  /** POST → a contact form submission. */
  contactForm: "", // TODO: e.g. "https://api.example.com/v1/leads"

  /** GET → media assets (clip + poster URLs) keyed by asset id. */
  media: "", // TODO: e.g. "https://api.example.com/v1/media"
} as const;

export type EndpointName = keyof typeof endpoints;

/** True when a real URL has been configured for this logical name. */
export function isLive(name: EndpointName): boolean {
  return endpoints[name].trim().length > 0;
}

export function resolve(name: EndpointName, params: Record<string, string> = {}): string {
  let url: string = endpoints[name];
  for (const [key, value] of Object.entries(params)) {
    url = url.replace(`:${key}`, encodeURIComponent(value));
  }
  return url;
}
