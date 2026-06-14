# Emulator Checklist — AI4StatMath Benchmark Explorer

> Every reported issue and regression risk is tracked here. The Playwright
> headless-browser verify script (`/tmp/verify_live3.js`) is the runtime
> enforcement of this checklist. Update both files together.
>
> Source of truth for issue status: https://github.com/yulinl2/yulinl2.github.io/issues/32
> Playwright binary: `/opt/pw-browsers/chromium-1223/chrome-linux64/chrome`
> Playwright lib: `/opt/node22/lib/node_modules/playwright`

---

## Automated (Playwright) — run after every push

| # | Check | How tested | Issue |
|---|-------|-----------|-------|
| E-A1 | Page loads with 0 JS errors | `pageerror` listener | B-L2 regression |
| E-A2 | 7 benchmark tabs render | `$$eval('.tab')` | structural |
| E-A3 | 30 problem cards on default CMT page | `$$eval('.card')` | structural |
| E-A4 | `prepTex` function defined | `typeof prepTex==='function'` | B-L2 |
| E-A5 | `getBgPattern` function defined | `typeof getBgPattern==='function'` | F-H6 |
| E-A6 | Hero `#bnr` has backgroundImage set | `getComputedStyle(bnr).backgroundImage !== 'none'` | F-H6 |
| E-A7 | Filter bar has chips after CMT loads | `$$('.chip').length > 0` | B-F1 |
| E-A8 | Floating nav buttons present | `$$('.fnb').length >= 6` | F-NC1 |
| E-A9 | Sticky count bar (`#sl`) non-empty | `$('#sl').textContent.length > 0` | B-V3 |
| E-A10 | KaTeX stylesheet loads (no 404) | network intercept | B-L1, B-L3 |

## Manual regression — check on every visual change

| # | Check | How to verify | Issue |
|---|-------|--------------|-------|
| E-M1 | Default card not overly dim when another expanded | Expand a card; others at ~62% opacity | B-N6 |
| E-M2 | ↑↓ nav: focus highlight moves, does NOT stay on manually clicked card | Expand card, press ↓ | B-N3 |
| E-M3 | ⤒/⤓ first/last buttons don't scroll back on second press | Press ⤒ twice | B-N7 |
| E-M4 | Swipe left/right flips page (not bench switch) | Swipe on mobile | B-N8 |
| E-M5 | Swipe inside a wide equation box does NOT flip page | Scroll inside katex-display | B-N1 |
| E-M6 | Filter chips stay active after scrolling away and back | Toggle chip, scroll, return | B-F2 |
| E-M7 | Multi-select filters: picking 2 chips from same group works (OR) | Toggle 2 type chips | B-F3 |
| E-M8 | Bare `\begin{equation}` renders in CMT-Bench cards | Expand CMT card with equation | B-L2 |
| E-M9 | Search scope stays within active bench | Search, switch bench | F-N3 |
| E-M10 | Per-bench hero SVG pattern visible and different per bench | Cycle all 6 tabs | F-H6 |
| E-M11 | Bench switch scrolls to top / reveals hero | Switch tabs | F-N1 |
| E-M12 | Page position restored when switching back to previous bench | Go to p2, switch away, come back | F-N2 |
| E-M13 | Deploy timestamp shows in footer | Load page, check footer | F-N4 |

---

## Verify script (canonical)

Save as `/home/user/ai4sm-docs/verify_live.js` and copy to `/tmp/verify_live3.js` per session.

```javascript
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1223/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('https://yulinl2.github.io/ai4statmath-benchmarks/', {
    waitUntil: 'networkidle', timeout: 30000
  });
  await page.waitForTimeout(3000);

  const tabs    = await page.$$eval('.tab', els => els.length);              // E-A2
  const cards   = await page.$$eval('.card', els => els.length);             // E-A3
  const chips   = await page.$$eval('.chip', els => els.length);             // E-A7
  const fnbs    = await page.$$eval('.fnb', els => els.length);              // E-A8
  const hasPT   = await page.evaluate(() => typeof prepTex === 'function');  // E-A4
  const hasBGP  = await page.evaluate(() => typeof getBgPattern === 'function'); // E-A5
  const bnrBg   = await page.evaluate(() => {                                // E-A6
    const el = document.getElementById('bnr');
    return el ? el.style.backgroundImage : 'n/a';
  });
  const slText  = await page.$eval('#sl', el => el.textContent.trim());      // E-A9

  const pass = tabs===7 && cards===30 && chips>0 && fnbs>=6 &&
               hasPT && hasBGP && bnrBg!=='' && slText.length>0 && errors.length===0;

  console.log(JSON.stringify({
    pass, tabs, cards, chips, fnbs, hasPrepTex: hasPT, hasBgPattern: hasBGP,
    bnrBg: bnrBg.slice(0,60), slText: slText.slice(0,40), errors
  }, null, 2));
  await browser.close();
  process.exit(pass ? 0 : 1);
})().catch(e => { console.error(e.message); process.exit(1); });
```

Expected output (all green):
```json
{
  "pass": true,
  "tabs": 7,
  "cards": 30,
  "chips": ">0",
  "fnbs": ">=6",
  "hasPrepTex": true,
  "hasBgPattern": true,
  "bnrBg": "url(\"data:image/svg+xml,...\")",
  "errors": []
}
```
