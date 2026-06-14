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
