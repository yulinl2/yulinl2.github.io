# Pipelines / Team / Community — live statsupai.org inventory (source of truth)

## PIPELINES — pipeline.html (5 entries; was 4 in our data — FIX)
1. EHR data pipelines → https://github.com/data-processing-pipeline/EHR_data_pipelines/tree/main  — repo is an empty placeholder (template README only)
2. Neuroimaging Processing Software → pages/Neuroimaging%20Processing%20Software.html — STUB (table, no rows). Flag.
3. **Enhance ADMET ML Models** (live title; we mislabeled "Data Fusion Analysis Pipeline") → pages/Data_Fusion_Analysis_Pipeline_pipeline.html — tool: cfanalysis https://github.com/mquazi/cfanalysis
4. Clinical Trials Data Processing → pages/clinicaltrials_pipeline.html — tool: EUCTR Scraper https://github.com/mquazi/EUCTR
5. **Evaluate Target Druggability** (NEW, missing from our data) → pages/Evaluate_Target_Druggability.html — tool: Tclin-like https://github.com/mquazi/Tclin-like

All real tools under GitHub user `mquazi` (= Quazi, Mohammed, team member).

## TEAM — team.html (21 people; our team-data.js has 19 — ADD 2)
Live roster (Last, First · role · affiliation):
Chen, Kevin · High School Student · DeBakey High School
Dobriban, Edgar · Associate Professor · University of Pennsylvania
Gao, Shan · Ph.D. Candidate · Yunnan University
Geng, Yuhan · Ph.D. Candidate · University of Michigan
Kang, Jian · Professor · University of Michigan
**Lautier, Jackson · Assistant Professor · Bentley University**  ← MISSING from our data
Liu, Xiaoqian · Assistant Professor · UC Riverside
Li, Ruonan · Data Scientist · MD Anderson Cancer Center
Li, Yulin · Ph.D. Candidate · Rutgers University
Qu, Annie · Professor · UC Irvine
Quazi, Mohammed · Assistant Professor · West Virginia University
Wang, Wenyi · Professor · UT MD Anderson Cancer Center
Ward, Owen · Assistant Professor · Simon Fraser University
**Xia, Zhiqiu · Ph.D. Candidate · Rutgers University**  ← MISSING from our data
Ye, Hanwen · Ph.D. Candidate · UC Irvine
Zhao, Bangyao · Ph.D. Candidate · University of Michigan
Zhang, Linjun · Associate Professor · Rutgers University
Zheng, Tian · Professor · Columbia University
Zhang, Panpan · Assistant Professor · Vanderbilt University Medical Center
Zhao, Yi · Associate Professor · Indiana University School of Medicine
Zhu, Hongtu · Professor · UNC Chapel Hill
(Live site header typo: "Stearing Committee" — our revamp already fixes to "Steering".)

## COMMUNITY — community-news.html = hollow shell
Real feed = /quarto_web/site/posts/index.html (73 posts).
Categories (overlapping multi-tag): All 73 · Announcements 6 · Events 29 ·
Interviews 24 · Opportunities 13 · Resources 12 · Videos 11 · Webinars 6.
Recent: BIOS 740 PyTorch (May 3 2026, Resources) · ICML 2023 Ranking
Experiment (Apr 14 2026, Interviews) · Bingxin Zhao Agentic AI for Genetic
Discovery (Mar 8 2026) · Emerging Knowledge Trend (Mar 8 2026) · 2026
Election Results (Feb 21 2026) · SMI 2026 (Feb 3 2026) · Workshop:
Statistical Foundations of AI (Feb 2 2026) · Cancer Transcriptomic
Deconvolution (Jan 28 2026) · Rebuilding Statistics in the Age of AI (Jan 27
2026) · 2025 Annual Newsletter (Dec 31 2025) · LAMBDA (Nov 24 2025) · BIRS
Day 1–4 Recordings (Aug 19–21 2025).

Action: enrich community.html with category chips + recent-posts list
(data-driven from a small JSON), still deep-linking to the Quarto posts.
