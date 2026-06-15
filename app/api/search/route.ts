import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { RegistryRecord, Pillar } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryText = searchParams.get('q') || '';
    const filterPillar = searchParams.get('pillar') || null;
    const page = parseInt(searchParams.get('page') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '30', 10);

    const supabase = await createClient();

    // If query is empty, do a standard chronological fetch
    if (!queryText.trim()) {
      let dbQuery = supabase
        .from('registry')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filterPillar && filterPillar !== 'ALL') {
        dbQuery = dbQuery.eq('pillar', filterPillar);
      }

      const fromRange = page * limit;
      const toRange = fromRange + limit - 1;
      const { data, count, error } = await dbQuery.range(fromRange, toRange);

      if (error) throw error;
      return NextResponse.json({
        records: data || [],
        count: count || 0,
        isSemantic: false
      });
    }

    // AI Semantic/Hybrid Search Setup
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Falling back to keyword-only search.');
      return await performKeywordFallback(supabase, queryText, filterPillar, page, limit);
    }

    let queryEmbedding: number[] | null = null;
    try {
      const ai = new GoogleGenerativeAI(apiKey);
      const embModel = ai.getGenerativeModel({ model: 'gemini-embedding-2' });
      const embResult = await embModel.embedContent({
        content: { role: 'user', parts: [{ text: queryText }] },
        outputDimensionality: 768
      } as any);
      queryEmbedding = embResult.embedding?.values || null;
    } catch (e) {
      console.warn('Embedding generation failed, falling back to keyword search:', e);
    }

    // Call the hybrid search RPC function
    try {
      const { data, error } = await supabase.rpc('hybrid_search_registry', {
        query_embedding: queryEmbedding,
        query_text: queryText,
        match_limit: 200, // Pull a larger rank space of matches
        filter_pillar: filterPillar === 'ALL' ? null : filterPillar
      });

      if (error) throw error;

      const formatted = (data || []).map((row: any) => ({
        id: Number(row.id),
        code: String(row.code),
        pillar: row.pillar as Pillar,
        title: String(row.title),
        human_summary: String(row.human_summary),
        metric: String(row.metric),
        verdict: String(row.verdict),
        risk_level: row.risk_level as 'stable' | 'warning' | 'critical',
        source_url: row.source_url || null,
        source_type: row.source_type as 'peer-reviewed' | 'preprint' | 'conference',
        paper_year: row.paper_year != null ? Number(row.paper_year) : null,
        authors: row.authors || null,
        is_premium: Boolean(row.is_premium),
        created_at: row.created_at || new Date().toISOString(),
        score: Math.round((row.combined_score ?? 0) * 100)
      }));

      // Filter by a minimum relevance score (48%) to prune poor matches
      const filtered = formatted.filter(r => r.score >= 48);

      // Apply pagination locally to the ranked/filtered results
      const paginated = filtered.slice(page * limit, (page + 1) * limit);

      return NextResponse.json({
        records: paginated,
        count: filtered.length,
        isSemantic: !!queryEmbedding
      });
    } catch (rpcErr) {
      console.warn('RPC hybrid search failed, falling back to keyword search:', rpcErr);
      return await performKeywordFallback(supabase, queryText, filterPillar, page, limit);
    }
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: error.message || 'Server error occurred' }, { status: 500 });
  }
}

async function performKeywordFallback(
  supabase: any,
  queryText: string,
  filterPillar: string | null,
  page: number,
  limit: number
) {
  let dbQuery = supabase
    .from('registry')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filterPillar && filterPillar !== 'ALL') {
    dbQuery = dbQuery.eq('pillar', filterPillar);
  }

  const searchKeywords = queryText.trim().split(/\s+/).filter(Boolean).join(' & ');
  if (searchKeywords) {
    dbQuery = dbQuery.textSearch('fts', searchKeywords, {
      config: 'english',
      type: 'plain'
    });
  }

  const fromRange = page * limit;
  const toRange = fromRange + limit - 1;
  const { data, count, error } = await dbQuery.range(fromRange, toRange);

  if (error) throw error;
  return NextResponse.json({
    records: data || [],
    count: count || 0,
    isSemantic: false
  });
}
