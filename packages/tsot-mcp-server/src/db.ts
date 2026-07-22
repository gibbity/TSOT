import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ResearchRecord, AiActArticle, ServerConfig } from './types.js';
import { SEED_RECORDS, SEED_AI_ACT_RECORDS } from './seed_data.js';

export class DbProvider {
  private supabase: SupabaseClient | null = null;
  private ai: GoogleGenerativeAI | null = null;

  constructor(config: ServerConfig = {}) {
    const supabaseUrl = config.supabaseUrl || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = config.supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const geminiApiKey = config.geminiApiKey || process.env.GEMINI_API_KEY || '';

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    } else {
      console.error('ℹ️ TSOT MCP: Running in offline seed mode (no Supabase credentials provided).');
    }

    if (geminiApiKey) {
      this.ai = new GoogleGenerativeAI(geminiApiKey);
    } else {
      console.error('ℹ️ TSOT MCP: GEMINI_API_KEY missing. Embedding-based vector search disabled, using keyword & heuristic fallbacks.');
    }
  }

  public async getQueryEmbedding(text: string): Promise<number[] | null> {
    if (!this.ai) return null;
    try {
      const embModel = this.ai.getGenerativeModel({ model: 'gemini-embedding-2' });
      const result = await embModel.embedContent({
        content: { role: 'user', parts: [{ text }] },
        outputDimensionality: 768
      } as any);
      return result.embedding?.values || null;
    } catch (err) {
      console.error('Failed to generate embedding:', err);
      return null;
    }
  }

  public async searchRegistry(query: string, pillar: string = 'ALL', limit: number = 20): Promise<ResearchRecord[]> {
    const filterPillar = pillar === 'ALL' ? null : pillar;

    if (this.supabase) {
      let queryEmbedding: number[] | null = null;
      if (this.ai && query.trim() !== '') {
        queryEmbedding = await this.getQueryEmbedding(query);
      }

      try {
        if (queryEmbedding) {
          const { data, error } = await this.supabase.rpc('hybrid_search_registry', {
            query_embedding: queryEmbedding,
            query_text: query,
            match_limit: limit,
            filter_pillar: filterPillar
          });
          if (!error && data) return data;
        }

        let dbQuery = this.supabase.from('registry').select('*').limit(limit);
        if (filterPillar) {
          dbQuery = dbQuery.eq('pillar', filterPillar);
        }
        const keywords = query.trim().split(/\s+/).filter(Boolean).join(' & ');
        if (keywords) {
          dbQuery = dbQuery.textSearch('fts', keywords, { config: 'english', type: 'plain' });
        } else {
          dbQuery = dbQuery.order('created_at', { ascending: false });
        }
        const { data, error } = await dbQuery;
        if (!error && data) return data;
      } catch (err) {
        console.error('Supabase registry query failed:', err);
      }
    }

    // Static seed fallback
    let list = SEED_RECORDS;
    if (filterPillar) {
      list = list.filter(r => r.pillar === filterPillar);
    }
    if (query.trim()) {
      const keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
      list = list.filter(r => {
        const titleMatch = keywords.every(kw => r.title.toLowerCase().includes(kw));
        const summaryMatch = keywords.every(kw => r.human_summary.toLowerCase().includes(kw));
        const verdictMatch = keywords.every(kw => r.verdict.toLowerCase().includes(kw));
        return titleMatch || summaryMatch || verdictMatch;
      });
    }
    return list.slice(0, limit);
  }

  public async searchAiAct(query: string, category: string = 'ALL', limit: number = 20): Promise<AiActArticle[]> {
    const filterCategory = category === 'ALL' ? null : category;

    if (this.supabase) {
      let queryEmbedding: number[] | null = null;
      if (this.ai && query.trim() !== '') {
        queryEmbedding = await this.getQueryEmbedding(query);
      }

      try {
        if (queryEmbedding) {
          const { data, error } = await this.supabase.rpc('hybrid_search_ai_act', {
            query_embedding: queryEmbedding,
            query_text: query,
            match_limit: limit,
            filter_category: filterCategory
          });
          if (!error && data) return data;
        }

        let dbQuery = this.supabase.from('ai_act').select('*').limit(limit);
        if (filterCategory) {
          dbQuery = dbQuery.eq('pillar', filterCategory);
        }
        const keywords = query.trim().split(/\s+/).filter(Boolean).join(' & ');
        if (keywords) {
          dbQuery = dbQuery.textSearch('fts', keywords, { config: 'english', type: 'plain' });
        } else {
          dbQuery = dbQuery.order('code', { ascending: true });
        }
        const { data, error } = await dbQuery;
        if (!error && data) return data;
      } catch (err) {
        console.error('Supabase AI Act search failed:', err);
      }
    }

    let list = SEED_AI_ACT_RECORDS;
    if (filterCategory) {
      list = list.filter(r => r.category === filterCategory);
    }
    if (query.trim()) {
      const keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
      list = list.filter(r => {
        const titleMatch = keywords.every(kw => r.title.toLowerCase().includes(kw));
        const summaryMatch = keywords.every(kw => (r.article_text || '').toLowerCase().includes(kw));
        const verdictMatch = keywords.every(kw => (r.compliance_verdict || '').toLowerCase().includes(kw));
        return titleMatch || summaryMatch || verdictMatch;
      });
    }
    return list.slice(0, limit);
  }

  public async getRecord(code: string, source: 'corpus' | 'ai_act' | 'both' = 'both') {
    const normCode = code.toUpperCase().trim();

    if (this.supabase) {
      try {
        if (source === 'corpus' || source === 'both') {
          const { data, error } = await this.supabase.from('registry').select('*').eq('code', normCode).maybeSingle();
          if (!error && data) return { ...data, table: 'registry' };
        }
        if (source === 'ai_act' || source === 'both') {
          const { data, error } = await this.supabase.from('ai_act').select('*').eq('code', normCode).maybeSingle();
          if (!error && data) return { ...data, table: 'ai_act' };
        }
      } catch (err) {
        console.error('Supabase getRecord failed:', err);
      }
    }

    if (source === 'corpus' || source === 'both') {
      const found = SEED_RECORDS.find(r => r.code.toUpperCase() === normCode);
      if (found) return { ...found, table: 'registry' };
    }
    if (source === 'ai_act' || source === 'both') {
      const found = SEED_AI_ACT_RECORDS.find(r => r.code.toUpperCase() === normCode);
      if (found) return { ...found, table: 'ai_act' };
    }
    return null;
  }

  public async auditEuCompliance(promptText: string) {
    let queryEmbedding: number[] | null = null;
    if (this.ai) {
      queryEmbedding = await this.getQueryEmbedding(promptText);
    }

    let candidates: any[] = [];
    if (this.supabase) {
      try {
        let vecDocs: any[] = [];
        if (queryEmbedding) {
          const { data } = await this.supabase.rpc('hybrid_search_ai_act', {
            query_embedding: queryEmbedding,
            query_text: '',
            match_limit: 20,
            filter_category: null
          });
          if (data) vecDocs = data;
        }
        let ftsDocs: any[] = [];
        const { data } = await this.supabase.from('ai_act').select('*').textSearch('fts', promptText).limit(15);
        if (data) ftsDocs = data;
        candidates = candidates.concat(vecDocs, ftsDocs);
      } catch (err) {}
    }

    const uniqueMap = new Map<string, any>();
    candidates.forEach(c => {
      if (!uniqueMap.has(c.code)) uniqueMap.set(c.code, c);
    });
    let deduplicated = Array.from(uniqueMap.values());
    if (deduplicated.length === 0) {
      deduplicated = SEED_AI_ACT_RECORDS;
    }

    const ranked = deduplicated.map(c => {
      let heuristicScore = c.combined_score ? Math.round(c.combined_score * 100) : 50;
      if (!c.combined_score) {
        const terms = promptText.toLowerCase().split(/\s+/).filter(Boolean);
        terms.forEach(t => {
          if (c.title.toLowerCase().includes(t) || (c.article_text || '').toLowerCase().includes(t)) {
            heuristicScore += 15;
          }
        });
      }
      return { ...c, reRankScore: Math.min(heuristicScore, 100) };
    }).sort((a, b) => b.reRankScore - a.reRankScore);

    const selectedRecords = ranked.slice(0, 5);
    const totalSelectedScore = selectedRecords.reduce((sum, r) => sum + r.reRankScore, 0);
    const confidenceScore = selectedRecords.length > 0 ? Math.round(totalSelectedScore / selectedRecords.length) : 0;

    const categoryScores: Record<string, number | null> = {
      'PROHIBITED PRACTICE': null,
      'HIGH RISK': null,
      'LIMITED RISK': null,
      'MINIMAL RISK': null
    };
    selectedRecords.forEach(r => {
      const cat = r.category || r.pillar;
      if (cat in categoryScores) {
        const current = categoryScores[cat];
        categoryScores[cat] = current ? Math.max(current, r.reRankScore) : r.reRankScore;
      }
    });

    return `You are the TSOT EU AI Act Compliance Auditor. Audit result context:
${selectedRecords.map(r => `---
[${r.code}] (Category: ${r.category || r.pillar}, Risk Level: ${r.risk_level})
Title: ${r.title}
Article Text/Guideline: ${r.article_text || r.human_summary}
Compliance Verdict: ${r.compliance_verdict || r.verdict}`).join('\n\n')}

PRODUCT DESCRIPTION AUDITED: "${promptText}"
Confidence Score: ${confidenceScore}%`;
  }

  public async optimizeHciDesign(promptText: string) {
    let queryEmbedding: number[] | null = null;
    if (this.ai) {
      queryEmbedding = await this.getQueryEmbedding(promptText);
    }

    let candidates: any[] = [];
    if (this.supabase) {
      try {
        let vecDocs: any[] = [];
        if (queryEmbedding) {
          const { data } = await this.supabase.rpc('hybrid_search_registry', {
            query_embedding: queryEmbedding,
            query_text: '',
            match_limit: 20,
            filter_pillar: null
          });
          if (data) vecDocs = data;
        }
        let ftsDocs: any[] = [];
        const { data } = await this.supabase.from('registry').select('*').textSearch('fts', promptText).limit(15);
        if (data) ftsDocs = data;
        candidates = candidates.concat(vecDocs, ftsDocs);
      } catch (err) {}
    }

    const uniqueMap = new Map<string, any>();
    candidates.forEach(c => {
      if (!uniqueMap.has(c.code)) uniqueMap.set(c.code, c);
    });
    let deduplicated = Array.from(uniqueMap.values());
    if (deduplicated.length === 0) {
      deduplicated = SEED_RECORDS;
    }

    const ranked = deduplicated.map(c => {
      let heuristicScore = c.combined_score ? Math.round(c.combined_score * 100) : 50;
      if (!c.combined_score) {
        const terms = promptText.toLowerCase().split(/\s+/).filter(Boolean);
        terms.forEach(t => {
          if (c.title.toLowerCase().includes(t) || (c.human_summary || '').toLowerCase().includes(t)) {
            heuristicScore += 15;
          }
        });
      }
      return { ...c, reRankScore: Math.min(heuristicScore, 100) };
    }).sort((a, b) => b.reRankScore - a.reRankScore);

    const selectedRecords = ranked.slice(0, 5);
    const totalSelectedScore = selectedRecords.reduce((sum, r) => sum + r.reRankScore, 0);
    const confidenceScore = selectedRecords.length > 0 ? Math.round(totalSelectedScore / selectedRecords.length) : 0;

    return `You are the TSOT HCI Design Optimizer. Retrieved empirical research evidence context:
${selectedRecords.map(r => `---
[${r.code}] (Pillar: ${r.pillar}, Impact: ${r.risk_level})
Title: ${r.title}
Key Finding: ${r.human_summary}
Recommended Verdict: ${r.verdict}`).join('\n\n')}

PRODUCT INTERFACE OPTIMIZED: "${promptText}"
Confidence Score: ${confidenceScore}%`;
  }

  public async queryResearchMoat(queryText: string) {
    const regResults = await this.searchRegistry(queryText, 'ALL', 3);
    const actResults = await this.searchAiAct(queryText, 'ALL', 3);

    return `TSOT Research & Compliance Resolution context:
HCI Research Findings:
${regResults.map(r => `[${r.code}] ${r.title}: ${r.human_summary}`).join('\n')}

EU AI Act Articles:
${actResults.map(a => `[${a.code}] ${a.title}: ${a.compliance_verdict}`).join('\n')}

USER QUERY: "${queryText}"`;
  }
}
