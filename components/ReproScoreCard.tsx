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

const CODE_LABELS = ["No code", "Code promised", "Repo exists", "Runnable", "One-click repro"];
const DATA_LABELS = ["No data", "Access-gated", "Partially open", "Fully open"];
const DOCS_LABELS = ["No docs", "Minimal", "Decent README", "Full docs"];

const COMPUTE_ICONS: Record<ComputeEstimate, string> = {
  laptop: "💻",
  "single GPU": "🖥",
  "multi-GPU": "🖥🖥",
  cluster: "🔥",
  unknown: "❓",
};

function ScorePip({ value, max }: { value: number; max: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full flex-1 ${
            i < value
              ? "bg-violet-500"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        />
      ))}
    </div>
  );
}

export default function ReproScoreCard(props: Props) {
  const {
    grade,
    summary,
    code_score,
    data_score,
    docs_score,
    compute_estimate,
    github_url,
    pwc_url,
    is_official_code,
    pwc_stars,
    has_pwc_results,
    scored_at,
  } = props;

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Grade banner */}
      <div className={`px-6 py-5 flex items-center gap-4 grade-${grade}`}>
        <span className="text-5xl font-black">{grade}</span>
        <div>
          <p className="font-semibold text-base">Reproducibility grade</p>
          <p className="text-sm opacity-80 mt-0.5">{summary}</p>
        </div>
      </div>

      {/* Dimension breakdown */}
      <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-gray-100 dark:border-gray-800">
        <DimensionRow
          label="Code availability"
          score={code_score}
          max={4}
          text={CODE_LABELS[code_score]}
        />
        <DimensionRow
          label="Data openness"
          score={data_score}
          max={3}
          text={DATA_LABELS[data_score]}
        />
        <DimensionRow
          label="Documentation"
          score={docs_score}
          max={3}
          text={DOCS_LABELS[docs_score]}
        />
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Compute required</p>
          <p className="text-sm font-medium">
            {COMPUTE_ICONS[compute_estimate]} {compute_estimate}
          </p>
        </div>
      </div>

      {/* Links */}
      {(github_url || pwc_url) && (
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-3">
          {github_url && (
            <a
              href={github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:underline"
            >
              GitHub {is_official_code && <span className="text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full">official</span>}
              {pwc_stars != null && (
                <span className="text-xs text-gray-400">★ {pwc_stars.toLocaleString()}</span>
              )}
            </a>
          )}
          {pwc_url && (
            <a
              href={`https://paperswithcode.com${pwc_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Papers With Code {has_pwc_results && <span className="text-xs text-emerald-600">✓ results</span>}
            </a>
          )}
        </div>
      )}

      <div className="px-6 py-2 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs text-gray-400">
          Scored {new Date(scored_at).toLocaleDateString()} — scores are heuristic-based and may be incomplete
        </p>
      </div>
    </div>
  );
}

function DimensionRow({
  label,
  score,
  max,
  text,
}: {
  label: string;
  score: number;
  max: number;
  text: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-xs text-gray-400">{score}/{max}</p>
      </div>
      <ScorePip value={score} max={max} />
      <p className="text-sm text-gray-700 dark:text-gray-300">{text}</p>
    </div>
  );
}
