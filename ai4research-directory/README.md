# AI for Research — Directory

> Competitive landscape & literature map for re:producer.
> Last updated: 2026-03-07.

## Files

| File | Contents |
|------|----------|
| `companies.md` | ~35 companies/startups across 6 categories |
| `tools.md` | ~30 open tools, datasets, platforms, benchmarks |
| `papers.md` | ~25 key papers on reproducibility, AI scientists, peer review |

## re:producer Vision

**Single-click actual reproduction of any CS/arXiv paper.**

1. Pick a paper
2. Get an estimate: cost + compute requirements (GPU hours, RAM, time)
3. Confirm → we execute it in a sandbox
4. Results cached — if someone already reproduced it, flagged prominently

This is NOT a grading or scoring system. The score eventually IS the result of running.

## Category Map

```
AI for Research
├── Literature Discovery & Review          → Elicit, Consensus, Undermind, SciSpace...
├── Academic Writing                       → Paperpal, Writefull, Jenni AI...
├── Research Integrity (heuristic)         → Scite.ai, Proofig, Statcheck, PubPeer...
├── Actual Execution / AI Scientist        → Sakana AI, FutureHouse, Paper2Code ← closest
├── Drug Discovery (tangential)            → Isomorphic Labs, Recursion...
└── Infrastructure                         → Semantic Scholar, OpenReview, Modal...
```

## Competitive Gap

| Player | What they do | Why it's not re:producer |
|--------|-------------|--------------------------|
| Scite.ai | Classifies citations as supporting/contradicting | Heuristic, no execution |
| paperreview.ai | 7-dimension quality score | Static analysis, no execution |
| RECAP | LLM checks reproducibility signals from text | Academic tool, no execution |
| Paper2Code | LLM generates code from paper | Generates new code, doesn't run the original |
| Sakana AI Scientist | Full pipeline: idea → paper | Generates new research, doesn't verify existing |
| FutureHouse | Deep lit review agents | Life sciences focus, no code execution |
| CORE-Bench | Benchmark for AI agents on repro tasks | Benchmark, not a product |

**The gap**: No consumer-facing product actually *runs* the original paper's code, caches the result, and lets you see "this paper was reproduced on [date], here's what it cost."

## Key Infrastructure to Build On

- **Semantic Scholar API** — paper metadata, code links (replaces defunct Papers With Code)
- **GitHub API** — fetch repos, parse requirements, estimate complexity
- **Modal** — serverless GPU sandboxes for execution
- **Supabase** — result caching + public "already reproduced" flags (repro_runs table exists)
- **arXiv API** — paper source + LaTeX for code extraction hints

## Most Relevant Papers

- CORE-Bench (arXiv:2409.11363) — benchmark for computational reproduction agents
- Paper2Code (arXiv:2504.17192) — paper → code pipeline (related but different goal)
- RECAP (arXiv:2602.07059) — LLM reproducibility checklist (closest academic precedent)
- "Automated Reproducibility Has a Problem Statement Problem" (arXiv:2601.04226) — frames the definitional challenge
