# StatsUpAI revamp — Reference Warehouse

Durable, append-only knowledge base for the build-out (tracking issue #15).
Survives context cycling — **read this first** when resuming work.

## Files
- `SITEMAP.md` — real architecture of the live statsupai.org; what's
  reachable, what's cruft, how it maps to the revamp.
- `datasets.md` — full inventory of the Datasets section + 8 child pages
  (source of truth for `assets/data/datasets-detail.json`).
- `articles.md` — Review Articles section + child pages.
- `pipelines-team-community.md` — Pipelines, Team, Community inventories.
- `talks.md` — durable webinar database: per-talk abstract, bio, speaker
  site, registration, recording, platform. Feeds `assets/data/events.json`.
- `sources.md` — index of the email/X/web sources used (the "warehouse").
- `DESIGN-NOTES.md` — design-system decisions + rationale.

## Conventions
- Reference docs are FACTUAL transcriptions of live/source content. Do not
  invent. Mark unknowns as `TODO` so later passes (or the maintainer) fill them.
- Every revamp page must trace its content to a line in these docs.
- `_reference/` is excluded from the public site (noindex / not linked).
