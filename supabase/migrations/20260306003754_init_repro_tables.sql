-- re:producer: reproducibility scoring tables
-- These extend paperfan's existing `papers` table (same Supabase project).
-- Run with: supabase migration up --db-url "$SUPABASE_DEV_DB_POOLER_URL"

-- repro_scores: one row per paper, stores computed reproducibility dimensions
CREATE TABLE IF NOT EXISTS public.repro_scores (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id      uuid NOT NULL REFERENCES public.papers(id) ON DELETE CASCADE,

  -- Dimension scores
  code_score    smallint NOT NULL DEFAULT 0 CHECK (code_score BETWEEN 0 AND 4),
  data_score    smallint NOT NULL DEFAULT 0 CHECK (data_score BETWEEN 0 AND 3),
  docs_score    smallint NOT NULL DEFAULT 0 CHECK (docs_score BETWEEN 0 AND 3),
  compute_estimate text,  -- 'laptop' | 'single GPU' | 'multi-GPU' | 'cluster' | 'unknown'

  -- Derived
  grade         text NOT NULL CHECK (grade IN ('A','B','C','D','F')),
  summary       text,

  -- Sources
  github_url        text,
  pwc_url           text,
  is_official_code  boolean NOT NULL DEFAULT false,
  pwc_stars         integer,
  has_pwc_results   boolean NOT NULL DEFAULT false,

  scored_at     timestamptz NOT NULL DEFAULT now(),
  score_version integer NOT NULL DEFAULT 1,

  CONSTRAINT repro_scores_paper_id_unique UNIQUE (paper_id)
);

CREATE INDEX IF NOT EXISTS idx_repro_scores_grade
  ON public.repro_scores (grade);

CREATE INDEX IF NOT EXISTS idx_repro_scores_scored_at
  ON public.repro_scores (scored_at DESC);

-- repro_runs: tracks automated Claude Code reproduction attempts (Phase 2)
CREATE TABLE IF NOT EXISTS public.repro_runs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id    uuid NOT NULL REFERENCES public.papers(id) ON DELETE CASCADE,
  status      text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','running','success','failed','timeout')),
  result      jsonb,
  logs        text,
  modal_run_id text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_repro_runs_paper_id
  ON public.repro_runs (paper_id);

CREATE INDEX IF NOT EXISTS idx_repro_runs_status
  ON public.repro_runs (status);

-- RLS: public read (scores are public info), writes via service role only
ALTER TABLE public.repro_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "repro_scores public read" ON public.repro_scores;
CREATE POLICY "repro_scores public read"
  ON public.repro_scores FOR SELECT
  USING (true);

ALTER TABLE public.repro_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "repro_runs public read" ON public.repro_runs;
CREATE POLICY "repro_runs public read"
  ON public.repro_runs FOR SELECT
  USING (true);

-- GRANTs
GRANT SELECT ON public.repro_scores TO anon, authenticated;
GRANT SELECT ON public.repro_runs TO anon, authenticated;
