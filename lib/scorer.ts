import type { ArxivPaper } from "./arxiv";
import type { PwcEntry } from "./pwc";

export type Grade = "A" | "B" | "C" | "D" | "F";
export type ComputeEstimate = "laptop" | "single GPU" | "multi-GPU" | "cluster" | "unknown";

export interface ReproScore {
  // Dimension scores
  code_score: 0 | 1 | 2 | 3 | 4;   // 0=none 1=promised 2=repo exists 3=runnable 4=one-click
  data_score: 0 | 1 | 2 | 3;        // 0=none 1=gated 2=partial 3=fully open
  docs_score: 0 | 1 | 2 | 3;        // 0=none 1=minimal 2=decent 3=full
  compute_estimate: ComputeEstimate;

  // Derived
  grade: Grade;
  summary: string;

  // Sources
  github_url: string | null;
  pwc_url: string | null;
  is_official_code: boolean;
  pwc_stars: number | null;
  has_pwc_results: boolean;

  scored_at: string;
}

// --- GitHub URL extraction ---
const GITHUB_RE = /github\.com\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)/gi;

function extractGithubUrl(text: string): string | null {
  const match = GITHUB_RE.exec(text);
  GITHUB_RE.lastIndex = 0;
  if (!match) return null;
  return `https://github.com/${match[1].replace(/\.$/, "")}`;
}

// --- Compute heuristics from abstract/comments ---
function estimateCompute(text: string): ComputeEstimate {
  const t = text.toLowerCase();
  if (/\b(tpu pod|tpu v\d|a100|h100|v100|gpu cluster|multi.?gpu|multiple gpu|8.?x.?gpu|16.?x.?gpu|\d{2,} gpu|\d{3,} gpu)/i.test(t))
    return "cluster";
  if (/\b(4.?x.?gpu|8.?x.?gpu|a100|h100|v100|40gb|80gb)/i.test(t))
    return "multi-GPU";
  if (/\b(single gpu|one gpu|rtx|gtx|3090|4090|a6000|t4|p100|1.?x.?gpu)/i.test(t))
    return "single GPU";
  if (/\b(cpu|laptop|no gpu|inference only|no training)/i.test(t))
    return "laptop";
  // If it's a big model paper, default to cluster
  if (/\b(\d{1,3}b param|\d{1,3}b model|billion param|large language model|foundation model)/i.test(t))
    return "cluster";
  return "unknown";
}

function detectCodePromise(text: string): boolean {
  const t = text.toLowerCase();
  return (
    /code (will be|to be) (released|made available|available)/i.test(t) ||
    /will release (the )?code/i.test(t) ||
    /upon acceptance/i.test(t) ||
    /code is available/i.test(t)
  );
}

function detectOpenData(text: string): boolean {
  const t = text.toLowerCase();
  return (
    /dataset.{0,40}(available|released|public|open)/i.test(t) ||
    /data.{0,20}(huggingface|zenodo|kaggle|figshare|github|gdrive)/i.test(t)
  );
}

function detectGatedData(text: string): boolean {
  const t = text.toLowerCase();
  return (
    /request.{0,20}(access|form|approval)/i.test(t) ||
    /available (upon|on) request/i.test(t) ||
    /proprietary|licensed dataset|not publicly available/i.test(t)
  );
}

// --- Main scoring function ---
export function scoreReproducibility(paper: ArxivPaper, pwc: PwcEntry | null): ReproScore {
  const fullText = [paper.title, paper.abstract, paper.comments ?? ""].join(" ");

  // --- Code score ---
  let github_url: string | null = null;
  let is_official_code = false;

  // Priority: PWC official > PWC any > abstract/comments
  if (pwc?.repo_url) {
    github_url = pwc.repo_url;
    is_official_code = pwc.is_official;
  } else {
    github_url = extractGithubUrl(fullText);
  }

  let code_score: ReproScore["code_score"] = 0;
  if (github_url) {
    // We have a repo — assume runnable (3); with PWC results bump to 4
    code_score = pwc?.has_results ? 4 : 3;
  } else if (detectCodePromise(fullText)) {
    code_score = 1;
  }

  // --- Data score ---
  let data_score: ReproScore["data_score"] = 0;
  if (detectOpenData(fullText)) data_score = 3;
  else if (detectGatedData(fullText)) data_score = 1;
  else if (code_score >= 3) data_score = 1; // repo exists, data situation unknown

  // --- Docs score ---
  // Rough proxy: if PWC entry + official repo → likely has README (score 2+)
  // If just a repo mentioned → 1; if one-click PWC results → 3
  let docs_score: ReproScore["docs_score"] = 0;
  if (code_score === 4) docs_score = 3;
  else if (code_score === 3 && is_official_code) docs_score = 2;
  else if (code_score >= 2) docs_score = 1;
  else if (code_score === 1) docs_score = 1; // promised code usually has some docs

  // --- Compute ---
  const compute_estimate = estimateCompute(fullText);

  // --- Grade ---
  let grade: Grade;
  if (code_score === 4 && data_score >= 2) grade = "A";
  else if (code_score >= 3 && data_score >= 1) grade = "B";
  else if (code_score >= 2) grade = "C";
  else if (code_score === 1) grade = "D";
  else grade = "F";

  // --- Summary ---
  const summaryParts: string[] = [];
  if (grade === "A") summaryParts.push("Highly reproducible — code and data are openly available.");
  else if (grade === "B") summaryParts.push("Reproducible — code is available; data situation may require checking.");
  else if (grade === "C") summaryParts.push("Partially reproducible — a repository exists but completeness is uncertain.");
  else if (grade === "D") summaryParts.push("Authors promise to release code but it may not be available yet.");
  else summaryParts.push("No code or reproduction path found. Results may be difficult to verify.");

  if (compute_estimate === "cluster") summaryParts.push("Requires significant compute (cluster-scale).");
  else if (compute_estimate === "multi-GPU") summaryParts.push("Requires multi-GPU setup.");
  else if (compute_estimate === "single GPU") summaryParts.push("Reproducible on a single GPU.");
  else if (compute_estimate === "laptop") summaryParts.push("Can run on CPU/laptop.");

  return {
    code_score,
    data_score,
    docs_score,
    compute_estimate,
    grade,
    summary: summaryParts.join(" "),
    github_url,
    pwc_url: pwc?.paper_url ?? null,
    is_official_code,
    pwc_stars: pwc?.stars ?? null,
    has_pwc_results: pwc?.has_results ?? false,
    scored_at: new Date().toISOString(),
  };
}
