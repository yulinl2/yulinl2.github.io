# CLAUDE.md — read this before touching anything StatsUpAI-related

## ⚠️ FORK-TREE WARNING — DO NOT NEGLECT ⚠️

> **The StatsUpAI official website source repo is NOT the upstream / root of
> its fork tree. It is itself a *fork* sitting somewhere inside a larger fork
> network.**

Concretely:

- **This repo (`yulinl2/yulinl2.github.io`)** is Yulin's *personal* site. The
  StatsUpAI work lives in **`statsupai-revamp/`** and is a **downstream
  personal mirror / revamp**, not the live site.
- **The official StatsUpAI site source is `Statsup-AI/statsupai.github.io`.**
  That repo is **a fork within a fork tree — it is NOT the canonical
  upstream**. Do not assume it is the root. Do not assume a "parent" repo is
  authoritative without explicitly verifying the fork lineage first.
- Changes made here in `statsupai-revamp/` do **not** propagate to the
  official site, and changes pushed to `Statsup-AI/statsupai.github.io` do
  **not** necessarily flow "up" to any canonical source — because the canonical
  source is ambiguous in this fork tree.

**Consequences for any future agent:**

1. Never open a PR against, force-push to, or "sync from upstream" on a repo
   whose role you have not explicitly re-confirmed. The obvious-looking parent
   may not be the real source of truth.
2. When asked to "fix the StatsUpAI site", clarify *which* surface is meant:
   the personal mirror (`statsupai-revamp/` here) or the official
   `Statsup-AI/statsupai.github.io`. They are different repos with different
   lineage.
3. Treat content flowing between these repos as a **manual, reviewed** step,
   never an automatic mirror.
4. This environment's GitHub tool scope is limited to
   `yulinl2/yulinl2.github.io` and `Statsup-AI/statsupai.github.io`. The true
   upstream may be outside scope entirely — flag this rather than guessing.

## StatsUpAI mirror structure

- `statsupai-revamp/` — self-contained static revamp. Content is data-driven:
  - `assets/data/events.json` — webinars
  - `assets/data/resources.json` — datasets / review articles / pipelines
  - `assets/js/team-data.js` — team roster (single source of truth)
  - `assets/data/roadmap.json` — internal decision board (`roadmap.html`)
- `statsupai-revamp/MAINTAINING.md` — non-technical maintainer guide
- `statsupai-revamp/AUDIT.md` — design audit of the original site + rationale

See those two files (both now carry the same fork-tree banner) for details.
