> ## ⚠️ FORK-TREE WARNING — DO NOT NEGLECT ⚠️
>
> The official StatsUpAI source repo **`Statsup-AI/statsupai.github.io` is NOT
> the upstream / root of its fork tree — it is itself a fork.** This
> `statsupai-revamp/` directory is a **downstream personal mirror** in
> `yulinl2/yulinl2.github.io`. Do not treat any "parent" repo as canonical
> without explicitly re-verifying the fork lineage first. See the repo-root
> `CLAUDE.md` for the full caveat and consequences.

# StatsUpAI — Deep Design Audit & Revamp

Audit of the StatsUpAI site as found in the `yulinl2/statsupai.github.io` mirror
(last mirror commit `35db62a`, 2026-02-09). The canonical source of truth has since
moved to `Statsup-AI/statsupai.github.io`, which is outside this environment's
allowed repo scope — so findings should be re-validated against that repo, but
the structural problems below are template-level and almost certainly still present.

The revamp lives alongside this file and is served at
`https://yulinl2.github.io/statsupai-revamp/`.

## Severity summary

| # | Issue | Severity |
|---|-------|----------|
| 1 | Every page hand-duplicates a 2014 WebThemez Bootstrap-3 template | High |
| 2 | Massive unoptimized images (single 12 MB hero, 9 MB photos, ~129 MB `img/`) | High |
| 3 | jQuery + Bootstrap 3 + flexslider + fancybox + animate.css + quicksand on every page | High |
| 4 | No shared layout for classic pages — nav/footer copied by hand, drifts per page | High |
| 5 | Accessibility failures (no alt text, no skip link, color-only state, decorative carousels) | High |
| 6 | SEO/meta gaps: empty `meta description`, `author=webthemez.com`, no OG/canonical | Med |
| 7 | Community News is a `200vh` `<iframe>` to a Quarto build | Med |
| 8 | Mixed/insecure asset loading (`http://` Google Fonts, `http://html5shim…`, dup jQuery) | Med |
| 9 | Fixed-position ASA banner overlaps page content with no bottom padding | Med |
|10 | Content typos & dead links ("Stearing Committee", `link-to-*-summary.html`) | Med |
|11 | Three-stack hybrid (raw HTML + Jekyll + Quarto) with no unifying design system | Med |
|12 | Repo hygiene: `.DS_Store`, `_Rhistory`, `.backup/`, 1.7k tracked files | Low |

## Detail

**1 / 4 — Template duplication.** `index.html`, `team.html`, `datasets.html`,
`article.html`, `pipeline.html`, `community-news.html` each carry their own copy of
`<head>`, the navbar, and the script block. The navbar's `active` class is the only
per-page difference and it has already drifted (markup whitespace, comment blocks,
differing CSS link sets). There is a Jekyll `_layouts/events.html` but the classic
pages don't use it. One change to navigation = six manual edits.

**2 — Images.** `img/slides/33333.jpg` is **11.7 MB**; `img/datasets/clinical.jpg`
11 MB; several `img/Meeting/*.jpg` are 8–9 MB; total `img/` ≈ 129 MB. None are
responsive (`srcset`), none lazy-load, formats are unoptimized JP/PNG. The homepage
hero slider alone can pull >12 MB.

**3 / 8 — Script bloat.** Every page loads jQuery, jQuery-easing, Bootstrap JS,
fancybox (x2), quicksand, flexslider, animate.js, custom.js — for pages that are
mostly static text. `datasets.html` loads jQuery **twice** (local + CDN) and a
second fancybox. `style.css` `@import`s Google Fonts over `http://` and pages
reference `http://html5shim.googlecode.com` (dead, mixed-content).

**5 — Accessibility.** Decorative/team images use empty or generic `alt`
("Team Member 7"); no skip link; nav state conveyed by color only; the auto-rotating
team carousel and quote carousel have no pause/controls semantics; `pageTitle`
headings skip levels.

**6 — SEO/meta.** `<meta name="description" content="">` is empty sitewide;
`<meta name="author" content="http://webthemez.com">`; no canonical, Open Graph or
structured data; inconsistent `<title>` ("StatsUpAI" vs "StatsUpAI · Team").

**7 — Community News.** Rendered as `<div style="height:200vh"><iframe ...></div>`
— double scrollbars, no deep-linking, broken on mobile, invisible to search.

**9 — ASA banner.** `position:fixed; bottom:0` with no compensating padding on
`<body>`/content, so it overlaps the last rows on short viewports.

**10 — Content.** "Stearing Committee Members" (sic); commented-out
`link-to-datasets-summary.html` placeholders; two team members share the same
profile URL; `data-type` filter values contain spaces (`spatial transcriptomics`)
that won't match the quicksand filter cleanly.

## What the revamp changes

- **One design system**: `assets/css/main.css`, CSS custom properties, system font
  stack (no blocking web-font `@import`), automatic light/dark, `prefers-reduced-motion`.
- **Zero framework JS**: ~3 KB of vanilla `main.js` (nav, accessible quote rotator,
  data-driven team grid). No jQuery/Bootstrap/flexslider/fancybox.
- **Lean media**: CSS-generated hero (no multi-MB slider); team headshots only,
  `loading="lazy"`, fixed dimensions, `object-fit` crop.
- **Accessibility**: skip link, semantic landmarks, real `alt`, visible focus rings,
  `aria-current` nav state, accessible carousel that pauses on hover/focus.
- **SEO**: real per-page `description`, canonical, Open Graph, `theme-color`,
  consistent titles.
- **Single source of truth** for the team in `assets/js/team-data.js`; grid and
  A–Z roster render from the same array.
- **No iframe** for community content — direct, indexable, shareable links.
- Consistent header/footer + ASA banner that sits in normal flow (no overlap).

## Round 2 — deeper sweep (infra → operations → automation)

The first round fixed the *presentation* layer. A site for a mass academic
group also has to be **operable by non-engineers** and **safe to change**.
Further suboptimal traits found and addressed:

| # | Trait (any layer) | Severity | Addressed by |
|---|-------------------|----------|--------------|
|13 | Content baked into markup — adding a weekly webinar meant editing HTML | High | `assets/data/events.json` + client render; auto upcoming/past split |
|14 | Datasets/articles/pipelines hand-coded as card markup | High | `assets/data/resources.json` + render with search & topic filter |
|15 | No CI / validation — a stray comma or 12 MB image ships unnoticed | High | `scripts/check.mjs` + path-scoped GitHub Actions + htmlhint |
|16 | No asset-weight guardrail (root cause of the original 129 MB `img/`) | High | Budget gate in `check.mjs` (per-file + `assets/img` total) |
|17 | Webinars had no calendar export / no upcoming-vs-past logic | Med | Generated `.ics` "Add to calendar"; date-driven partition |
|18 | No `Event`/`Organization` structured data (no Google event rich results) | Med | JSON-LD `Organization` (home) + `Event`/`ItemList` (rendered) |
|19 | Missing site essentials: `sitemap.xml`, `robots.txt`, `404.html`, manifest, favicon, OG image | Med | All added (favicon/OG as lightweight SVG) |
|20 | Analytics dropped vs. original, or would track preview/forks if re-added | Med | `analytics.js`: off by default, prod-host-only, honors DNT, `anonymize_ip` |
|21 | No maintainer documentation for a non-technical academic team | Med | `MAINTAINING.md` — "edit one JSON file, commit, robots verify" |
|22 | No no-JS/SEO fallback once content is client-rendered | Med | `<noscript>` link lists on every data-driven page |
|23 | Repo hygiene in source: `.DS_Store`, `_Rhistory`, `.backup/`, ~1.7k tracked files | Low | N/A here — flagged for upstream cleanup |

### Net effect

- Adding a webinar or dataset is now a **one-file JSON edit** with automated
  validation — appropriate for a rotating set of academic volunteers.
- The class of regression that produced a single 11.7 MB hero image is now a
  **hard build failure**, not a thing someone has to notice in review.
- Search/filter, calendar export and date-aware scheduling match how the
  audience actually uses an academic seminar site.

### Known limitations

- Headshots are the original unoptimized files (no image tooling in this
  environment). Re-encode to WebP/AVIF + `srcset`, then tighten the asset
  budget (see `MAINTAINING.md`).
- `robots.txt` / `sitemap.xml` / `404.html` only take effect at a domain
  root; they are inert while served from the `/statsupai-revamp/` subfolder.
- Content and team data should be re-synced from the canonical
  `Statsup-AI/statsupai.github.io` (outside this environment's repo scope).
