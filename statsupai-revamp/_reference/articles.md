# Review Articles — live statsupai.org inventory (source of truth)

KEY: all child pages are **Zotero-API driven**. Public group **5407414**,
embedded read key **qsheeavQ163JkXS3DxE9KQYU**. Static scrape looks empty;
content (~260+ papers) is fetched client-side. Faithful rebuild = fetch the
same Zotero API client-side (auto-stays-current) with a cached JSON fallback.

API: `https://api.zotero.org/groups/5407414/collections/<ID>/items?sort=date&direction=desc`

## article.html — hub (Biomedical group + AI group)

### Biomedical (single-collection 5-col table: Title/First Author/Journal/Link/DOI)
- Cancer_review_papers.html — collection `6PVIT4IP` — ~8 papers
- new_cancer_review_PCAWG.html — `AA3PQDEF` — ~4
- new_cancer_review_TCGA.html — `QH5SVF2G` — ~72 (largest)
- ehr_review_papers.html — `MZDBVWF5` — ~9
- genetic_review_papers.html — `IN44WNCJ` — ~49 (has 6th col "Data Resource")
- Neuroimaging_review_papers.html — `IJ5MX65B` — ~32
- Microbiome_review_paper.html — `8CE45R76` — ~18

### AI (sidebar + multi-section; paper_list_ai/)
- list-AI-LLM.html — "Large Language Models": 
  - LLM Techniques & Architectures → Surveys 2023–25 `AA8HVZ8M` (~2); Technical Reports 2025–26 `N2PSJFMY` (~13)
  - Designing Trustworthy LLMs `PKBWUAU9` (~4)
  - LLM-Empowered Statistical Analysis `CYNWXVJ3` (~3)
- list-AI-Safety.html — "Safety & Trustworthiness":
  - Algorithmic Fairness & Bias `W3D9VXVK` (~5)
  - Privacy & Differential Privacy `BCSH7HSH` (~13)
  - Aligning AI with Human Values `3UJJK7EM` (~6)
  - (empty/placeholder: `KEZW5GVF`, `SEUHKVJV`)
- list-AI-Agent.html — "AGI and AI Agents": single list `JF8AYJFT` (~14)

## Rebuild approach
`assets/data/articles.json` = the collection→topic map above. A renderer
fetches each collection from the Zotero API on load, groups by section,
renders a paper list (title, first author, journal/year, DOI/link), with
search + section nav. Cache last-good JSON for offline/no-network fallback
(api.zotero.org may be blocked from some hosts — handle gracefully, keep the
existing noscript outbound links).
