# CLAUDE.md — AI4StatMath Benchmark Explorer

## Active work
- Live page: https://yulinl2.github.io/ai4statmath-benchmarks/
- Repo: yulinl2/yulinl2.github.io · branch: main (ships directly to Pages)
- Dev branch: claude/parquet-ndjson-export-nyz7ia
- Design docs: ai4statmath-benchmarks/docs/ on dev branch

## Source layout (MODULAR — native ES modules, still no build step)
As of the ESM refactor, the page is split — edit the right file, don't reload the whole thing:
- `ai4statmath-benchmarks/index.html` — shell only (~70 lines): head, markup, `<script type="module" src="./js/app.js">`
- `css/tokens.css` (portable token layer) · `css/layout.css` · `css/cards.css`
- `js/registry.js` — DS dataset registry = THE extension point (add a dataset here)
- `js/util.js` · `js/katex.js` · `js/state.js` · `js/data.js` · `js/render.js`
- `js/app.js` — ENTRY: events, wiring, init, and the single `Object.assign(window,{…})` block
- Inline `onclick="fn()"` resolves against window → any such handler MUST be added to app.js's window-attach block (see docs/MIGRATION_SPEC.md G1)
- Pre-refactor monolith preserved at `/home/user/benchmarks_page_v2.html` (rollback reference only — NOT the source of truth)

## Deployment recipe (CANONICAL — do not use sub-agents for push)

**CRITICAL:** Sub-agent pushes truncate large files at ~5.6KB due to Bash output size caps.
Always push via the Python bypass below — reads + sends in one process, no truncation.

### BLOCK A — EDIT + local verify
Edit files in the git clone `/home/user/yulinl2.github.io/ai4statmath-benchmarks/`.
```bash
cd /home/user/yulinl2.github.io/ai4statmath-benchmarks
for f in js/*.js; do node --check "$f" || echo "FAIL $f"; done
# Real local smoke (modules need HTTP — file:// fails CORS):
( python3 -m http.server 8731 >/tmp/httpd.log 2>&1 & ) ; sleep 1
node /tmp/smoke_local.js   # Playwright vs http://localhost:8731/index.html
```

### BLOCK B — PUSH (git via local proxy — multi-file, atomic, both branches)
The ESM split means MANY files per change, so push the whole directory via git
(one atomic commit). This is the proven path; it sidesteps the sub-agent Bash
truncation cap entirely (git streams the pack, not Bash output).
```bash
cd /home/user/yulinl2.github.io
git fetch origin claude/parquet-ndjson-export-nyz7ia && git checkout -B push-fix-dev origin/claude/parquet-ndjson-export-nyz7ia
# ...apply edits to ai4statmath-benchmarks/...
git add -A ai4statmath-benchmarks/ && git commit -m "msg"
git push origin push-fix-dev:claude/parquet-ndjson-export-nyz7ia
# main = code only (docs/ stay dev-only):
git fetch origin main && git checkout -B push-fix origin/main
git checkout push-fix-dev -- ai4statmath-benchmarks/index.html ai4statmath-benchmarks/css ai4statmath-benchmarks/js
git commit -m "msg" && git push origin push-fix:main
```
- On network error, retry push with exponential backoff (2/4/8/16s).
- Python MCP `push_files` fallback still works — but its `files:[…]` array must
  list EVERY changed file (index.html + css/*.css + js/*.js), not just index.html.

### BLOCK C — VERIFY (Playwright headless Chromium, run after every push)
**Do NOT use WebFetch** — it only checks HTML source, not JS execution; it gave false-positives.
Use Playwright to actually execute the page in Chromium:

```bash
# Check deployment is live (new Last-Modified):
python3 -c "
import urllib.request
r = urllib.request.urlopen('https://yulinl2.github.io/ai4statmath-benchmarks/', timeout=15)
print('Last-Modified:', r.headers.get('last-modified'))
print('Content-Length:', r.headers.get('content-length'))
"
# Then run Playwright (wait for deploy; Pages takes ~2 min):
node /tmp/verify_live3.js
```

`/tmp/verify_live3.js` template:
```javascript
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1223/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newContext({ ignoreHTTPSErrors: true }).then(c => c.newPage());
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('https://yulinl2.github.io/ai4statmath-benchmarks/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  const tabs  = await page.$$eval('.tab', els => els.length);
  const cards = await page.$$eval('.card', els => els.length);
  // POST-ESM: prepTex is module-scoped, NOT global. Check a window-attached
  // handler instead (proves app.js ran AND the window-attach block executed).
  const hasApp = await page.evaluate(() => typeof window.switchTab === 'function');
  console.log(JSON.stringify({ tabs, cards, hasApp, errors }, null, 2));
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
```
Expected: `tabs: 7, cards: 30, hasApp: true, errors: []`
(Ignore one harmless `net::ERR_ABORTED` for the deploy-timestamp HEAD self-fetch,
and any favicon 404.) Full multi-interaction gate: `/tmp/verify_live_mod.js`.

### BLOCK D — DOCUMENT
Append new user messages to `ai4sm-docs/USER_MESSAGES.md` verbatim.

## Data files
- `/data/<id>.ndjson.gz.b64` siblings of index.html on main
- 6 datasets: CMT-Benchmark, HARDMath, MathTrap-public, PRBench, StatEval-public, StatQA-mini
- Gzip+base64 encoded; decoded client-side via atob + DecompressionStream('gzip')

## Verbatim record discipline (IMPORTANT)
- `ai4sm-docs/USER_MESSAGES.md` (also on dev branch) = append-only verbatim log
  of the user's messages. Recover from transcript:
  `/root/.claude/projects/-home-user/<session>.jsonl` (filter type==user,
  drop tool_results/system-reminders/compact-summary).
- ALWAYS check claims/specs/decisions against the verbatim record, not memory.
  Two real misfires this came from: (1) invented a "no-emoji principle" the user
  never stated; (2) put invented metaPreview field names that don't exist in the
  data. Validate against records AND against live data before claiming done.
- `ai4sm-docs/VALIDATION_LOG.md` = traceability matrix (every request → source →
  build status) + decision log with rationales.

## Process recipe (for revamps)
The user's design process recipe — follow this for any major change:
1. SPEC FIRST: Write/update DESIGN_SPEC.md (execution contract), FEATURE_CHECKLIST.md
   (sufficiency guarantee), DESIGN_PRINCIPLES.md (transferable rationale)
2. BREAK DOWN: Hierarchical task list staged by dependency; decouple branches within
   each stage for parallel work; identify natural group boundaries to reduce context load
3. VALIDATE laterally (check requests against dialogue records) before descending
4. EXECUTE stages in order: tokens → scaffold → shell → cards → interactions → QA
5. QA: walk every FEATURE_CHECKLIST row; screenshot audit (vision tool) before merge to main

## Key architectural decisions
- Vanilla JS (no build step) — keeps MCP static-push deployment
- Native ES modules (`<script type="module">`) — modular WITHOUT a bundler;
  browser resolves imports, Pages serves static, push workflow unchanged.
  Chose this over React: React needs a build pipeline; ESM gives the
  maintainability/context-efficiency win with zero new failure surface.
  Smaller files also dodge the ~5.6KB sub-agent Bash truncation cap.
- `js/render.js` emits onclick STRINGS (no import of handlers) → acyclic graph;
  handlers live in `app.js` and are bridged to inline onclick via window-attach
- One `#sticky` wrapper for header + tabs + search → eliminates background-leak gap
- Shared type ramp `.cbdy,.cstem` → no reflow on card expand/collapse
- `metaPreview: [fields]` per dataset in DS registry → no heuristic guessing
- `#cc.has-exp .card:not(.exp)` dim-out → focus without additive highlights
- Answer bar `.cft/.ansb` always visible (not inside `.cexp`) → accessible when collapsed
- ResizeObserver on #sticky → `--scroll-top` CSS var always accurate

## Design principles (north star: ADHD-friendly, calm UI)
- One raised elevation tier only (problem cards); everything else flat
- Dim rest, don't spotlight the one (--op-dim, has-exp class)
- Soft tints, reserved saturation (tags at ~8% alpha; full saturation = wayfinding only)
- Slow eased motion (--t:.3s, --ts:.42s, cubic-bezier(.25,.1,.25,1))
- Seamless state transitions (shared type ramp; only clamp/visibility changes)
- Follow the convention: underline text links; use tint+shadow+shape for interactive affordance
  rather than emoji glyphs (e.g. Answer button: tinted fill + soft shadow, not 👁);
  platform-brand emoji stay because they ARE the convention (🤗 HuggingFace, 📄 arXiv, 💾 data)
- Generous touch targets (--hit:38px; scroll-margin from ResizeObserver)

## Transfer notes (for lit-review and per-contributor pages)
- The DS registry pattern (id, label, color, ans/sol/tags/filters/metaPreview extractors)
  is the key abstraction — adding a dataset or porting to a new page = swap the registry
- Design token layer (color, motion, opacity, elevation) is copy-pasteable wholesale
- The feature checklist pattern (FEATURE_CHECKLIST.md) is the regression net for any refactor
