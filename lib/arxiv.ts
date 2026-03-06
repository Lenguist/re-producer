export interface ArxivPaper {
  arxiv_id: string;
  title: string;
  abstract: string;
  authors: string[];
  published: string; // YYYY-MM-DD
  categories: string[];
  comments: string | null;
  journal_ref: string | null;
  doi: string | null;
}

export async function fetchArxivPaper(arxivId: string): Promise<ArxivPaper | null> {
  const url = `https://export.arxiv.org/api/query?id_list=${encodeURIComponent(arxivId)}&max_results=1`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return null;

  const xml = await res.text();

  const title = extractTag(xml, "title", 1); // index 1 to skip feed title
  const abstract = extractTag(xml, "summary");
  const published = extractTag(xml, "published");
  const comments = extractTag(xml, "arxiv:comment");
  const journal_ref = extractTag(xml, "arxiv:journal_ref");
  const doi = extractTag(xml, "arxiv:doi");

  const authorMatches = [...xml.matchAll(/<name>(.*?)<\/name>/gs)];
  const authors = authorMatches.map((m) => m[1].trim());

  const categoryMatches = [...xml.matchAll(/term="([^"]+)"/g)];
  const categories = categoryMatches.map((m) => m[1]).filter((c) => c.includes("."));

  if (!title) return null;

  return {
    arxiv_id: arxivId,
    title: title.replace(/\s+/g, " ").trim(),
    abstract: abstract?.replace(/\s+/g, " ").trim() ?? "",
    authors,
    published: published?.slice(0, 10) ?? "",
    categories,
    comments: comments?.trim() ?? null,
    journal_ref: journal_ref?.trim() ?? null,
    doi: doi?.trim() ?? null,
  };
}

function extractTag(xml: string, tag: string, index = 0): string | null {
  const escaped = tag.replace(":", "\\:");
  const re = new RegExp(`<${escaped}[^>]*>(.*?)<\\/${escaped}>`, "gs");
  const matches = [...xml.matchAll(re)];
  return matches[index]?.[1]?.trim() ?? null;
}
