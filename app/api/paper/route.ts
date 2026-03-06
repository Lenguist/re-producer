import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { fetchArxivPaper } from "@/lib/arxiv";

// GET /api/paper?arxivId=2301.12345
// Returns paper metadata from Supabase (paperfan's papers table) or falls back to arXiv
export async function GET(req: NextRequest) {
  const arxivId = req.nextUrl.searchParams.get("arxivId");
  if (!arxivId) return NextResponse.json({ error: "arxivId required" }, { status: 400 });

  const db = supabaseAdmin();

  // Check paperfan's papers table first
  const { data: paper } = await db
    .from("papers")
    .select("id, arxiv_id, title, abstract, authors, published_date, primary_field, url_abs")
    .eq("arxiv_id", arxivId)
    .maybeSingle();

  if (paper) return NextResponse.json(paper);

  // Not in DB — fetch live from arXiv
  const arxivPaper = await fetchArxivPaper(arxivId);
  if (!arxivPaper) {
    return NextResponse.json({ error: "Paper not found" }, { status: 404 });
  }

  return NextResponse.json({
    arxiv_id: arxivPaper.arxiv_id,
    title: arxivPaper.title,
    abstract: arxivPaper.abstract,
    authors: arxivPaper.authors.map((name) => ({ name })),
    published_date: arxivPaper.published,
    primary_field: arxivPaper.categories[0] ?? null,
    url_abs: `https://arxiv.org/abs/${arxivId}`,
  });
}
