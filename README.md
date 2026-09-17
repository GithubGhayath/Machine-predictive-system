# RASD · رَصْد

Bilingual (Arabic-first) landing page for a low-cost predictive-maintenance
system. Next.js 16 (App Router), Tailwind CSS 4, GSAP, Lenis.

```bash
npm install
npm run dev        # http://localhost:3000 → redirects to /ar
npm run build && npm start
```

## Where things live

| To change… | Edit |
| --- | --- |
| Any text, in either language | `content/ar.json`, `content/en.json` |
| The product name, site URL, contact details, default language | `content/site.config.ts` |
| Where content comes from (JSON today, an API later) | `lib/data/endpoints.ts` — see [`lib/data/README.md`](lib/data/README.md) |
| Video footage | `content/media.json` + files in `public/media/` |
| Colours, type scale, spacing | the tokens at the top of `app/globals.css` |

Components never import JSON or call `fetch`; they go through the getters in
`lib/data/index.ts`. A section whose content is missing renders nothing.

### Footage

There are four slots — `hero`, `sensors`, `installation`, `closing`. Until a
slot has an entry, its section shows only its drawings. To add a clip, put the
files in `public/media/` and list them:

```json
{
  "assets": [
    {
      "id": "hero",
      "webm": "/media/hero.webm",
      "mp4": "/media/hero.mp4",
      "poster": "/media/hero.jpg",
      "alt": "Sensor clamped to a motor housing on a production line"
    }
  ]
}
```

Clips play muted, only while on screen, and never under reduced motion.

## Design rules worth keeping

- **Two grounds, one signal.** Graphite `#10171A` and datasheet paper `#EAEDEC`;
  paper carries 58–65% of the page at every width. `data-ground="deep"` on any
  element flips its colour roles.
- **Amber `#E9A23B` has exactly two forms.** A solid fill on the primary call to
  action, and a stroke on a trace that has left its band. Nothing else — not
  focus rings, errors, callouts or links.
- **One signal runs the whole page.** Every trace is a window onto the same
  function in `lib/trace.ts`, so sections join up. On desktop it runs down a
  gutter; on phones it becomes a strip under each heading. In Arabic, time runs
  right to left.

## Motion and access

- Without JavaScript, or with reduced motion, every section renders its final
  state: the scroll-scrubbed timeline becomes four static stages and the hero
  trace stands still.
- The hero trace moves continuously, so it has a run/hold switch (WCAG 2.2.2).
- The contact form is a Server Action and works with JavaScript off.

## Checks

```bash
npm run typecheck
npm run lint
npm run shots      # needs `npm run dev` running; writes .screenshots/
```

`npm run shots` captures both languages at 360–1920px and reports how much of
the page sits on each ground. On Windows without Playwright's own browser,
run it with `PW_CHANNEL=msedge`.

## Deploying

Set `SITE_URL` (e.g. `https://rasd.example`) so canonical links, hreflang and
the sitemap use the real domain. On Vercel the production URL is picked up
automatically until then.

Two Next.js experimental flags are on, deliberately (`next.config.ts`):
`globalNotFound` (the 404 page — the root layout sits under `[locale]`, which
plain `not-found` can't serve) and `inlineCss` (the stylesheet is a few KB, so
it ships inside the HTML).

## Before this goes public

- **The contact form does not send anything yet.** It validates and shows a
  success message, but `endpoints.contactForm` is empty, so requests go nowhere.
  Connect it (see `lib/data/README.md`) before launch.
- `contact.phone` in `content/site.config.ts` is still a placeholder pattern
  (`+963 11 XXX XXXX`), not a real number — the footer's `tel:` link won't
  work until it's replaced.

---

## تعديل المحتوى

- كل النصوص في `content/ar.json` و `content/en.json`.
- اسم المنتج، رابط الموقع، بيانات التواصل، واللغة الافتراضية في
  `content/site.config.ts`.
- لتوصيل خادم خلفي راجع [`lib/data/README.md`](lib/data/README.md).
- **نموذج التواصل لا يرسل شيئًا بعد**؛ يجب توصيله قبل نشر الموقع.
