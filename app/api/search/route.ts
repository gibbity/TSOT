import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { RegistryRecord, Pillar } from '@/types';
import localAiActData from '@/lib/supabase/ai_act_data.json';

// Helper for local search fallback when Supabase is unavailable
function performLocalSearch(
  queryText: string,
  filterPillar: string | null,
  page: number,
  limit: number,
  isAiAct: boolean
): { records: RegistryRecord[]; count: number; isSemantic: boolean } {
  let list = isAiAct 
    ? (localAiActData as any[]).map(art => ({
        id: Math.random(), // generate temp numeric id
        code: art.code,
        pillar: art.category as Pillar,
        title: art.title,
        human_summary: art.article_text,
        metric: 'Compliance Checklist',
        verdict: art.compliance_verdict,
        risk_level: art.risk_level as 'stable' | 'warning' | 'critical',
        source_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689',
        source_type: 'regulation' as any,
        paper_year: 2024,
        authors: 'European Parliament & Council',
        is_premium: false,
        created_at: new Date().toISOString()
      }))
    : []; // For registry, fallback is handled via database keyword search

  // Filter by pillar
  if (filterPillar && filterPillar !== 'ALL') {
    list = list.filter(r => r.pillar === filterPillar);
  }

  // Filter by search text (keyword match)
  if (queryText.trim()) {
    const keywords = queryText.toLowerCase().split(/\s+/).filter(Boolean);
    list = list.filter(r => {
      const titleMatch = keywords.every(kw => r.title.toLowerCase().includes(kw));
      const summaryMatch = keywords.every(kw => r.human_summary.toLowerCase().includes(kw));
      const verdictMatch = keywords.every(kw => r.verdict.toLowerCase().includes(kw));
      return titleMatch || summaryMatch || verdictMatch;
    });
  }

  const count = list.length;
  const paginated = list.slice(page * limit, (page + 1) * limit);

  return {
    records: paginated,
    count,
    isSemantic: false
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryText = searchParams.get('q') || '';
    const filterPillar = searchParams.get('pillar') || null;
    const page = parseInt(searchParams.get('page') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '30', 10);
    const source = searchParams.get('source') || 'corpus'; // 'corpus' or 'ai_act'

    const isAiAct = source === 'ai_act';

    const supabase = await createClient();

    // If query is empty, do a standard chronological fetch
    if (!queryText.trim()) {
      try {
        const tableName = isAiAct ? 'ai_act' : 'registry';
        let dbQuery = supabase
          .from(tableName)
          .select('*', { count: 'exact' });

        if (isAiAct) {
          dbQuery = dbQuery.order('code', { ascending: true }); // Order articles sequentially
        } else {
          dbQuery = dbQuery.order('created_at', { ascending: false });
        }

        if (filterPillar && filterPillar !== 'ALL') {
          dbQuery = dbQuery.eq(isAiAct ? 'pillar' : 'pillar', filterPillar);
        }

        const fromRange = page * limit;
        const toRange = fromRange + limit - 1;
        const { data, count, error } = await dbQuery.range(fromRange, toRange);

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
          source_type: row.source_type as any,
          paper_year: row.paper_year != null ? Number(row.paper_year) : null,
          authors: row.authors || null,
          is_premium: Boolean(row.is_premium),
          created_at: row.created_at || new Date().toISOString()
        }));

        return NextResponse.json({
          records: formatted,
          count: count || 0,
          isSemantic: false
        });
      } catch (dbErr) {
        console.warn('Database fetch failed, falling back to local search:', dbErr);
        if (isAiAct) {
          const res = performLocalSearch(queryText, filterPillar, page, limit, true);
          return NextResponse.json(res);
        }
        throw dbErr;
      }
    }

    // AI Semantic/Hybrid Search Setup
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Falling back to keyword/local search.');
      if (isAiAct) {
        return NextResponse.json(performLocalSearch(queryText, filterPillar, page, limit, true));
      }
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
      const rpcName = isAiAct ? 'hybrid_search_ai_act' : 'hybrid_search_registry';
      const rpcArgs = isAiAct 
        ? {
            query_embedding: queryEmbedding,
            query_text: queryText,
            match_limit: 200,
            filter_category: filterPillar === 'ALL' ? null : filterPillar
          }
        : {
            query_embedding: queryEmbedding,
            query_text: queryText,
            match_limit: 200,
            filter_pillar: filterPillar === 'ALL' ? null : filterPillar
          };

      const { data, error } = await supabase.rpc(rpcName, rpcArgs);

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
        source_type: row.source_type as any,
        paper_year: row.paper_year != null ? Number(row.paper_year) : null,
        authors: row.authors || null,
        is_premium: Boolean(row.is_premium),
        created_at: row.created_at || new Date().toISOString(),
        score: Math.round((row.combined_score ?? 0) * 100)
      }));

      const filtered = formatted.filter((r: any) => r.score >= 48);
      const paginated = filtered.slice(page * limit, (page + 1) * limit);

      return NextResponse.json({
        records: paginated,
        count: filtered.length,
        isSemantic: !!queryEmbedding
      });
    } catch (rpcErr) {
      console.warn('RPC hybrid search failed, falling back to keyword search:', rpcErr);
      if (isAiAct) {
        return NextResponse.json(performLocalSearch(queryText, filterPillar, page, limit, true));
      }
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
