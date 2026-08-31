# FaiREE Decision Board

Static, internal (`noindex`) decision board for the **FaiREE × missing-data**
research effort. Lives at
[`/fairee-board/`](https://yulinl2.github.io/fairee-board/) once deployed.

## What it is

A single HTML page that loads [`assets/data/roadmap.json`](assets/data/roadmap.json)
and renders a five-column Kanban (proposed / in-progress / blocked / decided /
done) with filters by group, status, owner, priority, repo, plus free-text
search. Items are hierarchical (groups: R canonicalization, R tests, Python
framework, R↔Python interop, Python tests, bulk testing, manuscript, infra),
and the “group by hierarchy” toggle shows the structure inside each column.

The seed plan was reconstructed from PR + doc history across
`yulinl2/fairee_missing_data`, `yulinl2/fairee-experiment`,
`yulinl2/fairee-bulk-testing`, `yulinl2/fairee`, and the in-progress Overleaf
manuscript anchored to arxiv 2211.15072.

## How “Save” works

The page commits `assets/data/roadmap.json` directly back into this repo via
the GitHub Contents API.

1. Click **Settings**.
2. Paste a **fine-grained PAT** scoped to `yulinl2/yulinl2.github.io` with
   **Contents: Read and write**. The token is stored in browser
   `localStorage` only — never committed, never sent anywhere except GitHub.
3. Optionally change the target **branch** (default:
   `claude/recover-dev-intent-eQY0u`), **path**, and commit message template.
4. Save settings. The header chip will reflect the target.
5. Edit items (click a card; the modal lets you change status / owner /
   priority / refs / detail / category / repo, or delete the item). Click **+
   item** to add a new one.
6. Click **Save → GitHub** (or `⌘/Ctrl+S`). The board:
   - GETs the current file SHA on the target branch,
   - PUTs the updated JSON (base64-encoded) with that SHA,
   - updates the header to `saved to <branch>` on success.

Edits also autosave to `localStorage`, so a refresh never loses unsaved work.

### Fallbacks if you don’t want to use a PAT

- **Export** downloads a JSON snapshot you can hand back to me to commit.
- **Import** pastes a full JSON to replace state (useful for restoring a
  snapshot).

## Files

```
fairee-board/
├── index.html
├── README.md                   ← this file
└── assets/
    ├── css/board.css
    ├── js/board.js
    └── data/roadmap.json       ← the actual state
```

Served as static files; not consumed by Jekyll’s themed build (mirrors the
`statsupai-revamp/` pattern in this repo). No build step.
