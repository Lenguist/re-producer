# AI for Research — Key Papers Directory

> Last updated: 2026-03-06. Focus: reproducibility, automated research, paper evaluation, AI scientists.

## Legend
- **Relevance to re:producer**: ⭐⭐⭐ (directly relevant) / ⭐⭐ (adjacent) / ⭐ (background)

---

## 1. Reproducibility Metrics & Scoring

| Title | arXiv / DOI | Year | Key Contribution | Relevance |
|-------|-------------|------|-----------------|-----------|
| **RECAP: REproducibility Checklist Automation Pipeline** | arXiv:2602.07059 | 2026 | LLM-based system evaluating reproducibility signals from paper text + code repos. Cohen's κ = 0.67 with humans. Avg completeness score 0.62 across papers. | ⭐⭐⭐ |
| **REPRO-Bench: Can Agentic AI Systems Assess the Reproducibility of Social Science Research?** | arXiv:2507.18901 | 2025 | Benchmark for evaluating AI agents on scoring reproducibility of social science papers. Uses accuracy vs ground truth as metric. | ⭐⭐⭐ |
| **Similarity-Based Assessment of Computational Reproducibility** | arXiv:2509.23645 | 2025 | Proposes Similarity-based Reproducibility Index (SRI) in range [0,1] for Jupyter Notebooks, combining quantitative and qualitative evaluation. | ⭐⭐⭐ |
| **CORE-Bench: Fostering the Credibility of Published Research Through a Computational Reproducibility Agent Benchmark** | arXiv:2409.11363 | 2024 | 270 tasks from 90 papers (CS / social science / medicine), 3 difficulty levels, language + vision-language tasks. | ⭐⭐⭐ |
| **A scoping review on metrics to quantify reproducibility: a multitude of questions leads to a multitude of metrics** | Royal Society Open Science | 2025 | Reviews all known algorithmic reproducibility metrics; identifies proxy-feature-based and ML-based approaches. | ⭐⭐⭐ |
| **Automated Reproducibility Has a Problem Statement Problem** | arXiv:2601.04226 | 2026 | Argues the field lacks a unified definition of "reproducibility" — makes automated scoring inconsistent. | ⭐⭐⭐ |
| **Reproducibility in Machine Learning-based Research: Overview, Barriers and Drivers** | arXiv:2406.14325 | 2024 | Survey of reproducibility barriers in ML research; drivers of reproducibility adoption. | ⭐⭐⭐ |
| **What is Reproducibility in Artificial Intelligence and Machine Learning Research?** | arXiv:2407.10239 / AI Magazine 2025 | 2024/25 | Taxonomy and definitions; <1/3 of AI research reproducible or verifiable. | ⭐⭐⭐ |

---

## 2. Automated Code Generation from Papers

| Title | arXiv / DOI | Year | Key Contribution | Relevance |
|-------|-------------|------|-----------------|-----------|
| **Paper2Code: Automating Code Generation from Scientific Papers in Machine Learning** | arXiv:2504.17192 | 2025 | Multi-agent LLM (planning + analysis + coding). ML paper → functional code repo. Evaluated by both LLM-judge and human authors. | ⭐⭐⭐ |
| **ResearchCodeBench: Benchmarking LLMs on Implementing Novel ML Research Code** | arXiv:2506.02314 | 2025 | Benchmarks LLMs on writing correct code from paper descriptions. Uses correctness tests vs official codebase. | ⭐⭐⭐ |
| **Let's Talk About It: Making Scientific Computational Reproducibility Easy** | arXiv:2504.10134 | 2025 | Conversational tool to reproduce computational experiments; packages in single re-executable file via natural language. | ⭐⭐⭐ |

---

## 3. AI Scientist / Automated Research

| Title | arXiv / DOI | Year | Key Contribution | Relevance |
|-------|-------------|------|-----------------|-----------|
| **The AI Scientist: Towards Fully Automated Open-Ended Scientific Discovery** | Sakana AI blog + GitHub | 2024 | Full pipeline: brainstorm → experiment → LaTeX paper → LLM reviewer. $6–15/paper. Open source. | ⭐⭐⭐ |
| **The AI Scientist-v2: Workshop-Level Automated Scientific Discovery via Agentic Tree Search** | Sakana AI (2025) | 2025 | No human templates; agentic tree search; first fully AI-generated paper accepted at ICLR 2025 workshop. | ⭐⭐⭐ |
| **Evaluating Sakana's AI Scientist: Bold Claims, Mixed Results** | ACM SIGIR Forum / arXiv:2502.14297 | 2025 | Critical evaluation of AI Scientist outputs; identifies failure modes. | ⭐⭐ |
| **FutureHouse Platform: Superintelligent AI Agents for Scientific Discovery** | futurehouse.org | 2025 | Crow/Falcon/Owl agents. LitQA benchmark: FutureHouse ~90% vs human PhDs ~67%. | ⭐⭐⭐ |

---

## 4. Peer Review & Paper Quality

| Title | arXiv / DOI | Year | Key Contribution | Relevance |
|-------|-------------|------|-----------------|-----------|
| **OpenReviewer: A Specialized LLM for Generating Critical Scientific Paper Reviews** | arXiv:2412.11948 | 2024 | Llama-8B fine-tuned on 79,000 expert reviews. Generates structured peer reviews. | ⭐⭐⭐ |
| **Is Your Paper Being Reviewed by an LLM? Investigating AI in Peer Review** | OpenReview / arXiv:2502.19614 | 2025 | Benchmarks AI text detection in peer review context. | ⭐⭐ |
| **Paper Copilot: Tracking the Evolution of Peer Review in AI Conferences** | arXiv:2510.13201 | 2025 | Open dataset of peer reviews across CS venues; infrastructure for studying review quality at scale. | ⭐⭐ |
| **Can AI be used to assess research quality?** | Nature (d41586-024-02989-z) | 2024 | ChatGPT assessed against UK Research Excellence Framework (REF); produced plausible reports; AI-human correlation ~0.42. | ⭐⭐⭐ |

---

## 5. Research Integrity & Fraud

| Title | arXiv / DOI | Year | Key Contribution | Relevance |
|-------|-------------|------|-----------------|-----------|
| **AI for scientific integrity: detecting ethical breaches, errors, and misconduct in manuscripts** | Frontiers in AI (2025) | 2025 | Survey of AI tools for detecting fabrication, plagiarism, image manipulation. | ⭐⭐ |
| **Artificial intelligence faces reproducibility crisis** | Science 359(6377):725 | 2018 | Seminal piece: <1/3 of AI research verifiable; <5% share source code. Still widely cited. | ⭐⭐⭐ |
| **The Unreasonable Effectiveness of Open Science in AI: A Replication Study** | arXiv:2412.17859 | 2024 | Empirical: open-access papers far more replicable; quantifies effect of sharing code/data. | ⭐⭐⭐ |
| **Low-quality papers are flooding the cancer literature — can this AI tool help catch them?** | Nature (d41586-025-02906-y) | 2025 | AI tool flagged 250,000+ cancer papers with papermill indicators based on text similarity. | ⭐⭐ |

---

## 6. Open Science Infrastructure & Datasets

| Title | arXiv / DOI | Year | Key Contribution | Relevance |
|-------|-------------|------|-----------------|-----------|
| **S2ORC: The Semantic Scholar Open Research Corpus** | arXiv:1911.02782 / ACL 2020 | 2020 | 81.1M papers, 380.5M citation links, 8.1M full-text OA PDFs. Largest open academic corpus. | ⭐⭐⭐ |
| **Papers with code or without code? Impact of GitHub usability on ML research diffusion** | ScienceDirect (2023) | 2023 | Empirical: code availability + repo quality strongly predict citation counts in ML. | ⭐⭐⭐ |
| **Generative and reproducible benchmarks for ML classifiers (DIGEN)** | Science Advances | 2022 | 40 synthetic datasets for reproducible ML benchmarking with known ground truth. | ⭐⭐ |
