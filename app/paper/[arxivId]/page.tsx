import { notFound } from "next/navigation";
import Link from "next/link";
import ReproScoreCard from "@/components/ReproScoreCard";

interface Props {
  params: Promise<{ arxivId: string }>;
}

async function getPaper(arxivId: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/paper?arxivId=${encodeURIComponent(arxivId)}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  return res.json();
}

async function getScore(arxivId: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/score?arxivId=${encodeURIComponent(arxivId)}`, {
    // No cache — scoring may update; but ISR would be fine too
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function PaperPage({ params }: Props) {
  const { arxivId } = await params;

  const [paper, score] = await Promise.all([
    getPaper(arxivId),
    getScore(arxivId),
  ]);

  if (!paper) notFound();

  const authors: { name: string }[] = paper.authors ?? [];
  const authorStr = authors.length > 3
    ? authors.slice(0, 3).map((a) => a.name).join(", ") + ` et al.`
    : authors.map((a) => a.name).join(", ");

  const year = paper.published_date?.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
        ← back
      </Link>

      {/* Paper header */}
      <div className="space-y-2">
        {paper.primary_field && (
          <span className="inline-block text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
            {paper.primary_field}
          </span>
        )}
        <h1 className="text-2xl font-bold leading-snug">{paper.title}</h1>
        <p className="text-sm text-gray-500">
          {authorStr}
          {year && ` · ${year}`}
        </p>
        <div className="flex gap-3 text-xs">
          <a
            href={`https://arxiv.org/abs/${arxivId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-600 hover:underline"
          >
            arXiv:{arxivId}
          </a>
          <a
            href={`https://arxiv.org/pdf/${arxivId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600"
          >
            PDF
          </a>
        </div>
      </div>

      {/* Score card */}
      {score ? (
        <ReproScoreCard {...score} />
      ) : (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 px-6 py-8 text-center text-gray-400">
          Could not compute score. Try refreshing.
        </div>
      )}

      {/* Abstract */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Abstract</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{paper.abstract}</p>
      </div>
    </div>
  );
}
