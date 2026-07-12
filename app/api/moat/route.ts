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

// Initialize database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Helper to get embedding
async function getQueryEmbedding(text: string, aiInstance: GoogleGenerativeAI | null): Promise<number[] | null> {
  if (!aiInstance) return null;
  try {
    const embModel = aiInstance.getGenerativeModel({ model: 'gemini-embedding-2' });
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

// ----------------------------------------------------
// Public Route Handler
// ----------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const { tool, prompt, byok_key } = await request.json();

    if (!tool) {
      return NextResponse.json({ error: 'Missing parameter: "tool" is required.' }, { status: 400 });
    }
    if (!prompt) {
      return NextResponse.json({ error: 'Missing parameter: "prompt" (or "query") is required.' }, { status: 400 });
    }

    const activeApiKey = byok_key || process.env.GEMINI_API_KEY || '';
    const aiInstance = activeApiKey ? new GoogleGenerativeAI(activeApiKey) : null;

    let promptForClient = '';
    let selectedRecords: any[] = [];
    let confidenceScore = 0;

    if (tool === 'audit_eu_compliance') {
      let queryEmbedding: number[] | null = null;
      if (aiInstance) {
        queryEmbedding = await getQueryEmbedding(prompt, aiInstance);
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
          const { data } = await supabase.from('ai_act').select('*').textSearch('fts', prompt).limit(15);
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
          const terms = prompt.toLowerCase().split(/\s+/).filter(Boolean);
          terms.forEach((t: string) => {
            if (c.title.toLowerCase().includes(t) || c.human_summary.toLowerCase().includes(t)) {
              heuristicScore += 15;
            }
          });
        }
        return { ...c, reRankScore: Math.min(heuristicScore, 100) };
      }).sort((a, b) => b.reRankScore - a.reRankScore);

      selectedRecords = ranked.slice(0, 5);
      const totalSelectedScore = selectedRecords.reduce((sum, r) => sum + r.reRankScore, 0);
      confidenceScore = selectedRecords.length > 0 ? Math.round(totalSelectedScore / selectedRecords.length) : 0;

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

      promptForClient = `You are the TSOT EU AI Act Compliance Auditor. A user wants you to check if their app complies with the EU AI Act regulations.

We have retrieved the top 5 relevant regulatory records/articles from the database as context:

${selectedRecords.map(r => `---
[${r.code}] (Category: ${r.pillar}, Risk Level: ${r.risk_level})
Title: ${r.title}
Article Text/Guideline: ${r.human_summary}
Compliance Verdict: ${r.verdict}`).join('\n\n')}

---
PRODUCT DESCRIPTION TO AUDIT:
"${prompt}"

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
    else if (tool === 'optimize_hci_design') {
      let queryEmbedding: number[] | null = null;
      if (aiInstance) {
        queryEmbedding = await getQueryEmbedding(prompt, aiInstance);
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
          const { data } = await supabase.from('registry').select('*').textSearch('fts', prompt).limit(15);
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
          const terms = prompt.toLowerCase().split(/\s+/).filter(Boolean);
          terms.forEach((t: string) => {
            if (c.title.toLowerCase().includes(t) || c.human_summary.toLowerCase().includes(t)) {
              heuristicScore += 15;
            }
          });
        }
        return { ...c, reRankScore: Math.min(heuristicScore, 100) };
      }).sort((a, b) => b.reRankScore - a.reRankScore);

      selectedRecords = ranked.slice(0, 5);
      const totalSelectedScore = selectedRecords.reduce((sum, r) => sum + r.reRankScore, 0);
      confidenceScore = selectedRecords.length > 0 ? Math.round(totalSelectedScore / selectedRecords.length) : 0;

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

      promptForClient = `You are the TSOT HCI (Human-Computer Interaction) Design Optimizer. A user wants to optimize their app design using findings from the TSOT Research Ledger.

We have retrieved the top 5 relevant empirical research papers from the ledger as context:

${selectedRecords.map(r => `---
[${r.code}] (Pillar: ${r.pillar}, Impact: ${r.risk_level})
Title: ${r.title}
Key Finding: ${r.human_summary}
Recommended Remedy/Verdict: ${r.verdict}`).join('\n\n')}

---
APP DESCRIPTION TO OPTIMIZE:
"${prompt}"

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
    else if (tool === 'query_research_moat') {
      let queryEmbedding: number[] | null = null;
      if (aiInstance) {
        queryEmbedding = await getQueryEmbedding(prompt, aiInstance);
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
          const { data: regFts } = await supabase.from('registry').select('*').textSearch('fts', prompt).limit(10);
          if (regFts) ftsRegDocs = regFts;
          let ftsActDocs: any[] = [];
          const { data: actFts } = await supabase.from('ai_act').select('*').textSearch('fts', prompt).limit(10);
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
          const terms = prompt.toLowerCase().split(/\s+/).filter(Boolean);
          terms.forEach((t: string) => {
            if (c.title.toLowerCase().includes(t) || c.human_summary.toLowerCase().includes(t)) {
              heuristicScore += 15;
            }
          });
        }
        return { ...c, reRankScore: Math.min(heuristicScore, 100) };
      }).sort((a, b) => b.reRankScore - a.reRankScore);

      selectedRecords = ranked.slice(0, 5);

      promptForClient = `You are the TSOT Research Moat Dilemma Solver. A user has asked you a question or presented a design dilemma regarding HCI research or AI compliance.

We have retrieved the top 5 relevant research or regulatory articles from our database to serve as your empirical backing:

${selectedRecords.map(r => `---
[${r.code}] (Title: ${r.title})
Key Finding/Text: ${r.human_summary}
Recommended Action: ${r.verdict}`).join('\n\n')}

---
USER DILEMMA / QUESTION:
"${prompt}"

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
    } else {
      return NextResponse.json({ error: `Unsupported tool "${tool}". Supported values: audit_eu_compliance, optimize_hci_design, query_research_moat.` }, { status: 400 });
    }

    // Call server-side LLM if Gemini instance is available
    let synthesizedResult: string | null = null;
    if (aiInstance) {
      try {
        const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
        const model = aiInstance.getGenerativeModel({ model: modelName });
        const geminiRes = await model.generateContent(promptForClient);
        synthesizedResult = geminiRes.response.text();
      } catch (err: any) {
        console.error('Server-side synthesis failed:', err);
        synthesizedResult = `[Server synthesis failed: ${err.message || err}]`;
      }
    }

    return NextResponse.json({
      success: true,
      tool,
      prompt: promptForClient,
      result: synthesizedResult,
      retrieved_records: selectedRecords.map(r => ({
        code: r.code,
        title: r.title,
        pillar: r.pillar,
        verdict: r.verdict
      }))
    });

  } catch (error: any) {
    console.error('REST API endpoint failed:', error);
    return NextResponse.json({ error: error.message || 'Internal server error occurred' }, { status: 500 });
  }
}
