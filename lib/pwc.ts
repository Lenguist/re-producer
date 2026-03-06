// Papers With Code API — free, no key required
// Docs: https://paperswithcode.com/api/v1/docs/

export interface PwcEntry {
  paper_url: string | null;
  repo_url: string | null;
  stars: number | null;
  framework: string | null;
  is_official: boolean;
  has_results: boolean;
}

export async function fetchPwcEntry(arxivId: string): Promise<PwcEntry | null> {
  try {
    // Look up paper on PWC by arxiv ID
    const res = await fetch(
      `https://paperswithcode.com/api/v1/papers/?arxiv_id=${encodeURIComponent(arxivId)}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.results?.length) return null;

    const paper = data.results[0];

    // Fetch repos for this paper
    const repoRes = await fetch(
      `https://paperswithcode.com/api/v1/papers/${paper.id}/repositories/`,
      { next: { revalidate: 86400 } }
    );
    let repo = null;
    let stars = null;
    let framework = null;
    let is_official = false;

    if (repoRes.ok) {
      const repoData = await repoRes.json();
      if (repoData.results?.length) {
        // Prefer official repo
        const official = repoData.results.find((r: { is_official: boolean }) => r.is_official);
        repo = official ?? repoData.results[0];
        stars = repo?.stars ?? null;
        framework = repo?.framework ?? null;
        is_official = repo?.is_official ?? false;
      }
    }

    // Check if paper has result tables on PWC
    const resultsRes = await fetch(
      `https://paperswithcode.com/api/v1/papers/${paper.id}/results/`,
      { next: { revalidate: 86400 } }
    );
    let has_results = false;
    if (resultsRes.ok) {
      const resultsData = await resultsRes.json();
      has_results = (resultsData.results?.length ?? 0) > 0;
    }

    return {
      paper_url: paper.url_abs ?? null,
      repo_url: repo?.url ?? null,
      stars,
      framework,
      is_official,
      has_results,
    };
  } catch {
    return null;
  }
}
