/**
 * Generates `public/images/og-card.png` — the 1200x630 social preview card.
 *
 * Run with `node scripts/generate-og-image.mjs` (needs Playwright's Chromium,
 * already a devDependency for the a11y audit). The composition is kept as
 * markup rather than a checked-in binary so it stays editable and reviewable:
 * scrapers fetch the PNG, but a PNG nobody can regenerate quietly goes stale.
 *
 * Sizes are the Open Graph render box (1200x630, 1.91:1). Everything sits on the
 * same sand as the page and gets its depth from the paired shadow, so the card
 * and the site read as one object rather than a graphic bolted on top.
 */
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, "../public/images");

const SAND = "#e7e2d8";
const TINT = "#ded7ca";
const WELL = "#d3ccbd";
const INK = "#3a342b";
const MUTED = "#6b6153";
const TERRA = "#c9784f";
const TERRA_DEEP = "#8a4a26";
const SAGE = "#8aa39b";

/** Radial tick marks around a dial centre, placed with rotate + translateY. */
const ticks = (count, radius) =>
  Array.from({ length: count }, (_, i) => {
    const angle = (360 / count) * i;
    return `<i style="transform:rotate(${angle}deg) translateY(-${radius}px)"></i>`;
  }).join("");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body {
    background: ${SAND};
    color: ${INK};
    font-family: "Helvetica Neue", Helvetica, Arial, "DejaVu Sans", sans-serif;
    -webkit-font-smoothing: antialiased;
    position: relative;
  }
  .stage { position: relative; width: 1200px; height: 630px; padding: 66px 72px; }

  /* Paired shadow: warm dark down-right, warm cream up-left. */
  .raised {
    box-shadow:
      26px 26px 54px rgba(58, 52, 43, 0.20),
      -26px -26px 54px rgba(255, 251, 240, 0.85);
  }

  .copy { position: relative; z-index: 2; width: 612px; }
  .eyebrow {
    display: inline-block;
    padding: 11px 24px;
    border-radius: 999px;
    background: ${WELL};
    color: ${TERRA_DEEP};
    font-size: 23px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    box-shadow:
      8px 8px 18px rgba(58, 52, 43, 0.22),
      -8px -8px 18px rgba(255, 251, 240, 0.85);
  }
  h1 {
    margin-top: 34px;
    font-size: 72px;
    line-height: 1.08;
    font-weight: 500;
    letter-spacing: -0.022em;
  }
  h1 em { font-style: normal; color: ${TERRA_DEEP}; }
  .lede {
    margin-top: 26px;
    width: 560px;
    font-size: 27px;
    line-height: 1.48;
    color: ${MUTED};
  }
  .chips { margin-top: 34px; display: flex; gap: 14px; }
  .chip {
    padding: 12px 22px;
    border-radius: 999px;
    background: ${TINT};
    color: ${INK};
    font-size: 23px;
    font-weight: 500;
    box-shadow:
      7px 7px 16px rgba(58, 52, 43, 0.18),
      -7px -7px 16px rgba(255, 251, 240, 0.85);
  }
  .chip b { font-weight: 600; color: ${TERRA_DEEP}; }

  /* The dial: same concentric-ring mark as the in-product wordmark, drawn at
     architectural scale so the card and the favicon are visibly one mark. It
     bleeds off the right edge on purpose — a fully contained circle reads as a
     sticker, a cropped one reads as a crop of a larger composition. */
  .dial {
    position: absolute;
    right: -132px;
    top: 50%;
    translate: 0 -50%;
    width: 520px;
    height: 520px;
    border-radius: 50%;
    background: ${SAND};
    display: grid;
    place-items: center;
  }
  .ring { position: absolute; border-radius: 50%; }
  .ring--press {
    inset: 0;
    box-shadow:
      inset 18px 18px 38px rgba(58, 52, 43, 0.26),
      inset -18px -18px 38px rgba(255, 251, 240, 0.55);
  }
  .ring--sage {
    inset: 74px;
    background: ${SAGE};
    box-shadow:
      14px 14px 30px rgba(58, 52, 43, 0.24),
      -14px -14px 30px rgba(255, 251, 240, 0.6);
  }
  .ring--core {
    inset: 172px;
    background: ${TERRA};
    box-shadow:
      inset 10px 10px 22px rgba(58, 52, 43, 0.34),
      inset -10px -10px 22px rgba(255, 251, 240, 0.32);
  }
  .ticks { position: absolute; inset: 0; }
  .ticks i {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 4px;
    height: 15px;
    margin: -7.5px 0 0 -2px;
    border-radius: 2px;
    background: rgba(58, 52, 43, 0.30);
    transform-origin: center;
  }
</style>
</head>
<body>
  <div class="stage">
    <div class="dial">
      <div class="ring ring--press"></div>
      <div class="ticks">${ticks(24, 232)}</div>
      <div class="ring ring--sage"></div>
      <div class="ring ring--core"></div>
    </div>
    <div class="copy">
      <span class="eyebrow">Awesome Qwen</span>
      <h1>The community skill library for <em>Qwen&nbsp;Code</em></h1>
      <p class="lede">
        Curated, battle-tested skills that bundle instructions, references and
        scripts &mdash; each one validated with a quality score.
      </p>
      <div class="chips">
        <span class="chip"><b>26</b> skills</span>
        <span class="chip">quality-scored</span>
        <span class="chip">open source</span>
      </div>
    </div>
  </div>
</body>
</html>
`;

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.setContent(html, { waitUntil: "load" });
const target = path.join(outDir, "og-card.png");
await page.screenshot({ path: target, clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();

console.log(`wrote ${path.relative(path.join(here, ".."), target)}`);
