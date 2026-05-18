# StatsUpAI architecture remap (live → revamp)

Decision: the revamp is the **curated front door**. Deep, well-maintained
content (dataset directories, review-paper lists, webinars) is reproduced
faithfully & data-driven. One-off/aging cruft is dropped or linked out.

## Top-level IA (revamp nav — unchanged, correct)
Home · Datasets · Review Articles · Pipelines · Community News · Team · Events
(+ internal: roadmap.html)

## Per section

### Datasets — BUILD child pages
Live: index + 8 substantive curated directories (~88 datasets). 
Revamp: `datasets.html` index + one data-driven detail view per category,
from `assets/data/datasets-detail.json` (see `_reference/datasets.md`).
Genomics = external link only.

### Review Articles — Zotero-driven
Live: Zotero group 5407414 (~260+ papers, 11 pages). 
Revamp: data-driven renderer hitting the same public API, grouped by the
collection map in `_reference/articles.md`, with cached fallback + noscript
outbound links. Faithful AND auto-current.

### Pipelines — FIX to match live (5 entries)
EHR pipelines (placeholder repo) · Neuroimaging Processing Software (empty
stub — keep listed, mark "in progress") · Enhance ADMET ML Models
(cfanalysis) · Clinical Trials Data Processing (EUCTR) · Evaluate Target
Druggability (Tclin-like). Tools under github.com/mquazi.

### Team — FIX (add 2)
Add Lautier, Jackson (Bentley) + Xia, Zhiqiu (Rutgers). Total 21.

### Community News — enrich
Live feed = Quarto posts index, 73 posts, multi-tagged categories.
Revamp: category chips + recent-posts list (small JSON), deep-link to the
Quarto posts (don't iframe).

### Events — P1, enrich
Collapsible cards: abstract, bio, speaker site, registration, recording +
platform icon; grouped Upcoming/Past × series; color-coded; real logo.
Data: `assets/data/events.json` (+ `_reference/talks.md` warehouse).

## Dropped (cruft, not surfaced; reachable via Community/links if needed)
Legacy template pages, backups, test.html, raw quarto interview posts
(linked from Community, not nav), BIRS/workshop one-offs (Community/Archive,
not the webinar series).

## Cross-links to fix
char.html (Organization/Charter) and 2026-ec-election — surface under
Community/footer "Governance", not buried.
