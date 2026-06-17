# MIGRATION_SPEC.md — Monolith → Native ES Modules

> Process: SPEC-FIRST (per CLAUDE.md process recipe). This is the execution
> contract for splitting the single-file `index.html` (~67 KB) into native ES
> modules + external CSS, **with zero build step** and **zero behavior change**.

## 1. Goal & non-goals

**Goal:** Kill the big-file debt for maintainability and context efficiency.
Adding a dataset = edit `js/registry.js` (~12 KB) instead of loading the whole
monolith; fixing card layout = `css/cards.css` + `js/render.js`.

**Non-goals:** No React, no bundler, no framework. Native browser ESM only.
No visual or behavioral change — the live page must be pixel- and
interaction-identical. This is a mechanical cut, not a rewrite.

## 2. Hard constraints (why this works without a build step)

- **Native ESM**: `<script type="module">` resolves `import`/`export` in the
  browser. GitHub Pages serves the files as static assets. MCP/git push
  workflow is unchanged (just multiple files in one commit).
- **Smaller files dodge the truncation trap**: CLAUDE.md warns sub-agent Bash
  pushes truncate at ~5.6 KB. Each split file is well under that.

## 3. The two real gotchas (and their fixes)

### G1 — Inline `onclick` handlers need globals
Module top-level bindings are **module-scoped, not global**. Every
`onclick="switchTab('x')"` in a generated HTML string resolves against
`window` at click-time. So all functions referenced by inline handlers MUST be
explicitly attached to `window` in the entry module. This is done in **one
auditable block** in `app.js` (`Object.assign(window, {...})`).

Functions requiring window-attach (resolved from inline handlers):
`switchTab, showBkTab, togFilt, setSort, togCmp, retryLoad, clearF, goPage,
expCard, tapMeta, bmTog, togMeta, togCardAns, togSpl, togSplClose,
fnFirst, fnPrevQ, fnNextQ, fnLast`.

### G2 — KaTeX onload race
The KaTeX auto-render `<script>` in `<head>` fires
`onload="window._katexReady=true;_flushKatex()"`. Module scripts and deferred
classic scripts both execute after parsing; the onload **task** may run before
*or* after the module executes. Fix:
- Module (`js/katex.js`) assigns `window._flushKatex` at module-eval time.
- Head onload guards the call: `window._flushKatex&&window._flushKatex()`.
- `renderK` queues into `_kq` when `!window._katexReady`; the onload drains it.
This makes flush order-independent.

## 4. Module graph (no cycles)

```
util.js      (esc, _jsq, stripTex, prepTex)          ── no imports
katex.js     (renderK; sets window._flushKatex)       ── no imports
registry.js  (DS, tag)                                ── no imports
state.js     (S, cloneFilt, bookmarks, curDS)         ── imports: registry
render.js    (tabs, banner, fb, cards, modal, nav…)   ── imports: util, katex, state, registry
data.js      (load, decompB64Gz)                      ── imports: util, state, render(showStatus)
app.js  ←ENTRY (events, wiring, init, window-attach)  ── imports: ALL
```
`render.js` does **not** import `data.js` or `app.js` — it only emits onclick
strings (resolved at click against `window`). This breaks all potential cycles.

`index.html` loads exactly one script: `<script type="module" src="./js/app.js">`.

## 5. CSS split (matches documented transfer-notes goals)

- `css/tokens.css` — design tokens (`:root` vars, theme overrides, base reset).
  The copy-pasteable layer called out in CLAUDE.md transfer notes.
- `css/layout.css` — sticky chrome, header, tabs, search, hero/banner, main,
  filter bar, pagination, modal, floating nav, footer, status.
- `css/cards.css` — card grid, card, spoiler, answer bar, meta table, context
  section, KaTeX, animations. The portable card component.

Loaded in `<head>` in token→layout→cards order (cascade-safe).

## 6. Verification gate (unchanged emulator)

1. `node --check` each `js/*.js`.
2. Local smoke: `python3 -m http.server` + Playwright against `localhost`
   (file:// can't load modules — CORS). Must hit: tabs=7, cards=30,
   hasPrepTex(window) true, expand/collapse, filter, MathTrap context,
   errors=[].
3. Push both branches; Playwright against live Pages — same gate.

## 7. Rollback

The pre-migration monolith is preserved at `/home/user/benchmarks_page_v2.html`
and in git history. If the live gate fails, revert `index.html` to the inline
monolith in one commit.
