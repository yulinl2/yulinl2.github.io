<!-- ============================================================= -->
<!-- ⚠️ FORK-TREE WARNING — DO NOT NEGLECT ⚠️                       -->
<!-- The official StatsUpAI source `Statsup-AI/statsupai.github.io` -->
<!-- is NOT the upstream/root — it is itself a FORK within a fork   -->
<!-- tree. This `statsupai-revamp/` is a downstream PERSONAL mirror.-->
<!-- Changes here do NOT auto-propagate to the live site, and the   -->
<!-- "obvious parent" is NOT necessarily canonical. Re-verify fork  -->
<!-- lineage before any PR / push / sync. See repo-root CLAUDE.md.  -->
<!-- ============================================================= -->

# Maintaining the StatsUpAI site (for non-technical maintainers)

You almost never touch HTML. Content lives in **JSON data files**; the site
renders itself. Edit a file on GitHub, commit, and the automated checks +
GitHub Pages do the rest.

## Add or update a webinar

Edit **`assets/data/events.json`** → add an object to `talks`:

```json
{
  "date": "2026-03-04",
  "time_et": "12:00 PM",
  "duration_min": 60,
  "speaker": "Jane Doe",
  "affiliation": "MIT",
  "title": "Talk title here",
  "series": "GenAI",
  "registration_link": "https://…/register",
  "recording_link": ""
}
```

- `series` must be `"Health"` or `"GenAI"`.
- The page **auto-sorts** into *Upcoming* vs *Past* by today's date — no manual moving.
- An **Add to calendar** (`.ics`) button is generated automatically.
- After a talk, paste the YouTube/recording URL into `recording_link`; it
  flips to a **Watch recording** button.

## Add a dataset / review article / pipeline

Edit **`assets/data/resources.json`** → add an object to `datasets`,
`articles`, or `pipelines`:

```json
{ "title": "New Resource", "tag": "Genomics", "url": "https://…", "desc": "One sentence." }
```

The page rebuilds its cards, search box and topic filters from this file.

## Add or change a team member

Edit **`assets/js/team-data.js`** (one array). The card grid and the A–Z
roster both render from it.

## Backup reference links (LinkedIn / X / YouTube)

When you find a post that documents a talk, drop its URL into
**`assets/data/reference-links.json`** → `refs`:

```json
{ "url": "https://www.linkedin.com/posts/stats-up-ai_…", "match_date": "2026-05-26", "platform": "linkedin", "note": "" }
```

- `match_date` = the talk's `events.json` date if you know it; otherwise add
  the object to `unsorted` and it'll be classified on the next sweep.
- Individual LinkedIn/X **post** URLs are fetchable even though the
  company/profile pages are login-walled — so paste the specific post link,
  not the profile.
- CI only validates the JSON; the actual cross-check/fill into `events.json`
  happens on the next Claude sweep. The entries are also listed on the
  Decision Board page for visibility.

## Decision board

`roadmap.html` (internal, `noindex`) renders **`assets/data/roadmap.json`** —
every proposed feature, decision and blocker, filterable by status/category.
To add or move an item, edit one object in `roadmap.json` (status:
`proposed | in-progress | blocked | decided | done`; owner: `you` = needs a
human decision, `claude` = I can execute). It is not linked from the public
nav; bookmark `/<…>/roadmap.html`.

## What the robots can do for you

Every change is checked automatically (`.github/workflows/statsupai-revamp.yml`):

- JSON files must parse (a missing comma is caught before it ships).
- No broken internal links.
- Each page keeps one `<h1>`, a title, and canonical URL.
- **Asset-weight budget**: build fails if any file is too large — this is the
  guardrail that prevents the old site's 12 MB-image problem from returning.

If a check fails, the commit/PR shows a red ✗ with the exact reason.

## Known follow-ups (need image tooling, not available here)

- Team headshots are the original unoptimized files (some ~0.8 MB). Re-encode
  to **WebP ~120 KB**, add `srcset`, then tighten `MAX_ASSET` in
  `scripts/check.mjs` from 900 KB down to ~120 KB.
- Generate a raster `og.png` from `assets/img/og.svg` (some scrapers ignore SVG OG).

## Deployment notes

This revamp is a self-contained static site. For the preview it lives at
`https://yulinl2.github.io/statsupai-revamp/`. When promoted to the
`statsupai.org` domain root, `robots.txt`, `sitemap.xml` and `404.html`
become active automatically (they only work from a domain root, not a
subfolder). To turn on analytics, set `MEASUREMENT_ID` in
`assets/js/analytics.js` (it stays off on preview/fork hosts and honors
Do Not Track).
