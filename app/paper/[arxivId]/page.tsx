import { notFound } from "next/navigation";
import Link from "next/link";
import ReproScoreCard from "@/components/ReproScoreCard";
import { fetchArxivPaper } from "@/lib/arxiv";
import { fetchPwcEntry } from "@/lib/pwc";
import { scoreReproducibility } from "@/lib/scorer";
import { supabaseAdmin } from "@/lib/supabase";

interface Props {
  params: Promise<{ arxivId: string }>;
}

async function getPaperAndScore(arxivId: string) {
  const db = supabaseAdmin();

  // Check if paper + score already cached
  const { data: cached } = await db
    .from("repro_scores")
    .select("*, papers!inner(id, arxiv_id, title, abstract, authors, published_date, primary_field)")
    .eq("papers.arxiv_id", arxivId)
    .maybeSingle();

  if (cached) {
    const { papers, ...score } = cached as typeof cached & { papers: Record<string, unknown> };
    return { paper: papers, score };
  }

  // Fetch from arXiv + PWC in parallel
  const [arxivPaper, pwc] = await Promise.all([
    fetchArxivPaper(arxivId),
    fetchPwcEntry(arxivId),
  ]);

  if (!arxivPaper) return null;

  const score = scoreReproducibility(arxivPaper, pwc);

  // Find or create paper row
  let { data: paperRow } = await db
    .from("papers")
    .select("id, arxiv_id, title, abstract, authors, published_date, primary_field")
    .eq("arxiv_id", arxivId)
    .maybeSingle();

  if (!paperRow) {
    const { data: inserted } = await db
      .from("papers")
      .insert({
        arxiv_id: arxivId,
        title: arxivPaper.title,
        abstract: arxivPaper.abstract,
        authors: arxivPaper.authors.map((name) => ({ name })),
        published_date: arxivPaper.published || null,
        primary_field: arxivPaper.categories[0] ?? null,
        url_abs: `https://arxiv.org/abs/${arxivId}`,
        url_pdf: `https://arxiv.org/pdf/${arxivId}`,
      })
      .select("id, arxiv_id, title, abstract, authors, published_date, primary_field")
      .single();

    if (!inserted) {
      // Race condition — try fetching again
      const { data: retry } = await db
        .from("papers")
        .select("id, arxiv_id, title, abstract, authors, published_date, primary_field")
        .eq("arxiv_id", arxivId)
        .maybeSingle();
      paperRow = retry;
    } else {
      paperRow = inserted;
    }
  }

  if (!paperRow) return { paper: { ...arxivPaper, arxiv_id: arxivId }, score };

  // Cache the score
  await db.from("repro_scores").upsert(
    {
      paper_id: paperRow.id,
      code_score: score.code_score,
      data_score: score.data_score,
      docs_score: score.docs_score,
      compute_estimate: score.compute_estimate,
      grade: score.grade,
      summary: score.summary,
      github_url: score.github_url,
      pwc_url: score.pwc_url,
      is_official_code: score.is_official_code,
      pwc_stars: score.pwc_stars,
      has_pwc_results: score.has_pwc_results,
      scored_at: score.scored_at,
      score_version: 1,
    },
    { onConflict: "paper_id" }
  );

  return { paper: paperRow, score };
}

export default async function PaperPage({ params }: Props) {
  const { arxivId } = await params;
  const result = await getPaperAndScore(arxivId);

  if (!result) notFound();

  const { paper, score } = result;
  const authors: { name: string }[] = (paper.authors as { name: string }[]) ?? [];
  const authorStr = authors.length > 3
    ? authors.slice(0, 3).map((a) => a.name).join(", ") + " et al."
    : authors.map((a) => a.name).join(", ");
  const year = (paper.published_date as string)?.slice(0, 4);

  return (
    <div className="space-y-8 font-mono">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs" style={{ color: "var(--fg-muted)" }}>
        <Link href="/" className="hover:opacity-100 opacity-60 transition">~/re:producer</Link>
        <span style={{ color: "var(--fg-dim)" }}>/</span>
        <span style={{ color: "var(--fg-dim)" }}>{arxivId}</span>
      </div>

      {/* Paper header */}
      <div className="space-y-2">
        {(paper.primary_field as string) && (
          <span className="inline-block text-xs px-2 py-0.5 rounded"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--bg-border)", color: "var(--fg-muted)" }}>
            {paper.primary_field as string}
          </span>
        )}
        <h1 className="text-xl font-bold leading-snug font-sans">{paper.title as string}</h1>
        <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
          {authorStr}{year && ` · ${year}`}
        </p>
        <div className="flex gap-4 text-xs">
          <a href={`https://arxiv.org/abs/${arxivId}`} target="_blank" rel="noopener noreferrer"
            style={{ color: "var(--accent)" }} className="hover:underline">
            arXiv:{arxivId}
          </a>
          <a href={`https://arxiv.org/pdf/${arxivId}`} target="_blank" rel="noopener noreferrer"
            style={{ color: "var(--fg-muted)" }} className="hover:opacity-100 opacity-60 transition">
            [pdf]
          </a>
        </div>
      </div>

      {/* Score */}
      <ReproScoreCard {...score} />

      {/* Abstract */}
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-widest" style={{ color: "var(--fg-dim)" }}>// abstract</div>
        <p className="text-sm font-sans leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          {paper.abstract as string}
        </p>
      </div>
    </div>
  );
}
