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
