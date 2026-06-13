# Design Principles & Config Strategies (Transferable)

> Reusable rationale for the AI4StatMath public pages. Written to transfer to
> the lit-review and per-contributor review refactors. Each principle states
> the **rule**, the **why**, and the **token/pattern** that encodes it so the
> next page inherits the behavior rather than re-deriving it.
>
> Promotion path: once validated on a second page, this file can be mirrored as
> a Claude Code skill (`SKILL.md`) so future sessions auto-apply it.

---

## I. Calm UI / ADHD-friendly (the north star)

The audience scans dense math under cognitive load. Every visual decision is
graded by **stimulus cost vs. information gain**. Lower stimulus wins ties.

### P1 — One raised elevation tier
**Rule.** Exactly one layer "sticks out" (the problem cards). Everything else
(hero, filter bar, page chrome) lies flat on the background plane.
**Why.** Multiple competing raised boxes read as crowded/saturated; flattening
context elements makes the actionable content unmistakable and the page calmer.
**Token.** `--elev-card` (single shadow recipe). Context blocks use background
tint + hairline border, never elevation.

### P2 — Dim the rest, don't spotlight the one
**Rule.** To draw focus, *reduce* the opacity/saturation of non-focused
elements rather than *increasing* the focused element's intensity.
**Why.** Additive highlights (bright rings, saturated borders) are stimulus
spikes that fatigue. Subtractive focus is calmer and equally legible.
**Token.** `--opacity-dim` on a container state class (e.g. `.focusing >
:not(.focused){opacity:var(--opacity-dim)}`).

### P3 — Soft tints, reserved saturation
**Rule.** Body/tag/highlight tints stay low-saturation and low-alpha. Full
saturation is reserved for small wayfinding anchors (tab underline, color dot,
floating-nav active state).
**Why.** A page full of saturated color has no focal hierarchy and tires the
eye; saturation should mean "look here," used sparingly.
**Token.** Per-accent `--tint-weak` (fill), `--tint-line` (border),
`--accent-anchor` (the reserved saturated value). Audit with the vision tool.

### P4 — Slow, eased motion
**Rule.** Transitions are unhurried and eased (no snappy/linear pops).
**Why.** Fast/bouncy motion is a stimulus burst; gentle motion communicates
state change without startling. Anti-stress, anti-fatigue.
**Token.** Motion scale — `--motion-fast`, `--motion`, `--motion-slow` with a
single shared easing (`--ease`). Press feedback uses a brief scale, but the
*return* is eased and slightly longer than the press.

### P5 — Seamless state transitions
**Rule.** Expanding/collapsing must not reflow shared content. The preview and
the full text share one type ramp (line-height, size, spacing); only
visibility/clamp differs.
**Why.** Layout jumps on click break the sense of direct manipulation and cost
re-orientation effort.
**Pattern.** Render one styled text node; toggle a `-webkit-line-clamp` (or
`max-height`) rather than swapping differently-styled nodes.

### P6 — Convention over cleverness
**Rule.** Follow web conventions: underline inline text links; use shape +
shadow + tint (not emoji) to signal affordance/volume/distinction.
**Why.** Conventions are zero-learning-cost. Emoji glyphs are inconsistent
across themes/platforms and read as decorative noise on a dense scholarly page.
**Pattern.** Inline text links → underline. Buttons → tinted fill + soft shadow
for "raised/pressable"; distinct tints for distinct actions (answer vs
solution vs source). Reserve SVG icons for controls where a glyph genuinely
speeds scanning (nav arrows, theme).

### P7 — Generous, predictable touch targets
**Rule.** Interactive controls ≥ ~38px; sticky offsets keep scrolled-to content
clear of fixed chrome.
**Why.** Small/uncertain targets induce precision anxiety → attention drain.
**Token.** `--hit-min: 38px`; `scroll-margin` set from measured chrome height.

---

## II. Architecture / Config Strategy

### P8 — Config-driven datasets
**Rule.** Everything dataset-specific lives in one registry entry: identity,
colors, links, and **field mappers** (`ans`, `sol`, `tags`, `filters`,
`metaPreview`). Components read only the registry.
**Why.** Adding a dataset = one object. Porting to another page = swap the
registry. No component edits.
**Pattern.**
```js
{ id, label, count, color, desc, arxiv, hf,
  ans:  r => …,        // answer text or null
  sol:  r => …,        // solution text or null
  tags: r => [{l,c}],  // label + class
  filters: [{key,label,get}],
  metaPreview: ['field_a','field_b'] }  // explicit, never heuristic
}
```
> **Lesson learned.** Heuristic metadata selection (guess "short string
> fields") silently produced empty previews. Explicit per-dataset field lists
> are predictable and debuggable.

### P9 — Tokens are the single source of visual truth
**Rule.** Color, motion, elevation, spacing, opacity, hit-size are CSS custom
properties in one `:root` block (+ theme overrides). Components reference
tokens only.
**Why.** "Soften everything", "slow everything", "dim focus" become one-line
token edits that apply uniformly and transfer to the next page wholesale.

### P10 — Zero-build, single-file, CDN deps
**Rule.** Ship one `index.html` with deps from CDN (Preact, htm, signals,
KaTeX). Data ships as sibling static files.
**Why.** Keeps deployment to a plain static push (works with the MCP
file-push workflow and any static host); no bundler/CI to maintain across
pages.

### P11 — Components mirror the feature checklist
**Rule.** Each checklist feature maps to a named component or interaction
module. The checklist is the contract; components are its implementation.
**Why.** Makes the sufficiency guarantee mechanical: every `[x]` row has a home,
and a "surgeon" can trace any feature to one component.

### P12 — Signals for state, lifted to module scope
**Rule.** App state (current tab, page, query, filters, sort, theme, focus,
prefs) lives in signals; components subscribe. Side effects (persistence,
KaTeX render, sticky calibration) run in effects.
**Why.** Declarative reactivity scales cleanly to the more interactive
review pages (per-contributor state, review status, etc.).

---

## III. Process (how to revamp without regressions)

### P13 — Spec before surgery
Produce/refresh `FEATURE_CHECKLIST.md` and `DESIGN_SPEC.md` before a
from-scratch change. The checklist is the regression net.

### P14 — Stage by dependency, branch by decoupling
Order work so each stage builds on a stable prior (tokens → scaffold → shell →
cards → interactions → QA). Parallelize only within a stage.

### P15 — Audit with eyes, then with bots
Screenshot-audit rendered output (vision tool) across mobile/desktop ×
dark/light before merge. Add randomized click/scroll fuzzing once the surface
stabilizes.

### P16 — Develop on branch, promote on convergence
Build on the feature branch; run the full checklist QA pass; merge to `main`
(live) only when self-contained, coherent, and complete.
