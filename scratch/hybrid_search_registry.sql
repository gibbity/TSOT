-- ==========================================
-- STEP 1: Enable the pgvector extension (if not already enabled)
-- ==========================================
create extension if not exists vector;

-- ==========================================
-- STEP 2: Create the hybrid_search_registry RPC function
-- ==========================================
CREATE OR REPLACE FUNCTION public.hybrid_search_registry(
  query_embedding vector(768),
  query_text text,
  match_limit int,
  filter_pillar text default null
)
RETURNS TABLE (
  id bigint, code text, pillar text, title text, human_summary text,
  metric text, verdict text, risk_level text, source_url text, source_type text,
  paper_year int, authors text, is_premium boolean,
  similarity_score float, keyword_score float, combined_score float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id, r.code, r.pillar, r.title, r.human_summary, r.metric, r.verdict,
    r.risk_level, r.source_url, r.source_type, r.paper_year, r.authors, r.is_premium,
    COALESCE(1.0 - (r.embedding <=> query_embedding), 0.0)::float as similarity_score,
    ts_rank_cd(r.fts, plainto_tsquery('english', query_text))::float as keyword_score,
    (
      CASE 
        WHEN r.embedding IS NULL THEN ts_rank_cd(r.fts, plainto_tsquery('english', query_text))::float
        ELSE (COALESCE(1.0 - (r.embedding <=> query_embedding), 0.0)::float * 0.8) + 
             (LEAST(ts_rank_cd(r.fts, plainto_tsquery('english', query_text))::float, 1.0) * 0.2)
      END
    )::float as combined_score
  FROM public.registry r
  WHERE 
    (filter_pillar IS NULL OR r.pillar = filter_pillar) AND
    (
      (r.embedding IS NOT NULL) OR 
      (r.fts @@ plainto_tsquery('english', query_text)) OR
      (query_text = '')
    )
  ORDER BY combined_score DESC
  LIMIT match_limit;
END;
$$;
