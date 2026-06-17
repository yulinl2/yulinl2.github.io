# Validation Log — Specs ⟷ Verbatim Record ⟷ Build

> Re-practice of the design process per S2·M6. Every atomic request is traced
> to its verbatim source in `USER_MESSAGES.md`, checked against the shipped
> build, and given a status. Decisions and rationales recorded inline. This is
> the lateral-validation pass: "check requests/complaints against dialogue
> records for info completeness."
>
> Status: ✅ done · 🔧 fixed this pass · ⏳ pending · 📝 doc-only.

---

## 1. Traceability matrix (S2·M1 — feedback)

| # | Verbatim item (source) | Build resolution | Status |
|---|---|---|---|
| 1 | "different template for benchmark top intro… to differentiate" (S2·M1) | Flat hero: borderless block, accent left-bar, hairline separator; cards are the only raised tier | ✅ |
| 2 | "search bar and page Q count sticky on top upon swipe-up" | `#sticky` wraps header+tabs+search; count `#sl` lives inside it | ✅ |
| 3 | "Odd/Even alternating tint for problem card" | `#cc>.card:nth-child(even)` → `--sf2` | ✅ |
| 4 | "Dim the card highlight color… preserve the nav bar saturation" | Border `color-mix(...45%)`; tabs/dots keep full saturation | ✅ |
| 5 | "gap between focus move and vertical scroll-to-center" | **Root cause:** `.focus()` scroll fought `scrollIntoView`. Fix: `block:'center'` + `focus({preventScroll:true})` | 🔧 |
| 6 | "one-click expand/collapse… apply to text body area too" | `.cbdy` & `.cstem` both `onclick=expCard` (long-press still selects) | ✅ |
| 7 | "metainfo on top bar (right of id+tag; truncated; tap → full)" | `.chmeta` + `tapMeta()`; now config-driven | ✅/🔧 |
| 8 | "answer panel on top-level bottom bar… without expanding statement" | `.cft` always-visible bar + `.ansb` independent toggle | ✅ |
| 9 | "Floating nav keyboard a bit small" | `.fnb` 30→38px, font 15→17px | ✅ |
| 10 | "more click-on feedback animation (enlarge effect)" | `:active` scale (fnb 1.26×; others 0.88–0.93×) | ✅ |

## 2. Traceability matrix (S2·M2 — features, calm-UI, bugs, process)

| # | Verbatim item | Build resolution | Status |
|---|---|---|---|
| 11 | "fully modularized/refactored (from scratch)… configurable" | From-scratch rewrite; `DS` registry drives everything | ✅ |
| 12 | "Do you think using React will be a good idea?" | Answered: no. **Shipped vanilla** (see DL-1) | ✅ |
| 13 | "keep essential feature specs documented (sufficiency guarantee)" | `FEATURE_CHECKLIST.md` | 📝 |
| 14 | "design principles / config strategies documented (as skills?)" | `DESIGN_PRINCIPLES.md`; skill promotion deferred (DL-3) | 📝 |
| 15 | "unboxing the benchmark info card… hero flat" | Same as #1 | ✅ |
| 16 | "Follow the convention: underline the text with hyperlinks" | `.srl` + `footer a` underlined; pill links stay pills | ✅ |
| 17 | "emoji complaint on answer button… shadows for volume; fill tints" | `.ansbtn` tinted fill + shadow; 👁 removed; "Answer ▾" | ✅ |
| 18 | "Further soften highlight tints" | Tag tints → 8% fill / 22% border tokens | ✅ |
| 19 | "Dim cards out of focus, instead of sharper highlights" | `#cc.has-exp .card:not(.exp){opacity:--op-dim}` | ✅ |
| 20 | "Slightly slower, smooth animations" | Motion tokens `--t:.3s --ts:.42s` + shared easing | ✅ |
| 21 | "tiny gap between search bar and top navbar, leaking background" | Single `#sticky` unit — no internal gap possible | ✅ |
| 22 | "preview pre/pro-expansion line space changed… seamless on click" | Shared type ramp `.cbdy,.cstem` identical metrics | ✅ |
| 23 | "meta info preview not rendered successfully" | Explicit per-dataset `metaPreview` — **field names verified vs real data** (DL-2) | 🔧 |
| 24 | "audit results with vision tools… later finger click/scroll emulator" | Vision audit ⏳ (next); fuzzing deferred (Q2) | ⏳ |
| 25 | "make a structured design request doc…" | `DESIGN_SPEC.md` + this log | 📝 |

## 3. Traceability (S2·M3–M6 — meta/process)

| Source | Item | Resolution | Status |
|---|---|---|---|
| S2·M3 | "docs are means not ends; judge by webpage; keep in CLAUDE.md; go into loop" | `CLAUDE.md` written; autonomous build proceeded | ✅ |
| S2·M4 | "📄 arXiv, 🤗 HuggingFace, 💾 NDJSON ARE conventional — double check" | Restored brand emoji in banner links | ✅ |
| S2·M5 | "When did I say 'no emoji'? It was 'follow the convention'" | Corrected DESIGN_PRINCIPLES + CLAUDE.md (DL-7) | ✅ |
| S2·M6 | "track my user msgs verbatim; practice the process again" | `USER_MESSAGES.md` + this re-practice | ✅ |

---

## 4. Decision log (decisions + rationales)

- **DL-1 — Shipped vanilla JS, not Preact (supersedes DESIGN_SPEC §1 original).**
  The spec recommended Preact+htm for transfer value. At build time (after S2·M3
  "you decide what's best behind the scene; I'll judge only by the webpage") I
  built vanilla: zero new dependencies, lowest regression risk, reuses the
  existing loader, and the webpage is identical to the user either way. Transfer
  value is preserved in the framework-agnostic artifacts (DS registry pattern,
  token layer, checklist method) — those, not the framework, are what port to
  lit-review. *Per S2·M3 "docs are the product of the build," DESIGN_SPEC is
  updated to record vanilla as the shipped choice with Preact noted as the
  option to revisit if/when the lit-review app's interactivity warrants it.*

- **DL-2 — metaPreview field names must be verified against live data.**
  Caught this pass: PRBench `['source','category']` and StatEval `topic` did not
  exist; MathTrap/StatQA entries duplicated existing tags. Verified the real
  `native` schema of all 6 datasets and corrected to existing, non-duplicate
  fields (HARDMath→answer_type, MathTrap→source_dataset, PRBench→domain+topic,
  StatEval→level+subtype, StatQA→dataset_name, CMT→none). *Lesson: "config-
  driven" only fixes the blank-preview bug if the configured keys are validated
  against the data, not invented.*

- **DL-3 — Principles kept as repo docs, not yet a skill.** Promote to a Claude
  Code `SKILL.md` only after a second page (lit-review) validates the patterns.

- **DL-7 — No invented principles.** The "no-emoji principle" was never stated;
  the user said "follow the convention." Affordance buttons shouldn't lean on a
  glyph to do design's job; platform-brand emoji are themselves the convention
  and stay. *Meta-rule: derive principles only from the verbatim record.*

---

## 5. Open / pending

- ⏳ **Vision audit (S2·M2 #24):** screenshot the live page mobile+desktop ×
  dark+light; verify hero flatness, dim-out, tint softness, meta-hints now
  populate, no sticky gap, seamless expand.
- ⏳ **Interaction fuzzing (Q2):** randomized click/scroll emulation — deferred
  until the surface stabilizes.

## 6. Convergence check

Self-contained (every item traces to a verbatim source) · coherent (no
conflicting specs; DL-1 reconciles the one doc/build divergence) · complete
(all S2 items ✅/🔧/📝 except #24 explicitly ⏳). **Converged** pending the
vision audit.

---

## 7. Bug log — Session 3 (2026-06-14)

> Issues identified from user-submitted screenshots (S3·M1). Categories: L = LaTeX rendering, G = Gesture/animation.

| # | Category | Screenshot | Root cause | Fix | Status |
|---|---|---|---|---|---|
| L1 | LaTeX-Preview | p1–p2: subscripts garbled (dots instead of `ε x⁴`) | `stem.slice(0,350)` can truncate mid-expression; KaTeX receives incomplete `$…` and produces broken output in `.cprev` | Removed `katex-c` from `.cprev` div; removed rAF that called `renderK` on previews. Preview shows raw (escaped) text only; KaTeX fires only on expand | 🔧 |
| L2 | LaTeX-Render | p3: equation completely unrendered | Equation likely uses `\begin{align}` or similar environment with no surrounding `$$`/`\[` delimiters; auto-render silently skips it | ⏳ Needs per-dataset data investigation to confirm delimiter issue; add pre-processing if confirmed | ⏳ |
| L3 | LaTeX-Scroll | p4: equation cut short, cannot scroll | Gesture conflict (G1): swipe handler on `#main` captured the horizontal touch before the `.katex-display{overflow-x:auto}` scroll container could receive it; also added `-webkit-overflow-scrolling:touch` for iOS momentum | Fixed by G1 fix | 🔧 |
| L4 | LaTeX-Solution | p5: solution text cut short | `.spb{max-height:320px}` clips long content; content is scrollable but not obvious; some datasets also use truncated `solution_excerpt` fields by design | Increased `.spb` max-height 320→500 px, `.ansb` 280→400 px | 🔧 |
| G1 | Gesture | Horizontal equation scroll triggers bench switch | `touchstart`/`touchend` on `#main` checked `dx>60 && dx>dy*1.8` without detecting whether the touch originated inside a scrollable element | On `touchstart`, walk ancestors from touch target to `#main`; set `_swipeBlocked=true` if any has `scrollWidth > clientWidth+2`; skip bench switch on `touchend` when blocked | 🔧 |
| G2 | Animation | Bench switch flashes/abrupt (not smooth) | `switchTab()` synchronously replaces `#cc` innerHTML with no transition | Added CSS `@keyframes fadeSlideIn` (opacity 0→1, translateY 5→0, 0.35s eased); `renderCards(d,rows,animate)` restarts it via class toggle + forced reflow; `switchTab` passes `animate=true` | 🔧 |

### Decision DL-8 — No KaTeX on preview text (L1 root-cause resolution)

The collapsed preview (`stem.slice(0,350)`) is fundamentally unsafe to feed into KaTeX: any cut inside a `$…$` expression produces corrupted glyph output. The correct invariant is: **KaTeX only fires on complete, unspliced text nodes** — i.e. `.cstem` (full stem on expand), `.spb` (spoiler on reveal), `.ansb` (answer on toggle), and the modal. Raw-text preview with `-webkit-line-clamp` costs zero rendering and has zero risk of corruption. If math in the preview is desired in future, truncate at a safe boundary *before* the first `$` that would be cut; but this is lower priority than avoiding garbled output.

---

## 8. S4 session log (2026-06-15) — complete all remaining items

### 8a. Batch 1 — All deferred open items (B-N2/N4/N5/F2/V1/V3/V4/V6, F-H2/H5, B-V2)

All 41 tracked items resolved. Final emulator run: `pass:true, tabs:7, cards:30, chips:8, fnbs:6, errors:[]`.

See Issue #32 (now closed) for the full resolution table.

### 8b. Batch 2 — UX audit pass (Playwright multi-perspective)

Playwright emulator run as: (1) mobile researcher, (2) undergrad student, (3) data auditor.

Findings and fixes:

| Finding | Fix | Verified |
|---------|-----|---------|
| MathTrap Trap/Hint cards show only the modified problem with zero original context | Added `.cctx` "◈ Original Problem · from {source}" section using `native.original_problem_text`; fires only for Trap/Hint role | ✅ hasCtx:true on 0_Trap |
| Spoiler label "Solution" wrong for MathTrap — content is `human_annotation` (trap analysis) | Added `solLabel` function to DS registry; MathTrap returns 'Trap Analysis' | ✅ spoilerLabel confirmed |
| HARDMath filter chips show raw `nondimensionalization_symbolic` with underscores | `renderFB`: `displaySv = sv.replace(/_/g,' ')` for display while raw value stays in filter logic | ✅ no underscores in chips |
| `metaPreviewText` also shows underscored values in card header meta hint | `.map(v=>String(v).replace(/_/g,' '))` in `metaPreviewText` | ✅ |
| StatEval filter descriptions keyed on 'standard'/'easy'/'medium'/'hard' — actual values are 'foundational'/'graduate'/'undergraduate' | Rewrote filterDescriptions with correct keys; all 7 StatEval chips now have ⓘ | ✅ all chips `hasTooltip:true` |
| ~50% of chips across all datasets had no tooltip (no filterDescriptions entry) | Added complete descriptions for CMT (PEPS/SM/VMC/Other), HARDMath (all 12 types), MathTrap (trap_category), PRBench (Finance/Legal), StatEval (subject), StatQA (task) | ✅ StatQA: all 7 have tooltip |
| CMT descriptions too technical for undergrad | Rewrote all to include plain-language "what it computes" alongside the acronym | ✅ |

### Decision DL-10 — MathTrap context vs. inline triplet linking

Option A: Cross-link triplet members at render time by ID prefix (0_Original ↔ 0_Trap).
Option B: Use `native.original_problem_text` already present on ALL records.

Chose B: zero cross-dataset join needed; always available even when filtered to Trap-only view; simpler template code. The original problem text is the only evidence needed for the dedup context — the user can compare trap stem vs. original stem directly in the same card.

### Decision DL-11 — Chip label cleaning

Chip values like `nondimensionalization_symbolic` are raw native field values stored as filter keys. Cleaning with `.replace(/_/g,' ')` applies only at the display layer; the raw value is still passed to `togFilt` so filter logic is unaffected. This maintains the invariant that displayed label ≠ stored key is fine as long as display is a deterministic transformation of the key.

---

### Decision DL-9 — Swipe vs. scroll: block-not-delegate (G1 resolution)

The swipe handler delegates only the `touchend` branch, but the gate must be set at `touchstart` (when the touch target is available). Walking to the first `scrollWidth > clientWidth` ancestor is the minimal detection: it fires for `.katex-display{overflow-x:auto}` when an equation is wider than its container, and for any future horizontally-scrollable element, without naming specific classes. The `+2` epsilon absorbs sub-pixel rounding without false-positives on non-scrollable content.

---

## 9. S4 self-audit — info accuracy pass (2026-06-16)

### 9a. Audit method

Python analysis of all `filterDescriptions` keys vs. actual chip values produced by `renderFB` (from live Playwright chip enumeration across all 6 tabs). Cross-checked dataset `desc` fields against actual question_type/subset chip counts.

### 9b. Findings and fixes

| Dataset | Issue | Fix | Status |
|---------|-------|-----|--------|
| CMT | filterDescriptions had 4 dead keys: DMET, DFT, CCSD, GW — none appear in actual chip set (8 chip values: DMRG/ED/HF/QMC/PEPS/SM/VMC/Other) | Removed dead keys from CMT filterDescriptions | ✅ |
| HARDMath | `desc` said "scaling analysis" — scaling_analysis has 0 records in data | Rewrote desc: "ODEs, integrals, nondimensionalization, and polynomial root-finding" | ✅ |
| HARDMath | filterDescriptions question_type had 6 dead keys: scaling_analysis, nondimensionalization (bare), approximation, series_expansion, word_problems, PDE — none appear as chips | Removed dead keys; kept: ODE/integral/nondim_symbolic/nondim_numeric/poly_roots/poly_roots_corrections | ✅ |
| MathTrap | filterDescriptions triplet_role had 'Hint' — no Hint records exist in 208-item public release; context() also guarded for Hint role unnecessarily | Removed 'Hint' from filterDescriptions; removed Hint from context() guard (now `role!=='Trap'` only) | ✅ |
| PRBench | `desc` said "finance, economics, and regulatory domains" — actual fields are Finance(600) + Legal(500) | Changed to "finance and legal domains" | ✅ |
| PRBench | `is_hard` filter in `filters` array — always suppressed because all 1100 records have same is_hard value (renderFB skips groups with <2 unique values); is_hard tag also meaningless if uniform | Removed is_hard from filters, tags, and filterDescriptions | ✅ |

### 9c. Post-fix emulator result

```json
{
  "tabs": 7, "cards": 30, "hasPrepTex": true,
  "prBench": { "hasIsHardFilter": false, "chips": ["Finance 600","Legal 500"] },
  "hardMath": { "hasScalingChip": false, "chips": ["ODE","integral","nondim numeric","nondim symbolic","poly roots","poly roots corrections","main","mini","word problems"] },
  "mathTrap": { "hasHintChip": false, "chips": ["Original","Trap","Concept Undefined","Direct Contradiction","Indirect Contradiction","Missing Condition","Violating Common Sense"] },
  "cmt": { "hasDeadKeys": false },
  "errors": []
}
```

All accuracy issues resolved. Zero dead filterDescriptions keys. Zero factually-wrong desc fields.

### Decision DL-12 — Dead filterDescriptions keys

Dead keys (filterDescriptions entries with no matching chip) are actively misleading: if a tooltip appears in some future display mode, it would claim fields exist in the data that don't. The policy going forward: only include a filterDescriptions key when a corresponding chip *actually appears* in the current data. This is validated by the self-audit emulator run above.

---

## 10. S5 — ES module refactor (2026-06-17)

> Trigger: user asked whether to refactor to React for maintainability/context
> efficiency. Decision (DL-13): native ES modules instead — same modularity win,
> zero build step, deployment workflow unchanged. SPEC-FIRST per process recipe:
> see `MIGRATION_SPEC.md`.

### 10a. What changed
Monolith `index.html` (1133 lines) split into:
- `css/{tokens,layout,cards}.css` (3) — tokens = portable layer per transfer notes
- `js/{util,katex,registry,state,data,render,app}.js` (7) — `app.js` = entry
- `index.html` → 70-line shell (head + markup + one module script)

### 10b. Two gotchas (resolved)
| ID | Gotcha | Fix | Verified |
|----|--------|-----|---------|
| G1 | Inline `onclick="fn()"` resolves against window; module top-level is module-scoped | Single `Object.assign(window,{…})` block in app.js lists all 19 inline-referenced handlers | `window.switchTab` true on live |
| G2 | KaTeX `<head>` onload may fire before/after module exec (deferred-script race) | `window._flushKatex` assigned at module-eval; head onload guarded `&&`; renderK queues if `!_katexReady` | KaTeX renders on live |

### 10c. Verification
- `node --check` all 7 modules ✓
- Local Playwright smoke (http.server, since file:// blocks modules) ✓
- Live Playwright gate: `pass:true` — tabs=7, cards=30, hasApp=true, expand,
  KaTeX render, filter 30→4, MathTrap context, 6 nav buttons, zero real errors.

### Decision DL-13 — ESM over React
React requires a bundler → either committed build artifacts or a CI pipeline,
both new failure surfaces antithetical to the MCP static-push model. Native ESM
delivers the same module boundaries (registry as the extension point, token
layer portable) with no toolchain. `render.js` emits onclick strings rather than
importing handlers, which keeps the import graph acyclic (render never imports
app). Migrate to React only if/when multi-page growth (lit-review,
per-contributor) justifies a real pipeline — that is the natural trigger.

### Doc maintenance this pass
- CLAUDE.md: added Source-layout section; rewrote deploy recipe BLOCK A/B for
  multi-file git push; **fixed BLOCK C verify gate** (`typeof prepTex` →
  `typeof window.switchTab`, since prepTex is no longer global) — the old gate
  would have false-failed every future session.
