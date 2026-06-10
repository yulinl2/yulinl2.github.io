---
title: FaiREE × Missing-Data — Overview
description: Distribution-free, finite-sample fair classification under Missing-Not-At-Random — the big picture, the 5-package landscape, and the citation aspiration.
---

# FaiREE with Missing Data — Project Overview

### **Overview**

**FaiREE × Missing-Data** is a post-processing fair classifier that gives
distribution-free, *finite-sample* guarantees on group fairness (EOO or DP)
under realistic missingness in the sensitive attribute or outcome. It extends
the ICLR 2023 FaiREE paper (Li, Zou, Zhang) to handle Missing-Not-At-Random
(MNAR) data via density-ratio reweighting and bootstrap admission tests, and
ships as a 5-package open-source toolkit organized around one principle:
**carve out the parts that are useful beyond fairness, and ship them
separately**.

---

## **1. Core Idea**

> *Wrap any classifier. Calibrate on possibly-missing data. Get a provable
> α-budget on group disparity.*

Given a trained classifier's scores and a sensitive attribute (e.g., race,
gender) that may be missing on some calibration rows in a way that depends on
the unobserved value (MNAR), FaiREE returns per-group thresholds so the
group-wise true-positive-rate gap stays below a user-chosen budget α with
probability ≥ 1−δ. The guarantee is **calibration-set, finite-sample**, and
**distribution-free** — it doesn't assume the score is well-calibrated, the
feature distribution is anything in particular, or that there's enough data
asymptotically. It just needs the missingness mechanism to be in the
Li-self-censoring family (a strict superset of the no-self-censoring class of
Sadinle & Reiter 2017), and enough calibration data to clear an explicit
sample-size floor.

---

## **2. Why It Matters**

* Fair-ML methods that promise "fairness guarantees" usually deliver
  *asymptotic* or *population-level* claims. Practitioners with finite
  calibration data and possibly-missing sensitive attributes get nothing.
* MNAR sensitive attributes are common (people decline to answer race /
  income / health-status questions in ways correlated with the true value).
  Most fair-ML methods either assume MCAR / MAR or ignore missingness
  entirely.
* The post-processing wrap-any-classifier form is operationally cheap —
  retraining is not required, the algorithm runs on scores alone — but only
  recently has the finite-sample theory been complete.
* If packaged well, this can become a **default fairness tool**, in the way
  Generalized Linear Models standardized regression.

---

## **3. High-Level Architecture**

The project's deliverables span five complementary packages:

| Package | Role | What ships |
|---------|------|------------|
| **`fairee`** | The algorithm | 7 FaiREE classes (EOO / DP / multi-group / DR / IF-bootstrap), method recommender, generalization-buffer tuning |
| **`fairness-run-audit`** | Post-hoc audit | 9 assumption / sample-size / weight-stability / budget-compliance checks, library-agnostic (works with Hardt-EqOdds, ROC, CEqOdds etc.) |
| **`selfcens-densityratio`** | The MNAR estimator | Li (2023) self-censoring density-ratio with vectorized GMM fit |
| **`simforge`** | Experiment infra | Router + data store + setup records + run-once contract + analysis export |
| **`fair-ml-bench`** | Benchmark suite | Adult / COMPAS / German + synthetic sweeps under MNAR-aware regimes |

The companion **manuscript** (in preparation) provides the theoretical
foundations: W-1 (Beta-quantile under IPW; finite-sample), W-2 (DR estimator
α-budget preservation; uniform-in-B bound), and the DP variant + multi-group
extension.

---

## **4. What's Already Built vs Designed**

| Component | Status | Where |
|---|---|---|
| Algorithm classes (FaiREEMissingEOO, …DPMissing, …DRIFBootstrapMissingEOO, etc.) | **Working** | [`yulinl2/fairee-experiment` `src/fairee/algo/`](https://github.com/yulinl2/fairee-experiment/tree/main/src/fairee/algo) |
| W-1 + W-2 theoretical closures | **Working** | `proof_sketch.tex` + `dr_bootstrap_sketch.tex` + 60-run validation |
| 12 benchmark scripts + 32 result directories | **Working** | [`yulinl2/fairee-experiment` `exp/`](https://github.com/yulinl2/fairee-experiment/tree/main/exp) |
| 108 tests, audit module, method recommender | **Working** | tests/, src/engine/analysis/, src/fairee/algo/method_recommender.py |
| Manuscript drafts (28 .tex files, theorems, bibliography) | **Working** | [`yulinl2/fairee_missing_data` `_drafts/`](https://github.com/yulinl2/fairee_missing_data) |
| 5 PyPI packages (sdist + wheel build, tests, README) | **Scaffolded** | [`yulinl2/fairee-experiment` `packages/`](https://github.com/yulinl2/fairee-experiment/tree/main/packages) |
| Interactive decision board | **Live** | [`yulinl2.github.io/fairee-board/`](https://yulinl2.github.io/fairee-board/) |
| **Journal/conference submission** | In progress | manuscript drafts almost done; reviewer supplement scaffolded |
| **PyPI release** | Phase-3 (Year 2-3 per the original roadmap) | targets: 1+2 publish-ready today; 3 needs 1-week refactor; 4-5 longer |
| **R bindings** | Phase-4 (deferred) | original blueprint includes this; currently out of scope |

---

## **5. The Theory in One Paragraph**

The headline result bounds the **calibration-set** group-wise true-positive-rate
gap with probability ≥ 1−δ, under (M1) Li-self-censoring identifiability of
the missingness mechanism, (M2) no outcome shift across missingness patterns,
and (M3) bounded IPW weights. The slack is
$O(\sqrt{\log(n/\delta)/n^{\min}_a})$ with **explicit constants**
($c_0 = 1.18/\min(α, 1−α) + 2.04$). For heavy-MNAR regimes where the
Beta-quantile admission's IPW dependency starts to dominate, a doubly-robust
influence-function bootstrap variant (`FaiREEDRIFBootstrapMissingEOO`)
preserves the strict α-budget with a uniform-in-B finite-sample bound — 60-run
validation shows test-set fail rate drops 80% → 0% at α=0.05.

For the full theory see [`PROOF_MAP.md`](https://github.com/yulinl2/fairee-experiment/blob/main/PROOF_MAP.md);
for derivations see
[`fairee_missing_theory.md`](https://github.com/yulinl2/fairee-experiment/blob/main/doc/notes/fairee_missing_theory.md).

---

## **6. Scaling Principle**

* **Width**: more sensitive groups (K ≥ 2 via Bonferroni or matched-marginal
  err-proxy for DP) without changing the admission machinery.
* **Depth**: more missingness patterns (the Li-self-censoring estimator scales
  to all $2^{p_\text{miss}}$ pattern combinations).
* **Carry-over**: the algorithm classes are decoupled from the engine
  package, the audit is library-agnostic, and the density-ratio estimator is
  generic statistics — pieces of this toolkit transfer to other fair-ML
  research and to other MNAR-statistics work.

This makes the project **modular**: cells (algorithm modules) → packages
(carved-out PyPI distributions) → benchmark suite, all sharing one repo's
canonical sources.

---

## **7. Audience Tiers**

* **Closest** (you, future maintainer): start at the
  [decision board](https://yulinl2.github.io/fairee-board/) and
  [`INDEX.md`](https://github.com/yulinl2/fairee-experiment/blob/main/INDEX.md).
* **Mid** (collaborator picking up the project, practitioner shipping a fair
  classifier): read [`TLDR.md`](https://github.com/yulinl2/fairee-experiment/blob/main/TLDR.md)
  + [`exp/quickstart.py`](https://github.com/yulinl2/fairee-experiment/blob/main/exp/quickstart.py)
  + [`INDEX.md`](https://github.com/yulinl2/fairee-experiment/blob/main/INDEX.md);
  keep
  [`GLOSSARY.md`](https://github.com/yulinl2/fairee-experiment/blob/main/GLOSSARY.md)
  and [`FAQ.md`](https://github.com/yulinl2/fairee-experiment/blob/main/FAQ.md)
  open.
* **Far** (reviewer): this overview + the manuscript draft +
  [`FIGURES.md`](https://github.com/yulinl2/fairee-experiment/blob/main/FIGURES.md).
* **Furthest** (ML / fairness community): the published paper + the
  `fairee` PyPI package.

---

## **8. Citation Aspiration**

The original blueprint (`exp_pipeline_roadmap.md`, 2025-09-30) names
**"500+ citations"** as the project's aspiration if the package + paper land
together well. The path:

* **Paper**: distribution-free + finite-sample + MNAR-aware is genuinely new
  in fair-ML; the closest priors (Sadinle-Reiter for the missingness model,
  the original FaiREE for the post-processing scaffold) cite ≥150 between
  them already.
* **Package**: `pip install fairee` makes the method usable in one line.
  Same path that took GLM from "statistical method" to "default tool."
* **Audit module**: `fairness-run-audit` works with *any* post-processing
  fairness classifier — a much broader audience than fair-ML researchers.
* **Density-ratio estimator**: `selfcens-densityratio` is generic MNAR
  statistics, citable far outside fairness.

---

## **9. Deliverables**

* **Working prototype** (already shipped): 7 algorithm classes + 12 benchmark
  scripts + audit module on `yulinl2/fairee-experiment` recovery branch.
* **Manuscript** (in preparation): 28 .tex draft sections, two W-closures,
  30-entry bibliography. Targeting NeurIPS / ICML / TMLR / JMLR.
* **5-package PyPI release** (scaffolded; release pending): `fairee`,
  `fairness-run-audit`, `selfcens-densityratio`, `simforge`, `fair-ml-bench`.
* **Reproducibility supplement**: `make reproduce-paper` (~20 min) and
  `make supplement` (camera-ready tarball) targets are live.
* **Visual telemetry**: 32 result directories, 8 headline figures,
  closure-rate-tracked decision board.

---

### **In One Sentence**

> **FaiREE × Missing-Data = distribution-free, finite-sample, MNAR-aware
> fair classification — wrap any classifier, calibrate on possibly-missing
> data, get a provable α-budget on group disparity. Ships as a 5-package
> toolkit, with the most general pieces (MNAR density-ratio, post-proc
> audit) usable far outside fair-ML.**

---

## Links

* **Code**: [`yulinl2/fairee-experiment`](https://github.com/yulinl2/fairee-experiment) (Apache-2.0)
* **Manuscript drafts**: [`yulinl2/fairee_missing_data`](https://github.com/yulinl2/fairee_missing_data)
* **Decision board**: [`/fairee-board/`](/fairee-board/)
* **Writing guide**: [`/fairee-writing/`](/fairee-writing/)
* **Tutorials**: [`/fairee-tutorials/`](/fairee-tutorials/)
* **Audits**: [`/fairee-audits/`](/fairee-audits/)
* **Packaging plan**: [`packaging_plan_2026.md`](https://github.com/yulinl2/fairee-experiment/blob/main/doc/roadmaps/packaging_plan_2026.md)
* **Original 2025-09-30 roadmap**: [`exp_pipeline_roadmap.md`](https://github.com/yulinl2/fairee-experiment/blob/main/doc/roadmaps/exp_pipeline_roadmap.md)
