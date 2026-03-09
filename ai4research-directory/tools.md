# AI for Research — Tools & Infrastructure Directory

> Last updated: 2026-03-06. Open-source tools, datasets, platforms, and community resources.

## Legend
- **Type**: Dataset / Platform / OSS-Tool / Community / Benchmark
- **Relevance to re:producer**: ⭐⭐⭐ (direct) / ⭐⭐ (adjacent) / ⭐ (tangential)

---

## 1. Open Science Platforms & Datasets

| Tool | Type | Description | Maintained By | Relevance |
|------|------|-------------|---------------|-----------|
| **Semantic Scholar API + S2ORC** | Dataset + API | 200M+ papers. S2ORC = 81.1M papers, 380.5M citation links, 8.1M full-text OA PDFs. Free public API. | Allen Institute / AI2 | ⭐⭐⭐ |
| **Papers With Code** | Platform | ML SOTA leaderboards + code links. **Sunset by Meta July 2025** — now redirects to HuggingFace Trending Papers. | Meta (defunct) | ⭐⭐⭐ |
| **CodeSOTA** | Platform | Active replacement for Papers With Code. 9,327+ benchmarks. | Community | ⭐⭐⭐ |
| **OpenML** | Platform | Hosts algorithms, datasets, 8M+ experimental runs with metadata. For ML reproducibility. | Community (Vanschoren) | ⭐⭐ |
| **HuggingFace (Trending Papers)** | Platform | Now the de facto home for ML paper + code links post-PwC sunset. | HuggingFace | ⭐⭐ |
| **arXiv** | Platform | 2.4M+ preprints. Primary source for CS/ML papers. Public API. | Cornell / arXiv | ⭐⭐⭐ |

---

## 2. Peer Review & Paper Quality Platforms

| Tool | Type | Description | Maintained By | Relevance |
|------|------|-------------|---------------|-----------|
| **OpenReview** | Platform | Open peer review for ICLR, NeurIPS, UAI and many others. Public API for all submissions + reviews. | OpenReview.net | ⭐⭐⭐ |
| **OpenReviewer** | OSS-Tool | Llama-8B fine-tuned on 79,000 expert reviews. Generates peer reviews for ML/AI papers. | Open source | ⭐⭐⭐ |
| **Paper Copilot** | Platform | Archives peer reviews across CS venues; open dataset for studying review evolution at scale. | Research | ⭐⭐ |
| **paperreview.ai (Stanford Agentic Reviewer)** | Tool | Scores papers on 7 quality dimensions. Correlation with human reviewers ~0.42. | Stanford | ⭐⭐⭐ |

---

## 3. Research Integrity & Fraud Detection Tools

| Tool | Type | Description | Maintained By | Relevance |
|------|------|-------------|---------------|-----------|
| **Retraction Watch Database** | Dataset | 50,000+ retraction records since 1970s, updated daily. Available via API. | Center for Scientific Integrity | ⭐⭐⭐ |
| **PubPeer** | Community | Crowdsourced post-publication peer review; researchers flag integrity concerns. | Nonprofit | ⭐⭐ |
| **Statcheck** | OSS-Tool | Automatically scans published articles for inconsistent statistical values (APA format). | Academic (R. Nuijten) | ⭐⭐⭐ |
| **STM Integrity Hub** | Platform | Publisher cloud platform for screening manuscripts for papermill indicators. | STM Association | ⭐⭐ |
| **Papermill Alarm** | OSS-Tool | Pre-review manuscript screening for papermill-generated content. | Community | ⭐⭐ |
| **Proofig** | SaaS Tool | AI image manipulation/duplication detection. Adopted by Science journals 2024. | Proofig | ⭐⭐ |
| **ImageTwin** | SaaS Tool | AI image duplication detection; 80–90% detection rate; good on microscopy photos. | ImageTwin | ⭐⭐ |

---

## 4. Reproducibility-Specific Tools

| Tool | Type | Description | Maintained By | Relevance |
|------|------|-------------|---------------|-----------|
| **IBM Neural Network Recreator** | Research Tool | Scans papers for neural net diagrams, parses architecture, generates code. Reproduced 100s of published networks. | IBM Research | ⭐⭐⭐ |
| **RECAP (REproducibility Checklist Automation Pipeline)** | OSS-Tool | LLM-based system evaluating reproducibility signals from paper text + code repos. Cohen's kappa 0.67 with humans. | Academic | ⭐⭐⭐ |
| **Paper2Code** | OSS-Tool | Multi-agent LLM framework: ML paper → complete functional code repository. Planning + analysis + coding agents. | Academic (arXiv:2504.17192) | ⭐⭐⭐ |
| **MLE-bench** | Benchmark | OpenAI benchmark: LLM/agent-based ML engineering in dockerized containers. | OpenAI | ⭐⭐ |
| **CORE-Bench** | Benchmark | 270 tasks from 90 papers (CS + social science + medicine), 3 difficulty levels, tests computational reproducibility. | Academic (arXiv:2409.11363) | ⭐⭐⭐ |
| **REPRO-Bench** | Benchmark | Evaluates AI agents on assessing reproducibility of social science papers. | Academic (arXiv:2507.18901) | ⭐⭐⭐ |
| **ML Reproducibility Challenge** | Community | Annual challenge by Papers With Code community (now paused post-PwC sunset). | Community | ⭐⭐ |

---

## 5. Citation & Literature Graph Tools

| Tool | Type | Description | Maintained By | Relevance |
|------|------|-------------|---------------|-----------|
| **Semantic Scholar Graph API** | API | Free graph API: paper metadata, citations, references, authors, recommendations. | Allen Institute | ⭐⭐⭐ |
| **OpenCitations** | Dataset | Open citation data; COCI has 1.3B+ citations. Free API. | Silvio Peroni (Bologna) | ⭐⭐ |
| **CrossRef API** | API | 130M+ DOI records, citation metadata. Free for polite usage. | CrossRef | ⭐⭐ |
| **Unpaywall** | API | Open access status for DOIs. Free API. | OurResearch | ⭐⭐ |
| **CORE API** | API | 200M+ open access papers full text. Free API. | CORE (UK) | ⭐⭐ |

---

## 6. AI Research Automation Frameworks

| Tool | Type | Description | Maintained By | Relevance |
|------|------|-------------|---------------|-----------|
| **AI Scientist v1 + v2 (Sakana)** | OSS-Tool | End-to-end: idea → experiment → LaTeX paper → automated review. v2 uses agentic tree search. | Sakana AI (open source) | ⭐⭐⭐ |
| **FutureHouse Platform API** | API | Crow/Falcon/Owl agents accessible via API. Superhuman lit search. | FutureHouse | ⭐⭐⭐ |
| **ResearchCodeBench** | Benchmark | Benchmarks LLMs on implementing novel ML research code. Correctness-tested. | Academic (arXiv:2506.02314) | ⭐⭐ |
