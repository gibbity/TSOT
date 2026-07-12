import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import localAiActData from '@/lib/supabase/ai_act_data.json';

// Seed records for offline fallback
const SEED_RECORDS = [
  {
    id: 1,
    code: 'SOT-COMP-2026',
    pillar: 'COGNITIVE OFFLOADING',
    title: 'AI self-verification drops to 59% accuracy under single-track monologues.',
    human_summary: 'When users rely on continuous, unstructured conversational agents without forcing step-by-step verification, their own cognitive tracking degrades. Longitudinal experiments track an erosion of prompt scrutiny and an immediate jump in reliance on hallucinated data outputs.',
    metric: '59% self-verification rate',
    verdict: 'Implement a mandatory structural checkpoint after 3 consecutive conversational steps to reset the cognitive verification baseline.',
    risk_level: 'critical',
    source_url: 'https://openalex.org',
    source_type: 'peer-reviewed',
    paper_year: 2026,
    authors: 'Monopoli, V., & Lora, A.',
    is_premium: false,
    created_at: '2026-05-19T00:00:00.000Z',
  },
  {
    id: 2,
    code: 'SOT-COMP-2027',
    pillar: 'FRICTION & VERIFICATION',
    title: "AI's emotional response simulation in group settings alters user prospective planning by 47%.",
    human_summary: 'Inserting conversational anthropomorphism in collaborative planning environments causes human partners to defer strategic decisions. The study tracks how simulated emotional validation bypasses critical skepticism systems, leading to high-friction adoption blockages.',
    metric: '47% prospective planning variance',
    verdict: 'Remove subjective validation verbs from task-oriented multi-agent interfaces. Enforce neutral, metrics-based statements.',
    risk_level: 'warning',
    source_url: 'https://openalex.org',
    source_type: 'preprint',
    paper_year: 2026,
    authors: 'Gartner, E., et al.',
    is_premium: false,
    created_at: '2026-05-19T00:00:00.000Z',
  },
  {
    id: 3,
    code: 'SOT-COMP-2028',
    pillar: 'EPISTEMIC AGENCY',
    title: 'AI language models exhibit a 75% reduction in search query depth with hyper-personalized feeds.',
    human_summary: 'Hyper-personalized search engines create prompt complacency. In studies where LLMs filtered answers based on perceived user sentiment profiles, individuals immediately stopped exploring divergent viewpoints, reducing their vocabulary variance and source cross-validation.',
    metric: '75% search query depth reduction',
    verdict: 'Maintain a static, unpersonalized sidebar of raw sources to preserve lateral discovery paths.',
    risk_level: 'stable',
    source_url: 'https://openalex.org',
    source_type: 'conference',
    paper_year: 2025,
    authors: 'Chen, H., & Muller, S.',
    is_premium: false,
    created_at: '2026-05-19T00:00:00.000Z',
  },
  {
    id: 4,
    code: 'SOT-COMP-3011',
    pillar: 'TEMPORAL PERCEPTION',
    title: 'Response latencies under 200ms trigger anthropomorphic projection in 82% of users.',
    human_summary: 'Sub-200ms streaming responses confuse human turn-taking thresholds. Participants who experienced instantaneous feedback consistently personified the machine, projecting intent, agency, and empathy onto system statements. Increasing latency to 600ms recalibrated trust to object-level baselines.',
    metric: '82% anthropomorphic projection',
    verdict: 'Introduce artificial delays of at least 400ms for conversational flows to maintain tool-like mental models.',
    risk_level: 'critical',
    source_url: 'https://openalex.org',
    source_type: 'peer-reviewed',
    paper_year: 2026,
    authors: 'Watanabe, Y., & Schmidt, M.',
    is_premium: false,
    created_at: '2026-05-19T00:00:00.000Z',
  },
  {
    id: 5,
    code: 'SOT-COMP-3012',
    pillar: 'FRICTION & VERIFICATION',
    title: 'Forced visual friction in output screens increases source cross-validation by 63%.',
    human_summary: 'Adding systematic friction—such as loading state outlines or requiring manual highlight actions before copying output—forces user cognitive wakefulness. Eye-tracking experiments confirm that design interventions reduce automation bias and improve human error detection rates.',
    metric: '63% increase in source cross-validation',
    verdict: 'Design key interface checkpoints that require active, physical confirmation clicks before high-leverage data execution.',
    risk_level: 'stable',
    source_url: 'https://openalex.org',
    source_type: 'peer-reviewed',
    paper_year: 2026,
    authors: 'Boudreau, T., et al.',
    is_premium: false,
    created_at: '2026-05-19T00:00:00.000Z',
  },
  {
    id: 6,
    code: 'SOT-COMP-3013',
    pillar: 'COGNITIVE OFFLOADING',
    title: 'Delegating semantic summaries to agentic assistants erodes memory retention by 31%.',
    human_summary: 'Relying on automatic document summary engines significantly reduces long-term logical structure recall. Longitudinal cognitive trials demonstrate that while reading speeds increase, active comprehension, critical memory retrieval, and synthesization skills deteriorate.',
    metric: '31% memory retention drop',
    verdict: 'Enforce high-friction semantic checkpoints that prompt the user to synthesize key findings in their own words.',
    risk_level: 'critical',
    source_url: 'https://openalex.org',
    source_type: 'preprint',
    paper_year: 2026,
    authors: 'Vargas, L., & Kim, J.',
    is_premium: false,
    created_at: '2026-05-19T00:00:00.000Z',
  }
];

const SEED_AI_ACT_RECORDS = (localAiActData as any[]).map((art, idx) => ({
  id: 10000 + idx,
  code: art.code,
  pillar: art.category,
  title: art.title,
  human_summary: art.article_text,
  metric: 'Compliance Checklist',
  verdict: art.compliance_verdict,
  risk_level: art.risk_level,
  source_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689',
  source_type: 'regulation',
  paper_year: 2024,
  authors: 'European Parliament & Council',
  is_premium: false,
  created_at: new Date().toISOString()
}));

// Initialize clients dynamically per request context to stay stateless and serverless safe
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const geminiApiKey = process.env.GEMINI_API_KEY || '';

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const ai = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

// ----------------------------------------------------
// Helper Functions
// ----------------------------------------------------

async function getQueryEmbedding(text: string): Promise<number[] | null> {
  if (!ai) return null;
  try {
    const embModel = ai.getGenerativeModel({ model: 'gemini-embedding-2' });
    const result = await embModel.embedContent({
      content: { role: 'user', parts: [{ text }] },
      outputDimensionality: 768
    } as any);
    return result.embedding?.values || null;
  } catch (err) {
    console.error('Failed to generate embedding for query:', err);
    return null;
  }
}

async function searchRegistry(query: string, pillar: string = 'ALL', limit: number = 20) {
  const filterPillar = pillar === 'ALL' ? null : pillar;

  if (supabase) {
    let queryEmbedding: number[] | null = null;
    if (ai && query.trim() !== '') {
      queryEmbedding = await getQueryEmbedding(query);
    }

    try {
      if (queryEmbedding) {
        const { data, error } = await supabase.rpc('hybrid_search_registry', {
          query_embedding: queryEmbedding,
          query_text: query,
          match_limit: limit,
          filter_pillar: filterPillar
        });
        if (!error && data) return data;
      }

      // Fallback keyword search
      let dbQuery = supabase.from('registry').select('*').limit(limit);
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
      console.error('Supabase query failed for registry:', err);
    }
  }

  // Local static fallback
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

async function searchAiAct(query: string, category: string = 'ALL', limit: number = 20) {
  const filterCategory = category === 'ALL' ? null : category;

  if (supabase) {
    let queryEmbedding: number[] | null = null;
    if (ai && query.trim() !== '') {
      queryEmbedding = await getQueryEmbedding(query);
    }

    try {
      if (queryEmbedding) {
        const { data, error } = await supabase.rpc('hybrid_search_ai_act', {
          query_embedding: queryEmbedding,
          query_text: query,
          match_limit: limit,
          filter_category: filterCategory
        });
        if (!error && data) return data;
      }

      // Fallback keyword search
      let dbQuery = supabase.from('ai_act').select('*').limit(limit);
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
      console.error('Supabase query failed for AI Act:', err);
    }
  }

  // Local static fallback
  let list = SEED_AI_ACT_RECORDS;
  if (filterCategory) {
    list = list.filter(r => r.pillar === filterCategory);
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

async function getRecord(code: string, source: 'corpus' | 'ai_act' | 'both' = 'both') {
  const normCode = code.toUpperCase().trim();

  if (supabase) {
    try {
      if (source === 'corpus' || source === 'both') {
        const { data, error } = await supabase.from('registry').select('*').eq('code', normCode).maybeSingle();
        if (!error && data) return { ...data, table: 'registry' };
      }
      if (source === 'ai_act' || source === 'both') {
        const { data, error } = await supabase.from('ai_act').select('*').eq('code', normCode).maybeSingle();
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

async function auditEuCompliance(promptText: string) {
  let queryEmbedding: number[] | null = null;
  try {
    if (ai) {
      queryEmbedding = await getQueryEmbedding(promptText);
    }
  } catch (err) {
    console.error('Failed to generate embedding for compliance auditor:', err);
  }

  let candidates: any[] = [];
  if (supabase) {
    try {
      let vecDocs: any[] = [];
      if (queryEmbedding) {
        const { data } = await supabase.rpc('hybrid_search_ai_act', {
          query_embedding: queryEmbedding,
          query_text: '',
          match_limit: 20,
          filter_category: null
        });
        if (data) vecDocs = data;
      }
      let ftsDocs: any[] = [];
      const { data } = await supabase.from('ai_act').select('*').textSearch('fts', promptText).limit(15);
      if (data) ftsDocs = data;
      candidates = candidates.concat(vecDocs, ftsDocs);
    } catch (err) {
      console.error('Database query failed during EU compliance search:', err);
    }
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
        if (c.title.toLowerCase().includes(t) || c.human_summary.toLowerCase().includes(t)) {
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
    if (r.pillar in categoryScores) {
      const current = categoryScores[r.pillar];
      categoryScores[r.pillar] = current ? Math.max(current, r.reRankScore) : r.reRankScore;
    }
  });

  if (supabase) {
    try {
      supabase.from('audit_logs').insert({
        query: promptText,
        retrieved_records: selectedRecords.map(r => r.code),
        confidence_score: confidenceScore,
        verdict: 'EU_COMPLIANCE_CLIENT_DELEGATED'
      }).then(({ error }) => {
        if (error) console.error('Failed to log compliance audit:', error);
      });
    } catch (e) {}
  }

  return `You are the TSOT EU AI Act Compliance Auditor. A user wants you to check if their app complies with the EU AI Act regulations.

We have retrieved the top 5 relevant regulatory records/articles from the database as context:

${selectedRecords.map(r => `---
[${r.code}] (Category: ${r.pillar}, Risk Level: ${r.risk_level})
Title: ${r.title}
Article Text/Guideline: ${r.human_summary}
Compliance Verdict: ${r.verdict}`).join('\n\n')}

---
PRODUCT DESCRIPTION TO AUDIT:
"${promptText}"

---
NON-NEGOTIABLE AUDITING RULES:
1. Every compliance finding must have at least one inline [#EU-ACT-ART-X] (or relevant code) citation. No citation = no claim.
2. The verdict header (pass / concern / critical) must appear within the first 3 tokens of the verdict block.
3. If fewer than 2 relevant records are retrieved in the context (we retrieved ${selectedRecords.length}), decline to make specific claims (e.g. "TSOT does not have sufficient records in the EU AI Act database to make a definitive compliance claim..."). You must NOT output any citations. Keep findings general.
4. Confidence language must match retrieval confidence (which is estimated at ${confidenceScore}%).
   - Above 80% confidence: "regulations mandate", "articles confirm".
   - 60–80% confidence: "requirements suggest", "guidance indicates".
   - Below 60% confidence: "preliminary articles point to".
5. Sprint actions must be specific and implementable (e.g., "Implement age verification checkpoint before allowing cognitive interaction").
6. NEVER use markdown bold/italic formatting (no **, no *). Write plain prose only.

---
OUTPUT SCHEMA (MUST RESPOND IN THE EXACT FORMAT USING THE XML TAGS):
<scores>
{"PROHIBITED PRACTICE": ${categoryScores['PROHIBITED PRACTICE']}, "HIGH RISK": ${categoryScores['HIGH RISK']}, "LIMITED RISK": ${categoryScores['LIMITED RISK']}, "MINIMAL RISK": ${categoryScores['MINIMAL RISK']}}
</scores>

<verdict>
⬤ [CRITICAL RISK / CONCERN / PASS] — [A one-sentence compliance verdict. Mention it is based on ${selectedRecords.length} records with ${confidenceScore}% confidence].
</verdict>

<findings>
[Present 2-4 detailed compliance findings. Each finding must describe:
 - The regulatory compliance risk or gap in the app.
 - The EU AI Act article requirement, backed by an inline citation like [#Art-X] or [#EU-ACT-ART-X].
 - A specific "Design constraint" summarizing the remedy.]
</findings>

<gap>
[Include a regulatory gap notice if the articles are only partially applicable to their specific platform context, explaining the limitation. If no gaps exist, leave empty.]
</gap>

<sprint>
What to ship in the next sprint to follow regulations:
SPRINT GOAL — [one sentence goal]
TICKET SCOPE — [specific component, API endpoint, or file the change lives in]
ACCEPTANCE CRITERION — [testable condition for done: "App must restrict X and show Y instead"]
RESEARCH BACKING — [article code]
</sprint>

Run the compliance audit now, and output the response wrapped in the XML tags above. Do not output any preamble or conversational text outside the tags.`;
}

async function optimizeHciDesign(promptText: string) {
  let queryEmbedding: number[] | null = null;
  try {
    if (ai) {
      queryEmbedding = await getQueryEmbedding(promptText);
    }
  } catch (err) {
    console.error('Failed to generate embedding for HCI optimization:', err);
  }

  let candidates: any[] = [];
  if (supabase) {
    try {
      let vecDocs: any[] = [];
      if (queryEmbedding) {
        const { data } = await supabase.rpc('hybrid_search_registry', {
          query_embedding: queryEmbedding,
          query_text: '',
          match_limit: 20,
          filter_pillar: null
        });
        if (data) vecDocs = data;
      }
      let ftsDocs: any[] = [];
      const { data } = await supabase.from('registry').select('*').textSearch('fts', promptText).limit(15);
      if (data) ftsDocs = data;
      candidates = candidates.concat(vecDocs, ftsDocs);
    } catch (err) {
      console.error('Database query failed during HCI search:', err);
    }
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
        if (c.title.toLowerCase().includes(t) || c.human_summary.toLowerCase().includes(t)) {
          heuristicScore += 15;
        }
      });
    }
    return { ...c, reRankScore: Math.min(heuristicScore, 100) };
  }).sort((a, b) => b.reRankScore - a.reRankScore);

  const selectedRecords = ranked.slice(0, 5);
  const totalSelectedScore = selectedRecords.reduce((sum, r) => sum + r.reRankScore, 0);
  const confidenceScore = selectedRecords.length > 0 ? Math.round(totalSelectedScore / selectedRecords.length) : 0;

  const pillarScores: Record<string, number | null> = {
    'COGNITIVE OFFLOADING': null,
    'FRICTION & VERIFICATION': null,
    'TEMPORAL PERCEPTION': null,
    'EPISTEMIC AGENCY': null
  };
  selectedRecords.forEach(r => {
    if (r.pillar in pillarScores) {
      const current = pillarScores[r.pillar];
      pillarScores[r.pillar] = current ? Math.max(current, r.reRankScore) : r.reRankScore;
    }
  });

  if (supabase) {
    try {
      supabase.from('audit_logs').insert({
        query: promptText,
        retrieved_records: selectedRecords.map(r => r.code),
        confidence_score: confidenceScore,
        verdict: 'HCI_OPTIMIZATION_CLIENT_DELEGATED'
      }).then(({ error }) => {
        if (error) console.error('Failed to log HCI optimization:', error);
      });
    } catch (e) {}
  }

  return `You are the TSOT HCI (Human-Computer Interaction) Design Optimizer. A user wants to optimize their app design using findings from the TSOT Research Ledger.

We have retrieved the top 5 relevant empirical research papers from the ledger as context:

${selectedRecords.map(r => `---
[${r.code}] (Pillar: ${r.pillar}, Impact: ${r.risk_level})
Title: ${r.title}
Key Finding: ${r.human_summary}
Recommended Remedy/Verdict: ${r.verdict}`).join('\n\n')}

---
APP DESCRIPTION TO OPTIMIZE:
"${promptText}"

---
NON-NEGOTIABLE DESIGN OPTIMIZATION RULES:
1. Every optimization recommendation must be backed by an inline citation to a specific retrieved paper like [#SOT-COMP-2026] or [#SOT-0HUZ3A]. No citation = no claim.
2. The verdict header (pass / concern / critical) must appear within the first 3 tokens of the verdict block.
3. If fewer than 2 relevant records are retrieved in the context (we retrieved ${selectedRecords.length}), decline to make specific claims.
4. Confidence language must match retrieval confidence (which is estimated at ${confidenceScore}%).
   - Above 80% confidence: "research shows", "studies confirm".
   - 60–80% confidence: "research suggests", "evidence indicates".
   - Below 60% confidence: "limited research suggests".
5. Sprint actions must be specific and implementable (e.g. "Introduce an artificial 400ms delay to prevent anthropomorphic turn-taking confusion").
6. NEVER use markdown bold/italic formatting (no **, no *). Write plain prose only.

---
OUTPUT SCHEMA (MUST RESPOND IN THE EXACT FORMAT USING THE XML TAGS):
<scores>
{"COGNITIVE OFFLOADING": ${pillarScores['COGNITIVE OFFLOADING']}, "FRICTION & VERIFICATION": ${pillarScores['FRICTION & VERIFICATION']}, "TEMPORAL PERCEPTION": ${pillarScores['TEMPORAL PERCEPTION']}, "EPISTEMIC AGENCY": ${pillarScores['EPISTEMIC AGENCY']}}
</scores>

<verdict>
⬤ [CRITICAL RISK / CONCERN / STABLE] — [A one-sentence overall audit verdict. Mention it is based on ${selectedRecords.length} records with ${confidenceScore}% confidence].
</verdict>

<findings>
[Present 2-4 detailed design findings. Each finding must describe:
 - The cognitive risk or UX issue in the app.
 - The empirical research evidence, backed by an inline citation like [#SOT-COMP-2026].
 - A specific "Design constraint" summarizing the remedy.]
</findings>

<gap>
[Include a corpus gap notice if the research is only partially applicable to their specific platform context, explaining the limitation. If no gaps exist, leave empty.]
</gap>

<sprint>
What to ship in the next sprint to optimize the UX:
SPRINT GOAL — [one sentence goal]
TICKET SCOPE — [specific component, API endpoint, or file the change lives in]
ACCEPTANCE CRITERION — [testable condition for done: "Response stream starts after 400ms delay"]
RESEARCH BACKING — [citation code]
</sprint>

Run the HCI design optimization now, and output the response wrapped in the XML tags above. Do not output any preamble or conversational text outside the tags.`;
}

async function queryResearchMoat(queryText: string) {
  let queryEmbedding: number[] | null = null;
  try {
    if (ai) {
      queryEmbedding = await getQueryEmbedding(queryText);
    }
  } catch (err) {
    console.error('Failed to generate embedding for query:', err);
  }

  let candidates: any[] = [];
  if (supabase) {
    try {
      let vecDocs: any[] = [];
      if (queryEmbedding) {
        const { data: regData } = await supabase.rpc('hybrid_search_registry', {
          query_embedding: queryEmbedding,
          query_text: '',
          match_limit: 10,
          filter_pillar: null
        });
        const { data: actData } = await supabase.rpc('hybrid_search_ai_act', {
          query_embedding: queryEmbedding,
          query_text: '',
          match_limit: 10,
          filter_category: null
        });
        if (regData) vecDocs = vecDocs.concat(regData);
        if (actData) vecDocs = vecDocs.concat(actData);
      }
      let ftsRegDocs: any[] = [];
      const { data: regFts } = await supabase.from('registry').select('*').textSearch('fts', queryText).limit(10);
      if (regFts) ftsRegDocs = regFts;
      let ftsActDocs: any[] = [];
      const { data: actFts } = await supabase.from('ai_act').select('*').textSearch('fts', queryText).limit(10);
      if (actFts) ftsActDocs = actFts;
      candidates = candidates.concat(vecDocs, ftsRegDocs, ftsActDocs);
    } catch (err) {
      console.error('Database query failed during research moat search:', err);
    }
  }

  const uniqueMap = new Map<string, any>();
  candidates.forEach(c => {
    if (!uniqueMap.has(c.code)) uniqueMap.set(c.code, c);
  });
  let deduplicated = Array.from(uniqueMap.values());
  if (deduplicated.length === 0) {
    deduplicated = [...SEED_RECORDS, ...SEED_AI_ACT_RECORDS];
  }

  const ranked = deduplicated.map(c => {
    let heuristicScore = c.combined_score ? Math.round(c.combined_score * 100) : 50;
    if (!c.combined_score) {
      const terms = queryText.toLowerCase().split(/\s+/).filter(Boolean);
      terms.forEach(t => {
        if (c.title.toLowerCase().includes(t) || c.human_summary.toLowerCase().includes(t)) {
          heuristicScore += 15;
        }
      });
    }
    return { ...c, reRankScore: Math.min(heuristicScore, 100) };
  }).sort((a, b) => b.reRankScore - a.reRankScore);

  const selectedRecords = ranked.slice(0, 5);

  if (supabase) {
    try {
      supabase.from('audit_logs').insert({
        query: queryText,
        retrieved_records: selectedRecords.map(r => r.code),
        confidence_score: 100,
        verdict: 'MOAT_QUERY_CLIENT_DELEGATED'
      }).then(({ error }) => {
        if (error) console.error('Failed to log research moat query:', error);
      });
    } catch (e) {}
  }

  return `You are the TSOT Research Moat Dilemma Solver. A user has asked you a question or presented a design dilemma regarding HCI research or AI compliance.

We have retrieved the top 5 relevant research or regulatory articles from our database to serve as your empirical backing:

${selectedRecords.map(r => `---
[${r.code}] (Title: ${r.title})
Key Finding/Text: ${r.human_summary}
Recommended Action: ${r.verdict}`).join('\n\n')}

---
USER DILEMMA / QUESTION:
"${queryText}"

---
RULES FOR RESOLUTION:
1. Provide a direct, authoritative answer to the user's question.
2. Explain the trade-offs and recommended actions clearly.
3. Support your arguments with inline citations (e.g. [#SOT-COMP-2026] or [#EU-ACT-ART-5]) based ONLY on the retrieved records. Do not invent any records or citations.
4. NEVER use markdown bold/italic formatting (no **, no *). Write plain prose only.

---
OUTPUT SCHEMA (MUST RESPOND IN THE EXACT FORMAT USING THE XML TAGS):
<answer>
[Write the detailed answer explaining the Dilemma Resolution, trade-offs, and best possible actions in plain prose. Be extremely specific and cite supporting records inline.]
</answer>

<citations>
[Provide a simple bulleted list of citations for the referenced records, containing:
 - [Citation Code] Title]
</citations>

Run the query resolution now, and output the response wrapped in the XML tags above. Do not output any preamble or conversational text outside the tags.`;
}

// ----------------------------------------------------
// Next.js Route Handler Listener
// ----------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { method, params, id } = body;

    // Handle initial client handshake
    if (method === 'initialize') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            resources: {},
            tools: {},
            prompts: {}
          },
          serverInfo: {
            name: 'tsot-mcp-server',
            version: '1.0.0'
          }
        }
      });
    }

    // Handle protocol notifications (like 'initialized') that do not expect a response
    if (body.method && !body.id) {
      console.log(`📥 Received notification: ${method}`);
      return new Response(null, { status: 204 });
    }

    // 1. Handle Tools Listing
    if (method === 'tools/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          tools: [
            {
              name: 'audit_eu_compliance',
              description: 'Check if a product design or feature description complies with the EU AI Act regulations. Returns specific article alignments, risk classifications, and compliance verdicts.',
              inputSchema: {
                type: 'object',
                properties: {
                  prompt: {
                    type: 'string',
                    description: 'A detailed description of the AI product features, risk areas, or data collection practices to check against regulations.'
                  }
                },
                required: ['prompt']
              }
            },
            {
              name: 'optimize_hci_design',
              description: 'Analyze an AI product interface design and see how it can be optimized using the TSOT Empirical HCI Research Ledger (Cognitive Offloading, Latencies, Friction, Epistemic Agency, etc.).',
              inputSchema: {
                type: 'object',
                properties: {
                  prompt: {
                    type: 'string',
                    description: 'A detailed description of the user interface flow, response latency, conversational turns, or automation features to optimize.'
                  }
                },
                required: ['prompt']
              }
            },
            {
              name: 'query_research_moat',
              description: 'Answer user queries or solve design dilemmas using findings from the TSOT HCI Research Ledger and EU AI Act compliance articles. Tells the user the best possible action and trade-offs.',
              inputSchema: {
                type: 'object',
                properties: {
                  query: {
                    type: 'string',
                    description: 'The user question, design dilemma, or compliance query.'
                  }
                },
                required: ['query']
              }
            },
            {
              name: 'search_registry',
              description: 'Search the TSOT HCI Research Ledger (human-AI interaction guidelines, automation bias, cognitive offloading, response latencies, etc.) using hybrid semantic search and keyword fallback.',
              inputSchema: {
                type: 'object',
                properties: {
                  query: {
                    type: 'string',
                    description: 'The search text or keyword query.'
                  },
                  pillar: {
                    type: 'string',
                    enum: ['COGNITIVE OFFLOADING', 'FRICTION & VERIFICATION', 'TEMPORAL PERCEPTION', 'EPISTEMIC AGENCY', 'ALL'],
                    description: 'Filter results by a specific TSOT research pillar.'
                  },
                  limit: {
                    type: 'number',
                    description: 'Maximum number of records to return (default is 20).'
                  }
                },
                required: ['query']
              }
            },
            {
              name: 'search_ai_act',
              description: 'Search the EU AI Act compliance articles and regulations using hybrid semantic search and keyword fallback.',
              inputSchema: {
                type: 'object',
                properties: {
                  query: {
                    type: 'string',
                    description: 'The search text or keyword query.'
                  },
                  category: {
                    type: 'string',
                    enum: ['PROHIBITED PRACTICE', 'HIGH RISK', 'LIMITED RISK', 'MINIMAL RISK', 'ALL'],
                    description: 'Filter results by EU AI Act risk category/pillar.'
                  },
                  limit: {
                    type: 'number',
                    description: 'Maximum number of articles to return (default is 20).'
                  }
                },
                required: ['query']
              }
            },
            {
              name: 'get_record',
              description: 'Fetch detailed content of a single research ledger paper or EU AI Act article by its unique code (e.g. SOT-COMP-2026 or Art 5).',
              inputSchema: {
                type: 'object',
                properties: {
                  code: {
                    type: 'string',
                    description: 'The code of the record to fetch.'
                  },
                  source: {
                    type: 'string',
                    enum: ['corpus', 'ai_act', 'both'],
                    description: 'Database table source to query (default is "both").'
                  }
                },
                required: ['code']
              }
            }
          ]
        }
      });
    }

    // 2. Handle Tool Executions
    if (method === 'tools/call') {
      const { name, arguments: args } = params;
      let textOutput = '';

      if (name === 'audit_eu_compliance') {
        const prompt = String(args?.prompt || '');
        textOutput = await auditEuCompliance(prompt);
      } else if (name === 'optimize_hci_design') {
        const prompt = String(args?.prompt || '');
        textOutput = await optimizeHciDesign(prompt);
      } else if (name === 'query_research_moat') {
        const query = String(args?.query || '');
        textOutput = await queryResearchMoat(query);
      } else if (name === 'search_registry') {
        const query = String(args?.query || '');
        const pillar = String(args?.pillar || 'ALL');
        const limit = Number(args?.limit || 20);
        const results = await searchRegistry(query, pillar, limit);
        textOutput = JSON.stringify(results, null, 2);
      } else if (name === 'search_ai_act') {
        const query = String(args?.query || '');
        const category = String(args?.category || 'ALL');
        const limit = Number(args?.limit || 20);
        const results = await searchAiAct(query, category, limit);
        textOutput = JSON.stringify(results, null, 2);
      } else if (name === 'get_record') {
        const code = String(args?.code || '');
        const src = (args?.source || 'both') as 'corpus' | 'ai_act' | 'both';
        const record = await getRecord(code, src);
        if (!record) {
          return NextResponse.json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [{ type: 'text', text: `No record found with code "${code}"` }],
              isError: true
            }
          });
        }
        textOutput = JSON.stringify(record, null, 2);
      } else {
        throw new Error(`Tool "${name}" not found`);
      }

      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: textOutput
            }
          ]
        }
      });
    }

    // 3. Handle Resources Listing
    if (method === 'resources/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          resources: [
            {
              uri: 'tsot://registry/summary',
              name: 'TSOT Registry Summary Stats',
              description: 'Metadata, stats, and counts of active research guidelines and papers in the TSOT Ledger.',
              mimeType: 'application/json'
            },
            {
              uri: 'tsot://ai_act/summary',
              name: 'EU AI Act Summary Stats',
              description: 'Metadata, stats, and counts of AI Act regulation articles in the database.',
              mimeType: 'application/json'
            }
          ]
        }
      });
    }

    // 4. Handle Resource Reading
    if (method === 'resources/read') {
      const { uri } = params;
      let textContent = '';

      if (uri === 'tsot://registry/summary') {
        let count = 0;
        if (supabase) {
          const { count: dbCount } = await supabase.from('registry').select('id', { count: 'exact', head: true });
          count = dbCount || 0;
        } else {
          count = SEED_RECORDS.length;
        }
        textContent = JSON.stringify({
          ledger: 'HCI Adversarial Design Research Ledger',
          records_count: count,
          pillars: ['COGNITIVE OFFLOADING', 'FRICTION & VERIFICATION', 'TEMPORAL PERCEPTION', 'EPISTEMIC AGENCY']
        }, null, 2);
      } else if (uri === 'tsot://ai_act/summary') {
        let count = 0;
        if (supabase) {
          const { count: dbCount } = await supabase.from('ai_act').select('id', { count: 'exact', head: true });
          count = dbCount || 0;
        } else {
          count = SEED_AI_ACT_RECORDS.length;
        }
        textContent = JSON.stringify({
          ledger: 'EU AI Act Regulation Ledger',
          articles_count: count,
          risk_categories: ['PROHIBITED PRACTICE', 'HIGH RISK', 'LIMITED RISK', 'MINIMAL RISK']
        }, null, 2);
      } else if (String(uri).startsWith('tsot://registry/record/')) {
        const code = String(uri).replace('tsot://registry/record/', '');
        const record = await getRecord(code, 'corpus');
        if (!record) throw new Error(`Record with code "${code}" not found`);
        textContent = JSON.stringify(record, null, 2);
      } else if (String(uri).startsWith('tsot://ai_act/article/')) {
        const code = String(uri).replace('tsot://ai_act/article/', '');
        const record = await getRecord(code, 'ai_act');
        if (!record) throw new Error(`AI Act article with code "${code}" not found`);
        textContent = JSON.stringify(record, null, 2);
      } else {
        throw new Error(`Unsupported resource URI: ${uri}`);
      }

      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: textContent
            }
          ]
        }
      });
    }

    // 5. Handle Prompts Listing
    if (method === 'prompts/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          prompts: [
            {
              name: 'adversarial_audit',
              description: 'Generate an adversarial human-AI interaction audit for a product design description.',
              arguments: [
                {
                  name: 'product_description',
                  description: 'A detailed description of the AI product or features (conversational turns, response latency, anthropomorphism details).',
                  required: true
                },
                {
                  name: 'source',
                  description: 'Context ledger source to query (corpus, ai_act, or both; default is both).',
                  required: false
                }
              ]
            }
          ]
        }
      });
    }

    // 6. Handle Prompt Retrieval
    if (method === 'prompts/get') {
      const { name, arguments: args } = params;

      if (name === 'adversarial_audit') {
        const productDescription = args?.product_description || '';
        const src = args?.source || 'both';

        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            description: 'Audit a product design against the TSOT research registry and EU AI Act compliance database.',
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Please run a TSOT Adversarial Audit using the audit_product tool.\nProduct Description:\n${productDescription}\n\nSource ledger context: ${src}`
                }
              }
            ]
          }
        });
      }
      throw new Error(`Unsupported prompt name: "${name}"`);
    }

    // Unsupported RPC method
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      error: {
        code: -32601,
        message: `Method not found: ${method}`
      }
    });

  } catch (err: any) {
    console.error('Stateless MCP Handler encountered an error:', err);
    return NextResponse.json({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: err.message || 'Internal server error'
      }
    }, { status: 500 });
  }
}
