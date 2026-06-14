# Design Spec — Benchmark Explorer Refactor (Round: Modularization + Calm UI)

> Structured design request consolidating all feedback through 2026-06-13,
> with motivations, conflict resolution, and a staged task breakdown. This is
> the execution contract. Pair with `FEATURE_CHECKLIST.md` (sufficiency
> guarantee) and `DESIGN_PRINCIPLES.md` (transferable rationale).

---

## 0. Context & Goal

The page (`yulinl2.github.io/ai4statmath-benchmarks/`) browses ~14.8k QA
problems from 6 public math/stat benchmarks. It works, but has grown as one
1000-line HTML file. This round does two things at once:

1. **Calm-UI pass** — reduce visual saturation/stimulus (ADHD-friendly), fix
   layering, fix three concrete bugs.
2. **From-scratch modular refactor** — turn the page into a *reference
   implementation* whose patterns transfer to the upcoming **lit-review** and
   **per-contributor review** refactors.

> **Transfer mandate (why this matters).** The user intends to reuse this
> architecture and these design patterns on larger, more interactive pages.
> Decisions are therefore optimized for *transferability and documentation*,
> not just this page.

---

## 1. Architecture Decision

> **SHIPPED: vanilla JS, zero build.** See VALIDATION_LOG DL-1. The
> comparison below was the pre-build analysis (Preact+htm was the leading
> *recommendation*); at build time, after the user said "you decide what's best
> behind the scene; I'll judge only by the webpage," vanilla was chosen for zero
> new dependencies, lowest regression risk, and reuse of the existing loader —
> the rendered page is identical either way. Transfer value lives in the
> framework-agnostic artifacts (DS registry, token layer, checklist method), not
> the framework. Preact remains the option to revisit when the lit-review app's
> interactivity warrants reactive components.

**Pre-build comparison (recommendation was Preact + htm + signals, CDN, zero build):**

| Criterion | Vanilla | **Preact+htm (chosen)** | React+Vite |
|---|---|---|---|
| Build step | none | **none** (CDN ESM) | bundler + CI |
| Deployment | MCP static push | **MCP static push (unchanged)** | build+commit/Action |
| Component model | manual | **yes** | yes |
| Reactive state | manual | **signals** | hooks |
| Bundle weight | ~0 | **~4KB** | ~140KB |
| Transfers to bigger app | patterns only | **components + state patterns** | components + state |

**Rationale.** The transfer goal wants a genuine component + state model
(carries to interactive review pages). The deployment constraint wants
zero-build static files (one pushable `index.html`, data as `.gz.b64`
siblings). Preact+htm is the only option that satisfies both. React+Vite's
bundler/CI overhead and 140KB weight conflict with both the deployment model
and the low-stimulus/fast goal; pure vanilla wouldn't demonstrate a
component/state pattern worth transferring.

**Module layout (single-file output, authored as logical layers):**

```
index.html
  <style id="tokens">      design tokens (see DESIGN_PRINCIPLES)
  <style id="components">   component styles
  <script type="module">
    config/   DATASETS registry, field mappers, metaPreview lists
    state/    signals: tab, page, query, filters, sort, theme, focus, prefs
    data/     loader (gz.b64 → rows), cache, errors
    render/   <Banner> <Tabs> <SearchBar> <FilterBar> <Card> <Spoiler>
              <AnswerBar> <MetaTable> <FloatingNav> <Modal> <Bookmarks>
    interact/ expand, swipe, keyboard, focus, pagination
    katex/    deferred render queue helper
    app/      <App> root + mount + sticky calibration
```

Everything that is data-shaped (which fields map to answer/solution/tags/
filters/**metaPreview**) lives in `config/` so adding a dataset = one entry,
and porting to lit-review = swap the registry.

---

## 2. Consolidated Feedback (this round)

Grouped by natural boundary to reduce per-branch context load.

### Group V — Visual calm / layering
- **V1 Unbox the hero.** Benchmark info "card" should flatten onto the page
  plane (no raised box) so problem cards are the only raised layer → balanced
  heights, less crowding/saturation.
- **V2 Soften tints further.** Reduce saturation of accent/tag/highlight tints
  (audit with vision tool).
- **V3 Dim-out, not light-up.** On focus/expand, *dim the other* cards rather
  than sharpen the focused one (sharp color = stimulus fatigue).
- **V4 Slower, smoother motion.** Lengthen + ease all transitions for a
  lower-stimulus, anti-fatigue feel.
- **V5 Underline text links** (convention) — distinct from pill/button links.
- **V6 De-emoji the Answer button**; convey volume via shadow + distinction via
  tinted fill instead of an emoji glyph.

### Group B — Bugs (seamless consistency)
- **B1 Sticky gap.** A 1–few px gap between the search bar and the tab strip
  lets page content flash through while scrolling. Eliminate (contiguous sticky
  stack, shared background, no sub-pixel gap).
- **B2 Preview reflow.** Collapsed-preview line spacing differs from the
  expanded stem; clicking causes a small jump. Make line metrics identical so
  expand/collapse is seamless.
- **B3 Meta-hint empty.** The header meta-preview renders nothing because the
  heuristic filters everything out. Replace with a per-dataset `metaPreview`
  field list in config.

### Group A — Architecture / process
- **A1** Full modular refactor, config-driven (see §1).
- **A2** Feature spec documented as a checklist = sufficiency guarantee
  (`FEATURE_CHECKLIST.md`).
- **A3** Design principles + config strategies documented for reuse
  (`DESIGN_PRINCIPLES.md`); optionally promote to a Claude Code skill.

### Group Q — Quality tooling (opportunistic, not blocking)
- **Q1** Audit rendered results with the vision tool (screenshot review).
- **Q2** Later: randomized click/scroll emulation for interaction fuzzing.

---

## 3. Spec Relationship Resolution

Conflicts and dependencies surfaced before coding:

- **V1 (unbox hero) ↔ B1 (sticky gap).** Both touch the top stack. Resolve
  together: rebuild the sticky stack as one contiguous unit (header → tabs →
  search), then render the hero as the first *flat* block inside the scrolling
  content. One change, both fixed.
- **V2 (soften) ↔ V3 (dim-out) ↔ V4 (motion).** All three are expressed as
  **design tokens** (color tints, opacity scale, motion scale). Implement the
  token layer once; the three behaviors fall out of it. This is the
  transferable core.
- **V3 (dim-out) ↔ C1/C12 (focus styling).** Dim-out replaces the focus ring's
  "sharpen" approach. Focused card = full opacity; siblings = reduced opacity
  via a container state class. Must not break keyboard `j/k` focus or
  scroll-into-view.
- **B2 (preview reflow) ↔ C5 (tap anywhere to toggle).** The preview and the
  expanded stem must share one type ramp; simplest fix is to render the *same*
  text node styling in both states (only the line-clamp differs).
- **B3 (metaPreview) ↔ A1 (config-driven).** The fix IS the architecture:
  add `metaPreview: [fields]` per dataset in the registry.
- **V6 (de-emoji answer) ↔ existing 👁/📐 glyphs.** Apply the de-emoji
  convention consistently: Answer + Solution + banner link glyphs reviewed;
  replace decorative emoji with shape/tint/shadow or inline SVG where a glyph
  truly aids scanning.

No hard contradictions. Everything reduces to: **(a) one token layer, (b) one
contiguous sticky stack + flat hero, (c) config-driven cards.**

---

## 4. Hierarchical Task Breakdown (staged by dependency)

> Stages are sequential (each depends on the prior). Branches *within* a stage
> are decoupled and can be done in any order.

### Stage 0 — Documentation (this turn)
- [x] 0.1 `FEATURE_CHECKLIST.md` (sufficiency guarantee)
- [x] 0.2 `DESIGN_SPEC.md` (this file)
- [x] 0.3 `DESIGN_PRINCIPLES.md` (transferable rationale)
- [ ] 0.4 Push docs to dev branch to preserve

### Stage 1 — Foundation (tokens + scaffold)
- [ ] 1.1 **Token layer**: color tints (softened), opacity scale (focus/dim),
  motion scale (durations + easing), elevation (shadows), spacing/radius.
  *(resolves V2, V4; enables V3, V6)*
- [ ] 1.2 Preact+htm+signals CDN scaffold; mount `<App>`; signals for all state
  in `FEATURE_CHECKLIST §D`.
- [ ] 1.3 Port `config/` registry verbatim (A1–A5) **+ add `metaPreview`** per
  dataset *(resolves B3)*.
- [ ] 1.4 Port `data/` loader (A6–A9) unchanged in behavior.

### Stage 2 — Shell (depends on 1)
- [ ] 2.1 Contiguous sticky stack: header + tabs + search as one unit, shared
  bg, no gap *(resolves B1)*; dynamic offset calibration.
- [ ] 2.2 **Flat hero** block (unboxed) below the sticky stack *(resolves V1)*.
- [ ] 2.3 FilterBar (B5) + result count.

### Stage 3 — Cards (depends on 1, 2)
- [ ] 3.1 `<Card>` collapsed/expanded with **shared type ramp** *(resolves B2)*.
- [ ] 3.2 Header with working **metaPreview** *(resolves B3, C3)*.
- [ ] 3.3 `<Spoiler>` (solution) + `<AnswerBar>` (de-emoji, shadow+tint)
  *(resolves V6, C6–C8)*.
- [ ] 3.4 `<MetaTable>`, bookmark, source link (C9–C11).
- [ ] 3.5 **Dim-out** focus model *(resolves V3, C12)*; softened odd/even tint.

### Stage 4 — Interactions (depends on 3)
- [ ] 4.1 expand/collapse (tap header/body/stem; preserve long-press select).
- [ ] 4.2 FloatingNav (7 controls, D8), pagination (D7).
- [ ] 4.3 swipe bench-switch (D9), keyboard (D10), modal (D11), random (D1).
- [ ] 4.4 Apply slow/smooth press feedback from token motion scale (D12).

### Stage 5 — Cross-cutting
- [ ] 5.1 KaTeX deferred render in component lifecycle (F1).
- [ ] 5.2 Bookmarks tab (E1–E3), theme (D2), prefs persistence (F6).
- [ ] 5.3 Underline text links (V5/F5).

### Stage 6 — QA & ship
- [ ] 6.1 Walk **every** `FEATURE_CHECKLIST` row in the new build.
- [ ] 6.2 Vision-tool screenshot audit (mobile + desktop, dark + light)
  *(Q1)*.
- [ ] 6.3 Push to dev branch; on convergence, promote to `main`.
- [ ] 6.4 (Later/optional) randomized interaction fuzzing *(Q2)*.

### Decoupled branches (can parallelize within their stage)
- **Design system** (1.1) is the upstream dependency for V2/V3/V4/V6 — do first.
- **Config/data** (1.3/1.4) is independent of the token work.
- **Shell** (Stage 2) and **Cards** (Stage 3) share only tokens; otherwise
  independent.

---

## 5. Decisions Log

- **D-1** ~~Preact+htm over React/vanilla~~ → **superseded by DL-1: shipped
  vanilla JS** (zero build, zero new deps, identical webpage; Preact deferred to
  the lit-review work). See VALIDATION_LOG §4.
- **D-2** Single-file output retained — deployment parity with MCP push.
- **D-3** Docs live in repo under `ai4statmath-benchmarks/docs/`, versioned;
  may later be mirrored as a Claude Code skill for cross-session reuse.
- **D-4** All visual-calm requests implemented as **tokens**, not one-off CSS,
  so they transfer and stay consistent.
- **D-5** Hero "unboxed" = flat block in content flow; problem cards remain the
  single raised elevation tier.
- **D-6** metaPreview becomes explicit config (not heuristic) — fixes B3 and
  serves the config-driven mandate.
- **D-7** Develop on branch `claude/parquet-ndjson-export-nyz7ia`; merge to
  `main` only after the checklist QA pass converges.

---

## 6. Open Questions (none blocking)

- Whether to promote `DESIGN_PRINCIPLES.md` to an actual skill now or after the
  lit-review refactor proves the patterns. *Default: keep as repo docs; mirror
  to a skill once validated on a second page.*
