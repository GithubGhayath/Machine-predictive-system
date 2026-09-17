/**
 * Captures the site at every breakpoint in both languages and measures how
 * much of the page sits on each ground.
 *
 *   npm run dev            (in another terminal)
 *   npm run shots          → .screenshots/
 *
 * Full-page captures use reduced motion: that is the page as a document, with
 * every section visible. The scroll-scrub stages are captured separately as
 * viewport frames with motion on.
 *
 * Env: BASE_URL (default http://localhost:3000), OUT_DIR (default .screenshots),
 *      PW_CHANNEL to drive an installed browser instead of Playwright's own
 *      (e.g. PW_CHANNEL=msedge on Windows, PW_CHANNEL=chrome elsewhere).
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = process.env.OUT_DIR ?? ".screenshots";
const WIDTHS = [360, 390, 768, 1024, 1440, 1920];
const LOCALES = ["ar", "en"];
const FRAME_WIDTHS = [390, 1440];

const heightFor = (width) => (width < 768 ? 800 : width < 1440 ? 1000 : 900);

/** Runs in the page. Sums the rendered height of every top-level ground block. */
function measureGrounds() {
  const totals = { paper: 0, deep: 0 };
  const blocks = [...document.querySelectorAll("[data-ground]")].filter(
    (el) =>
      el.tagName !== "HEADER" &&
      !el.parentElement?.closest("[data-ground]") &&
      el.getClientRects().length > 0,
  );

  for (const el of blocks) {
    const height = el.getBoundingClientRect().height;
    const stages = el.dataset.stageGrounds?.split(",");
    if (stages) {
      // A scrub track spends an equal share of its scroll on each stage.
      for (const ground of stages) totals[ground] += height / stages.length;
    } else {
      totals[el.dataset.ground] += height;
    }
  }

  const doc = document.documentElement;
  return {
    pageHeight: doc.scrollHeight,
    overflowX: doc.scrollWidth - doc.clientWidth,
    paper: Math.round(totals.paper),
    deep: Math.round(totals.deep),
    paperShare: Math.round((totals.paper / (totals.paper + totals.deep)) * 1000) / 10,
  };
}

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
}

const browser = await chromium.launch(
  process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {},
);
await mkdir(OUT, { recursive: true });
const report = [];

for (const locale of LOCALES) {
  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: heightFor(width) },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto(`${BASE}/${locale}`, { waitUntil: "networkidle" });
    await settle(page);

    const staticVersion = await page.evaluate(measureGrounds);
    await page.screenshot({ path: join(OUT, `${locale}-${width}-full.png`), fullPage: true });
    await context.close();

    // Same width with motion on: the scrub track changes the page's proportions.
    const motionContext = await browser.newContext({
      viewport: { width, height: heightFor(width) },
      reducedMotion: "no-preference",
    });
    const motionPage = await motionContext.newPage();
    await motionPage.goto(`${BASE}/${locale}`, { waitUntil: "networkidle" });
    await settle(motionPage);
    const motionVersion = await motionPage.evaluate(measureGrounds);

    if (FRAME_WIDTHS.includes(width)) {
      const track = motionPage.locator(".scrub-track");
      const stageCount = (await track.getAttribute("data-stage-grounds")).split(",").length;
      const box = await track.evaluate((el) => ({
        top: el.getBoundingClientRect().top + window.scrollY,
        height: el.offsetHeight,
      }));
      const travel = box.height - heightFor(width);

      for (let i = 0; i < stageCount; i++) {
        // Late in each stage, once the chart has caught up with the text.
        const y = box.top + travel * ((i + 0.8) / stageCount);
        await motionPage.evaluate((top) => window.scrollTo(0, top), y);
        await motionPage.waitForTimeout(1200);
        await motionPage.screenshot({
          path: join(OUT, `${locale}-${width}-stage-${i + 1}.png`),
        });
      }
    }
    await motionContext.close();

    const row = { locale, width, static: staticVersion, motion: motionVersion };
    report.push(row);
    console.log(
      `${locale} ${String(width).padStart(4)}  ` +
        `paper static ${staticVersion.paperShare}%  motion ${motionVersion.paperShare}%  ` +
        `overflow-x ${staticVersion.overflowX}/${motionVersion.overflowX}px  ` +
        `height ${staticVersion.pageHeight}/${motionVersion.pageHeight}px`,
    );
  }
}

await writeFile(join(OUT, "report.json"), JSON.stringify(report, null, 2));
await browser.close();
