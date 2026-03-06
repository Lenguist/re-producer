import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { fetchArxivPaper } from "@/lib/arxiv";
import { fetchPwcEntry } from "@/lib/pwc";
import { scoreReproducibility } from "@/lib/scorer";

// GET /api/score?arxivId=2301.12345
// Returns cached score, or computes + caches it
export async function GET(req: NextRequest) {
  const arxivId = req.nextUrl.searchParams.get("arxivId");
  if (!arxivId) return NextResponse.json({ error: "arxivId required" }, { status: 400 });

  const db = supabaseAdmin();

  // Check cache first (join through papers table)
  const { data: cached } = await db
    .from("repro_scores")
    .select("*, papers!inner(arxiv_id)")
    .eq("papers.arxiv_id", arxivId)
    .maybeSingle();

  if (cached) return NextResponse.json(cached);

  // Not cached — fetch from arXiv + PWC and compute
  const [paper, pwc] = await Promise.all([
    fetchArxivPaper(arxivId),
    fetchPwcEntry(arxivId),
  ]);

  if (!paper) {
    return NextResponse.json({ error: "Paper not found on arXiv" }, { status: 404 });
  }

  const score = scoreReproducibility(paper, pwc);

  // Find or create paper in Supabase (reusing paperfan's papers table)
  let { data: existingPaper } = await db
    .from("papers")
    .select("id")
    .eq("arxiv_id", arxivId)
    .maybeSingle();

  if (!existingPaper) {
    const { data: newPaper, error } = await db
      .from("papers")
      .insert({
        arxiv_id: arxivId,
        title: paper.title,
        abstract: paper.abstract,
        authors: paper.authors.map((name) => ({ name })),
        published_date: paper.published || null,
        primary_field: paper.categories[0] ?? null,
        url_abs: `https://arxiv.org/abs/${arxivId}`,
        url_pdf: `https://arxiv.org/pdf/${arxivId}`,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to insert paper:", error);
      // If dupe (race condition), try to fetch again
      const { data: retry } = await db
        .from("papers")
        .select("id")
        .eq("arxiv_id", arxivId)
        .maybeSingle();
      existingPaper = retry;
    } else {
      existingPaper = newPaper;
    }
  }

  if (!existingPaper) {
    return NextResponse.json({ error: "Failed to store paper" }, { status: 500 });
  }

  // Store repro score
  const { data: inserted, error: scoreError } = await db
    .from("repro_scores")
    .upsert(
      {
        paper_id: existingPaper.id,
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
    )
    .select()
    .single();

  if (scoreError) {
    console.error("Failed to store score:", scoreError);
    // Return score even if we failed to cache it
    return NextResponse.json(score);
  }

  return NextResponse.json(inserted);
}
