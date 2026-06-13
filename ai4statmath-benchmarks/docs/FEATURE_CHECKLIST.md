# Feature Checklist — Sufficiency Guarantee

> **Purpose.** This is the exhaustive inventory of every behavior the page
> currently provides. Any refactor (this one or a future "surgeon") MUST be
> checked line-by-line against this list. A feature is only allowed to change
> *how* it works if the row is consciously updated here — nothing may be
> silently dropped.
>
> Status legend: `[x]` present in current live build · `[~]` present but flagged
> for change this round · `[+]` new this round. Keep this file in sync with the
> code on every change.

---

## A. Data Layer

- [x] **A1** Six datasets registered: CMT-Benchmark, HARDMath, MathTrap-public,
  PRBench, StatEval-public, StatQA-mini.
- [x] **A2** Each dataset config carries: `id`, `label`, `count`, `color`,
  `desc`, `arxiv` id, `hf` slug, `ans(row)`, `sol(row)`, `tags(row)`,
  `filters[]` (each `{key,label,get(row)}`).
- [x] **A3** Per-dataset answer/solution **extractors** (e.g. PRBench rubric
  buckets parsed from JSON; StatQA ground-truth assembled from methods/columns/
  result; StatEval excerpts). These mappers are dataset-specific and must be
  preserved verbatim in behavior.
- [x] **A4** Per-dataset **tag derivation** (e.g. MathTrap triplet-role colored
  classes ro/rt/rh; difficulty → de/dh; tier → dx; subset → dm).
- [x] **A5** Per-dataset **filter fields** (e.g. HARDMath type+subset; PRBench
  field+is_hard; StatEval tier+level+subject; StatQA difficulty+task).
- [x] **A6** Data fetched as `data/<id>.ndjson.gz.b64`, gzip+base64, decoded
  client-side via `atob` + `DecompressionStream('gzip')`.
- [x] **A7** Lazy load per dataset; cache in memory; in-flight guard; the
  `native` field is JSON-parsed when it arrives as a string.
- [x] **A8** Load error → error box with message + **Retry** button.
- [x] **A9** Loading spinner with dataset name while fetching.

## B. Shell / Navigation Structure

- [x] **B1** Sticky **header**: logo, Random-problem button, Theme toggle.
- [x] **B2** Sticky **tab strip**: one tab per dataset (color dot + count
  badge) + a Bookmarks tab; horizontally scrollable; active underline in
  dataset color.
- [~] **B3** **Search bar** (sticky) with result count. *Change: eliminate the
  background-leak gap above it; keep count attached.*
- [~] **B4** **Banner / hero** (title, description, arXiv / HuggingFace / NDJSON
  source links). *Change: "unbox" — flatten onto the page plane so it reads as a
  lower layer than the raised problem cards.*
- [x] **B5** **Filter bar**: per-dataset filter chips, sort dropdown, compact
  toggle. Hidden when a dataset has <2 distinct values for a field.
- [x] **B6** Footer with data-source attribution + KaTeX credit.

## C. Problem Card

- [~] **C1** Collapsed card: header row + preview body (first ~350 chars /
  5-line clamp). *Change: preview line-height/spacing must be IDENTICAL
  pre- and post-expansion (no reflow jump on click).*
- [x] **C2** Header: source id (monospace), tags, bookmark star, expand
  chevron.
- [~] **C3** Header **meta-hint** (compact rich metadata to the right of tags,
  truncated, tap → full info). *Currently broken — heuristic yields empty
  string for most rows. Replace with per-dataset configured `metaPreview`
  field list.*
- [x] **C4** Expanded card: full stem, Solution spoiler, Metadata table.
- [x] **C5** One-click expand/collapse via tap on header **and** body **and**
  stem (long-press still selects text).
- [x] **C6** **Solution spoiler**: tap-to-reveal, rotating chevron, scrollable
  (max-height), sticky in-panel collapse button, hint text that hides on open.
- [x] **C7** **Answer bottom bar**: always-visible footer button that toggles a
  scrollable answer panel INDEPENDENTLY of card expansion (no need to expand
  the stem). Chevron rotates; sticky collapse button.
- [~] **C8** Answer button currently uses 👁 emoji. *Change: drop emoji; use
  shadow (volume) + tinted fill (distinction) instead.*
- [x] **C9** **Metadata table**: toggle open/closed; shows source_id,
  benchmark, ingested_at, and all non-skipped `native` fields.
- [x] **C10** **Bookmark** star toggles persistence (localStorage); updates
  tab count.
- [x] **C11** Source link (`lookup_url`) opens in new tab when present.
- [~] **C12** Card focus styling. *Change: dim NON-focused cards rather than
  sharpen the focused one.*
- [~] **C13** Alternating odd/even row tint. *Keep, but soften.*

## D. Interactions / Gestures

- [x] **D1** **Random problem** → opens modal (R key + header button).
- [x] **D2** **Theme toggle** dark/light, persisted, sun/moon SVG swap.
- [x] **D3** **Search** debounced (200ms), matches stem text.
- [x] **D4** **Filters** multi-select chips per field (AND across fields, OR
  within a field).
- [x] **D5** **Sort**: default / shuffle / id↑ / id↓.
- [x] **D6** **Compact mode** toggle (hides bodies/footers for dense scan).
- [x] **D7** **Pagination** 30/page, prev/next + page indicator.
- [x] **D8** **Floating nav** (7 controls): ⤒ first-Q · ↑ prev-Q · ‹ prev-page ·
  n/m indicator · › next-page · ↓ next-Q · ⤓ last-Q.
- [x] **D9** **Swipe** left/right on main area → switch benchmark (not on
  bookmarks tab).
- [x] **D10** **Keyboard**: `/` search · `r` random · `Esc` clear/blur/close ·
  `←/→` page · `↑/↓` & `j/k` question focus · `Home/End` first/last-Q on page ·
  `Enter` expand focused.
- [x] **D11** **Modal** (random detail): stem + answer + solution spoilers,
  close via ✕ / backdrop / Esc.
- [~] **D12** Press-feedback animations on buttons (scale). *Keep, but make all
  motion slower/smoother per the low-stimulus principle.*

## E. Bookmarks

- [x] **E1** localStorage persistence (`ai4sm_bm`).
- [x] **E2** Bookmarks tab renders saved cards across datasets (only those
  whose data is already loaded).
- [x] **E3** Empty-state message.

## F. Rendering / Accessibility

- [x] **F1** **KaTeX** auto-render (deferred queue until CDN ready; re-render on
  expand and on preview via rAF). Delimiters: `$…$`, `$$…$$`, `\(…\)`, `\[…\]`.
- [x] **F2** HTML escaping of all injected content.
- [x] **F3** Responsive grid: 1 col mobile / 2 col ≥700px / 3 col ≥1100px.
- [x] **F4** Sticky offsets calibrated so scroll-to-card clears the sticky
  header/tabs/search (`scroll-margin`, dynamic `top`).
- [~] **F5** Hyperlink styling. *Change: underline text links per convention
  (currently pill links + un-underlined inline links).*
- [x] **F6** Theme + bookmark + (new) any prefs persist across reloads.
- [x] **F7** SEO/meta: description, og tags, canonical.

---

## Refactor acceptance rule

The refactor is **complete** only when every `[x]` row above behaves
identically in the new build, every `[~]` row is resolved per its change note,
and every `[+]` row is implemented. Walk this list as the final QA pass before
merge to `main`.
