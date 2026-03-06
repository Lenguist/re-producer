import type { Grade, ComputeEstimate } from "@/lib/scorer";

interface Props {
  grade: Grade;
  summary: string;
  code_score: number;
  data_score: number;
  docs_score: number;
  compute_estimate: ComputeEstimate;
  github_url: string | null;
  pwc_url: string | null;
  is_official_code: boolean;
  pwc_stars: number | null;
  has_pwc_results: boolean;
  scored_at: string;
}

const CODE_LABELS: Record<number, string> = {
  0: "no code",
  1: "code promised",
  2: "repo exists",
  3: "runnable",
  4: "one-click repro",
};
const DATA_LABELS: Record<number, string> = {
  0: "no data",
  1: "access-gated",
  2: "partially open",
  3: "fully open",
};
const DOCS_LABELS: Record<number, string> = {
  0: "no docs",
  1: "minimal",
  2: "decent readme",
  3: "full docs",
};

function PipBar({ value, max }: { value: number; max: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className="h-1.5 rounded-sm flex-1"
          style={{ background: i < value ? "var(--accent)" : "var(--bg-border)" }}
        />
      ))}
    </div>
  );
}

export default function ReproScoreCard(props: Props) {
  const {
    grade, summary, code_score, data_score, docs_score,
    compute_estimate, github_url, pwc_url,
    is_official_code, pwc_stars, has_pwc_results, scored_at,
  } = props;

  return (
    <div className="rounded-lg overflow-hidden font-mono"
      style={{ border: "1px solid var(--bg-border)", background: "var(--bg-surface)" }}>

      {/* Header bar */}
      <div className="px-4 py-2 flex items-center gap-2"
        style={{ borderBottom: "1px solid var(--bg-border)", background: "var(--bg)" }}>
        <span style={{ color: "var(--fg-muted)" }} className="text-xs">repro.report</span>
        <span style={{ color: "var(--fg-dim)" }} className="text-xs">·</span>
        <span style={{ color: "var(--fg-muted)" }} className="text-xs">arxiv paper</span>
      </div>

      {/* Grade + summary */}
      <div className={`px-5 py-5 flex items-start gap-5 border grade-${grade}`}
        style={{ borderColor: "inherit", borderTop: "none", borderLeft: "none", borderRight: "none" }}>
        <div className="text-6xl font-black leading-none">{grade}</div>
        <div className="pt-1 space-y-1">
          <div className="text-xs opacity-60 uppercase tracking-widest">reproducibility grade</div>
          <div className="text-sm opacity-90 leading-relaxed max-w-sm">{summary}</div>
        </div>
      </div>

      {/* Dimensions */}
      <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Dimension label="code" score={code_score} max={4} text={CODE_LABELS[code_score]} />
        <Dimension label="data" score={data_score} max={3} text={DATA_LABELS[data_score]} />
        <Dimension label="docs" score={docs_score} max={3} text={DOCS_LABELS[docs_score]} />
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-widest" style={{ color: "var(--fg-muted)" }}>compute</div>
          <div className="text-sm" style={{ color: "var(--fg)" }}>{compute_estimate}</div>
        </div>
      </div>

      {/* Links */}
      {(github_url || pwc_url) && (
        <div className="px-5 py-3 flex flex-wrap gap-4"
          style={{ borderTop: "1px solid var(--bg-border)" }}>
          {github_url && (
            <a href={github_url} target="_blank" rel="noopener noreferrer"
              className="text-xs flex items-center gap-2 transition hover:opacity-100"
              style={{ color: "var(--accent)", opacity: 0.85 }}>
              github/{github_url.replace("https://github.com/", "")}
              {is_official_code && (
                <span className="text-xs px-1.5 py-0.5 rounded"
                  style={{ background: "var(--bg-border)", color: "var(--fg-muted)" }}>
                  official
                </span>
              )}
              {pwc_stars != null && (
                <span style={{ color: "var(--fg-muted)" }}>★{pwc_stars.toLocaleString()}</span>
              )}
            </a>
          )}
          {pwc_url && (
            <a href={`https://paperswithcode.com${pwc_url}`} target="_blank" rel="noopener noreferrer"
              className="text-xs transition hover:opacity-100"
              style={{ color: "var(--fg-muted)", opacity: 0.7 }}>
              paperswithcode.com
              {has_pwc_results && <span style={{ color: "var(--grade-a-text)" }} className="ml-1">✓ results</span>}
            </a>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-2" style={{ borderTop: "1px solid var(--bg-border)" }}>
        <span className="text-xs" style={{ color: "var(--fg-dim)" }}>
          scored {new Date(scored_at).toLocaleDateString()} — heuristic, may be incomplete
        </span>
      </div>
    </div>
  );
}

function Dimension({ label, score, max, text }: { label: string; score: number; max: number; text: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-widest" style={{ color: "var(--fg-muted)" }}>{label}</span>
        <span className="text-xs" style={{ color: "var(--fg-dim)" }}>{score}/{max}</span>
      </div>
      <PipBar value={score} max={max} />
      <div className="text-sm" style={{ color: "var(--fg)" }}>{text}</div>
    </div>
  );
}
