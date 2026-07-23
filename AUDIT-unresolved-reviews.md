# Audit: Merged PRs with Unresolved Review Threads

Audit of all merged PRs that were merged with unresolved Copilot review threads.
**11 merged PRs** contain **38 unresolved review threads**.

---

## PRs with Unresolved Threads

### [#2](https://github.com/yulinl2/yulinl2.github.io/pull/2) — StatsUpAI revamp + design audit (2 threads)

| Severity | File | Line | Issue |
|---|---|---|---|
| SEO | `statsupai-revamp/index.html` | 13 | Canonical URLs point to `statsupai.org/*.html` but revamp is served at the GitHub Pages URL; several canonicals reference non-existent paths (`community-news.html`, `/events/webinars/`). [→](https://github.com/yulinl2/yulinl2.github.io/pull/2#discussion_r3251742384) |
| Security/XSS | `statsupai-revamp/assets/js/main.js` | 80 | Team member names interpolated via `innerHTML` without HTML-escaping; future entries with `&`/`<`/`>` could break markup or introduce XSS. [→](https://github.com/yulinl2/yulinl2.github.io/pull/2#discussion_r3251742392) |

---

### [#3](https://github.com/yulinl2/yulinl2.github.io/pull/3) — StatsUpAI revamp: data-driven content, site infra & CI automation (8 threads)

| Severity | File | Line | Issue |
|---|---|---|---|
| SEO | `statsupai-revamp/sitemap.xml` | 10 | Sitemap contains URLs (`community-news.html`, `/events/webinars/`) that don't match actual file names (`community.html`, `events.html`). [→](https://github.com/yulinl2/yulinl2.github.io/pull/3#discussion_r3251757070) |
| SEO | `statsupai-revamp/community.html` | 13 | Canonical is `community-news.html` but actual file is `community.html`. [→](https://github.com/yulinl2/yulinl2.github.io/pull/3#discussion_r3251757082) |
| SEO | `statsupai-revamp/events.html` | 13 | Canonical is `/events/webinars/` but actual file is `events.html`. [→](https://github.com/yulinl2/yulinl2.github.io/pull/3#discussion_r3251757085) |
| Bug | `statsupai-revamp/404.html` | 22 | 404 page links to `events.html` but canonical/sitemap use `/events/webinars/`. [→](https://github.com/yulinl2/yulinl2.github.io/pull/3#discussion_r3251757090) |
| Security/XSS | `statsupai-revamp/assets/js/render.js` | 83 | `resources.json` URL values injected into `href` without URL scheme validation; `javascript:` URLs would be XSS vectors. [→](https://github.com/yulinl2/yulinl2.github.io/pull/3#discussion_r3251757101) |
| Bug | `statsupai-revamp/scripts/check.mjs` | 7 | `ROOT` derived from `new URL().pathname` is URL-encoded; fails on paths with spaces. Should use `fileURLToPath`. [→](https://github.com/yulinl2/yulinl2.github.io/pull/3#discussion_r3251757110) |
| Privacy | `statsupai-revamp/assets/js/analytics.js` | 11 | DNT check only handles `"1"`; browsers may also send `"yes"`. [→](https://github.com/yulinl2/yulinl2.github.io/pull/3#discussion_r3251757121) |
| Bug | `statsupai-revamp/assets/js/render.js` | 136 | `.ics` generator emits all-day events (`DTSTART;VALUE=DATE`), ignoring `time_et` and `duration_min`. Calendar entries show wrong times. [→](https://github.com/yulinl2/yulinl2.github.io/pull/3#discussion_r3251757128) |

---

### [#5](https://github.com/yulinl2/yulinl2.github.io/pull/5) — events: back-fill full StatsUpAI webinar history (3 threads)

| Severity | File | Line | Issue |
|---|---|---|---|
| SEO/Bug | `statsupai-revamp/assets/data/events.json` | 17 | JSON-LD emits `eventStatus: EventScheduled` for all talks including past ones; causes stale Google rich results. [→](https://github.com/yulinl2/yulinl2.github.io/pull/5#discussion_r3256395962) |
| Bug | `statsupai-revamp/assets/data/events.json` | 23 | `.ics` still generates all-day events, ignoring `time_et`/`duration_min`. [→](https://github.com/yulinl2/yulinl2.github.io/pull/5#discussion_r3256395972) |
| UX | `statsupai-revamp/assets/data/events.json` | 39 | `recording_link` points to the generic YouTube channel rather than a talk-specific URL. [→](https://github.com/yulinl2/yulinl2.github.io/pull/5#discussion_r3256395979) |

---

### [#7](https://github.com/yulinl2/yulinl2.github.io/pull/7) — Revamp site: custom periwinkle–lilac Jekyll theme (5 threads)

| Severity | File | Line | Issue |
|---|---|---|---|
| Bug | `index.md` | 92 | Link uses `.md` source path; Jekyll renders to `.html`, so the link 404s on the built site. Same issue at `toolbox/index.md:19` and `_includes/footer.html:20`. [→](https://github.com/yulinl2/yulinl2.github.io/pull/7#discussion_r3258078584) |
| Bug | `toolbox/index.md` | 19 | Same `.md`-path link that will 404. [→](https://github.com/yulinl2/yulinl2.github.io/pull/7#discussion_r3258078618) |
| Bug | `_includes/footer.html` | 20 | Footer Archive link points to `.md` path; will 404. [→](https://github.com/yulinl2/yulinl2.github.io/pull/7#discussion_r3258078641) |
| Bug | `_config.yml` | 39 | `defaults` applies `layout: page` to every markdown file in the repo, including sub-sites (`statsupai-revamp`, etc.), potentially breaking their rendering. [→](https://github.com/yulinl2/yulinl2.github.io/pull/7#discussion_r3258078661) |
| Content | `toolbox/scratch-papers/index.md` | 5 | Page has front matter only, no body content; renders as an empty page. [→](https://github.com/yulinl2/yulinl2.github.io/pull/7#discussion_r3258078682) |

---

### [#9](https://github.com/yulinl2/yulinl2.github.io/pull/9) — Add interactive decision board + reference-link paste interface (2 threads)

| Severity | File | Line | Issue |
|---|---|---|---|
| Code Quality | `statsupai-revamp/scripts/check.mjs` | 41 | `noIndex` uses `var` instead of `const`/`let`, inconsistent with the rest of the file. [→](https://github.com/yulinl2/yulinl2.github.io/pull/9#discussion_r3257103075) |
| Bug/HTML | `statsupai-revamp/assets/js/roadmap.js` | 74 | In the empty-state branch, a `<p>` is assigned into a `<ul>` (`refsEl`); produces invalid HTML and broken styling. [→](https://github.com/yulinl2/yulinl2.github.io/pull/9#discussion_r3257103124) |

---

### [#17](https://github.com/yulinl2/yulinl2.github.io/pull/17) — events P1: enriched collapsible cards + real logo (3 threads)

| Severity | File | Line | Issue |
|---|---|---|---|
| Security/XSS | `statsupai-revamp/assets/js/render.js` | 166 | `personal_website`, `registration_link`, `recording_link` inserted into `href` without scheme validation; `javascript:` URLs would be XSS vectors. [→](https://github.com/yulinl2/yulinl2.github.io/pull/17#discussion_r3258392811) |
| Maintainability | `statsupai-revamp/events.html` | 56 | Series cards use inline `style` attributes for accent border color instead of CSS classes/variables. [→](https://github.com/yulinl2/yulinl2.github.io/pull/17#discussion_r3258392876) |
| Accessibility | `statsupai-revamp/index.html` | 176 | Footer brand logo `alt="StatsUpAI"` + visible text "StatsUpAI" causes name announced twice by assistive tech; should use `alt=""`. [→](https://github.com/yulinl2/yulinl2.github.io/pull/17#discussion_r3258392909) |

---

### [#18](https://github.com/yulinl2/yulinl2.github.io/pull/18) — Quiet the theme: dusty mint–mauve palette, smaller headshot (1 thread)

| Severity | File | Line | Issue |
|---|---|---|---|
| Accessibility | `assets/css/main.css` | 33 | Light-mode `--accent` and `--accent-2` colors are below WCAG 4.5:1 contrast ratio for normal-size link text and button labels. [→](https://github.com/yulinl2/yulinl2.github.io/pull/18#discussion_r3258390546) |

---

### [#19](https://github.com/yulinl2/yulinl2.github.io/pull/19) — datasets: faithful data-driven directory (88 resources) (4 threads)

| Severity | File | Line | Issue |
|---|---|---|---|
| Code Quality | `statsupai-revamp/assets/js/render.js` | 110 | New datasets renderer coexists with legacy `resources.json` datasets section; creates duplicated/drifting data sources. [→](https://github.com/yulinl2/yulinl2.github.io/pull/19#discussion_r3258408953) |
| Code Quality | `statsupai-revamp/assets/js/render.js` | 133 | Dataset categories reuse events-specific CSS class `ev-disc`, coupling unrelated components. [→](https://github.com/yulinl2/yulinl2.github.io/pull/19#discussion_r3258409018) |
| Accessibility | `statsupai-revamp/assets/js/render.js` | 147 | Dataset entries use CSS `columns:2`; breaks keyboard/screen reader reading order. [→](https://github.com/yulinl2/yulinl2.github.io/pull/19#discussion_r3258409044) |
| Content | `statsupai-revamp/datasets.html` | 44 | Intro hardcodes "~88 resources"; will become stale as `datasets-detail.json` grows. [→](https://github.com/yulinl2/yulinl2.github.io/pull/19#discussion_r3258409078) |

---

### [#21](https://github.com/yulinl2/yulinl2.github.io/pull/21) — fidelity: team +2 (Lautier, Xia), pipelines match live (3 threads)

| Severity | File | Line | Issue |
|---|---|---|---|
| Bug | `statsupai-revamp/assets/data/resources.json` | 29 | `pipeline.html` noscript fallback has only 4 entries and a stale label, but `resources.json` now defines 5 pipelines. [→](https://github.com/yulinl2/yulinl2.github.io/pull/21#discussion_r3258418023) |
| Code Quality | `statsupai-revamp/assets/js/main.js` | 63 | Monogram initials call `m.name.split(",")` three times in a row; should split once. [→](https://github.com/yulinl2/yulinl2.github.io/pull/21#discussion_r3258418080) |
| Data Quality | `statsupai-revamp/assets/js/team-data.js` | 16 | Members without headshots represented inconsistently: Lautier omits `img`, Xia sets `img: ""`. [→](https://github.com/yulinl2/yulinl2.github.io/pull/21#discussion_r3258418106) |

---

### [#22](https://github.com/yulinl2/yulinl2.github.io/pull/22) — articles: Zotero-driven faithful + auto-current review lists (4 threads)

| Severity | File | Line | Issue |
|---|---|---|---|
| Bug | `statsupai-revamp/assets/js/render.js` | 131 | Zotero fetch hard-capped at `limit=100`; collections >100 items are silently truncated, making the displayed paper count wrong. [→](https://github.com/yulinl2/yulinl2.github.io/pull/22#discussion_r3258438217) |
| Bug/UX | `statsupai-revamp/assets/js/render.js` | 128 | `loaded = true` set before the network call; a failed Zotero request prevents retry without full page reload. [→](https://github.com/yulinl2/yulinl2.github.io/pull/22#discussion_r3258438263) |
| Security/XSS | `statsupai-revamp/assets/js/render.js` | 144 | External links built from Zotero `x.url`/`x.DOI` without URL scheme validation; malicious entry could inject `javascript:`. [→](https://github.com/yulinl2/yulinl2.github.io/pull/22#discussion_r3258438284) |
| Data Quality | `statsupai-revamp/assets/js/team-data.js` | 16 | Same inconsistent `img` representation (omitted vs. `""`) for members without headshots as #21. [→](https://github.com/yulinl2/yulinl2.github.io/pull/22#discussion_r3258438324) |

---

### [#24](https://github.com/yulinl2/yulinl2.github.io/pull/24) — community: data-driven feed (category chips + recent posts) (3 threads)

| Severity | File | Line | Issue |
|---|---|---|---|
| Content | `statsupai-revamp/community.html` | 44 | Intro hardcodes "73 posts and counting"; will drift from actual `community.json` count. Also line 51. [→](https://github.com/yulinl2/yulinl2.github.io/pull/24#discussion_r3258450913) |
| CSS | `statsupai-revamp/assets/js/render.js` | 112 | Category chips `<a class="chip">` will get global `a:hover { text-decoration: underline }` rule, breaking pill-chip styling. [→](https://github.com/yulinl2/yulinl2.github.io/pull/24#discussion_r3258450978) |
| Code Quality | `statsupai-revamp/community.html` | 89 | `analytics.js` loaded before `render.js`, inconsistent with all other pages; could affect analytics inspecting DOM from `render.js`. [→](https://github.com/yulinl2/yulinl2.github.io/pull/24#discussion_r3258451014) |

---

## Summary by Category

| Category | Count |
|---|---|
| Security / XSS | 4 |
| Bug | 11 |
| SEO | 5 |
| Accessibility | 3 |
| Code Quality | 6 |
| Data Quality | 2 |
| Content / UX | 5 |
| Privacy | 1 |
| Maintainability | 1 |
| **Total** | **38** |
