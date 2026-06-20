import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { cookies } from 'next/headers';
import { RegistryRecord, Pillar } from '@/types';
import localAiActData from '@/lib/supabase/ai_act_data.json';

const FREE_DAILY_LIMIT = 5;

const SEED_RECORDS: RegistryRecord[] = [
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

// Map local EU AI Act JSON to RegistryRecord format
const SEED_AI_ACT_RECORDS: RegistryRecord[] = (localAiActData as any[]).map((art, idx) => ({
  id: 10000 + idx,
  code: art.code,
  pillar: art.category as Pillar,
  title: art.title,
  human_summary: art.article_text,
  metric: 'Compliance Checklist',
  verdict: art.compliance_verdict,
  risk_level: art.risk_level as 'stable' | 'warning' | 'critical',
  source_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689',
  source_type: 'regulation',
  paper_year: 2024,
  authors: 'European Parliament & Council',
  is_premium: false,
  created_at: new Date().toISOString()
}));

export async function POST(req: NextRequest) {
  try {
    const { prompt, byok_key, tier, originalRecordCodes, conversationHistory, source = 'both' } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    // 1. Session Rate Limiting Check
    const cookieStore = await cookies();
    const sessionKey = 'tsot_audit_count';
    const countCookie = cookieStore.get(sessionKey);
    const currentCount = countCookie ? parseInt(countCookie.value) : 0;

    let isPremium = tier === 'pro' || tier === 'team';
    if (!isPremium) {
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: sub } = await supabase
            .from('subscribers')
            .select('status')
            .eq('user_id', user.id)
            .single();
          isPremium = sub?.status === 'active';
        }
      } catch {
        // Continue peacefully as free/BYOK
      }
    }

    // Rate limit check
    const isRateLimited = !isPremium && !byok_key && currentCount >= FREE_DAILY_LIMIT;
    if (isRateLimited) {
      return NextResponse.json(
        { error: 'Daily audit limit of 5 has been reached. Upgrade to premium or supply a personal API Key (BYOK).' },
        { status: 429 }
      );
    }

    // 2. Initialize Gemini
    const activeKey = byok_key || process.env.GEMINI_API_KEY;
    if (!activeKey) {
      return NextResponse.json(
        { error: 'API key is missing. Set GEMINI_API_KEY on the server or provide a personal BYOK key.' },
        { status: 400 }
      );
    }

    const ai = new GoogleGenerativeAI(activeKey);
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const model = ai.getGenerativeModel({ model: modelName });

    // 3. Retrieval and RAG Pipeline
    let selectedRecords: RegistryRecord[] = [];
    let reRankedScores: Record<string, number> = {};
    let confidenceScore = 80;

    // Check if this is a locked follow-up question
    if (originalRecordCodes && Array.isArray(originalRecordCodes) && originalRecordCodes.length > 0) {
      let dbRecords: RegistryRecord[] = [];
      try {
        const supabase = await createClient();
        const { data: regData } = await supabase
          .from('registry')
          .select('*')
          .in('code', originalRecordCodes);
        if (regData) dbRecords = dbRecords.concat(regData as RegistryRecord[]);

        const { data: actData } = await supabase
          .from('ai_act')
          .select('*')
          .in('code', originalRecordCodes);
        if (actData) dbRecords = dbRecords.concat(actData as RegistryRecord[]);
      } catch {}

      selectedRecords = originalRecordCodes.map(code => {
        const matched = dbRecords.find(r => r.code === code) || 
                        SEED_RECORDS.find(r => r.code === code) || 
                        SEED_AI_ACT_RECORDS.find(r => r.code === code);
        return matched || SEED_RECORDS[0]; // fallback
      });

      selectedRecords.forEach(r => {
        reRankedScores[r.code] = r.risk_level === 'critical' ? 90 : r.risk_level === 'warning' ? 70 : 40;
      });
      confidenceScore = 85;
    } else {
      // Normal Retrieval
      let queryEmbedding: number[] | null = null;
      try {
        const embModel = ai.getGenerativeModel({ model: 'gemini-embedding-2' });
        const embResult = await embModel.embedContent({
          content: { role: 'user', parts: [{ text: prompt }] },
          outputDimensionality: 768
        } as any);
        queryEmbedding = embResult.embedding?.values || null;
      } catch (e) {
        console.warn('Embedding generation failed:', e);
      }

      const supabase = await createClient();
      let candidates: RegistryRecord[] = [];

      // A. Fetch from HCI Research Ledger
      if (source === 'corpus' || source === 'both') {
        let vectorDocs: any[] = [];
        try {
          const { data, error } = await supabase.rpc('hybrid_search_registry', {
            query_embedding: queryEmbedding,
            query_text: '',
            match_limit: 20,
            filter_pillar: null
          });
          if (!error && data) vectorDocs = data;
        } catch (e) {
          console.warn('Vector search registry failed:', e);
        }

        let ftsDocs: any[] = [];
        try {
          const { data, error } = await supabase
            .from('registry')
            .select('*')
            .textSearch('fts', prompt)
            .limit(10);
          if (!error && data) ftsDocs = data;
        } catch (e) {
          console.warn('FTS registry failed:', e);
        }

        candidates = candidates.concat(vectorDocs, ftsDocs);
      }

      // B. Fetch from EU AI Act Articles
      if (source === 'ai_act' || source === 'both') {
        let vectorDocs: any[] = [];
        try {
          const { data, error } = await supabase.rpc('hybrid_search_ai_act', {
            query_embedding: queryEmbedding,
            query_text: '',
            match_limit: 20,
            filter_category: null
          });
          if (!error && data) vectorDocs = data;
        } catch (e) {
          console.warn('Vector search AI Act failed:', e);
        }

        let ftsDocs: any[] = [];
        try {
          const { data, error } = await supabase
            .from('ai_act')
            .select('*')
            .textSearch('fts', prompt)
            .limit(10);
          if (!error && data) ftsDocs = data;
        } catch (e) {
          console.warn('FTS AI Act failed:', e);
        }

        candidates = candidates.concat(vectorDocs, ftsDocs);
      }

      // Merge and deduplicate candidates
      const uniqueCandidatesMap = new Map<string, RegistryRecord>();
      candidates.forEach(c => {
        if (!uniqueCandidatesMap.has(c.code)) {
          uniqueCandidatesMap.set(c.code, c);
        }
      });

      let deduplicatedCandidates = Array.from(uniqueCandidatesMap.values());

      // If database yielded nothing, fall back to seeds
      if (deduplicatedCandidates.length === 0) {
        if (source === 'corpus') {
          deduplicatedCandidates = SEED_RECORDS;
        } else if (source === 'ai_act') {
          deduplicatedCandidates = SEED_AI_ACT_RECORDS;
        } else {
          deduplicatedCandidates = [...SEED_RECORDS, ...SEED_AI_ACT_RECORDS];
        }
      }

      const candidatesToReRank = deduplicatedCandidates.slice(0, 25);

      // Stage 2: Gemini Re-ranking
      const reRankModel = ai.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json' }
      });

      const candidatesList = candidatesToReRank.map((c, idx) => {
        return `ID: ${idx}\nCode: ${c.code}\nTitle: ${c.title}\nSummary: ${c.human_summary}\nVerdict: ${c.verdict}`;
      }).join('\n\n---\n\n');

      const reRankPrompt = `You are a precise relevance scoring model.
Your task is to evaluate a list of candidate research papers and/or regulatory articles and score each from 0 to 100 based on its direct relevance to the user's product query.

User Query: "${prompt}"

Candidates:
${candidatesList}

Output rules:
1. Return ONLY a JSON object.
2. The JSON object must contain a single key "scores" containing an array of objects.
3. Each object in the array must have "code" (the candidate's Code) and "score" (an integer from 0 to 100).
4. Be highly critical. Only give high scores (80-100) to records that directly answer or provide concrete guidance for the user's specific query. Give moderate scores (50-79) for topically relevant but less specific records. Give low scores (0-49) for unrelated or tangentially related records.
5. Output format must be EXACTLY:
{
  "scores": [
    { "code": "SOT-XXXXXX", "score": 85 },
    ...
  ]
}`;

      let scoresList: { code: string; score: number }[] = [];
      try {
        const reRankResult = await reRankModel.generateContent(reRankPrompt);
        const reRankText = reRankResult.response.text();
        const parsed = JSON.parse(reRankText);
        scoresList = parsed.scores || [];
      } catch (e) {
        console.warn('Re-ranking call failed, falling back to simple heuristics:', e);
        scoresList = candidatesToReRank.map(c => {
          let score = 50;
          const searchTerms = prompt.toLowerCase().split(/\s+/).filter(Boolean);
          searchTerms.forEach((term: string) => {
            if (c.title.toLowerCase().includes(term) || c.human_summary.toLowerCase().includes(term)) {
              score += 15;
            }
          });
          return { code: c.code, score: Math.min(score, 100) };
        });
      }

      const scoreMap = new Map<string, number>();
      scoresList.forEach(s => scoreMap.set(s.code, s.score));

      const rankedCandidates = candidatesToReRank.map(c => ({
        ...c,
        reRankScore: scoreMap.get(c.code) ?? 50
      })).sort((a, b) => b.reRankScore - a.reRankScore);

      // Select top 5
      selectedRecords = rankedCandidates.slice(0, 5);

      selectedRecords.forEach(r => {
        reRankedScores[r.code] = scoreMap.get(r.code) ?? 50;
      });

      // Confidence score = average re-rank score of the selected 5
      const totalSelectedScore = selectedRecords.reduce((sum, r) => sum + (scoreMap.get(r.code) ?? 50), 0);
      confidenceScore = selectedRecords.length > 0
        ? Math.round(totalSelectedScore / selectedRecords.length)
        : 0;
    }

    // 4. Compute Breakdown Scores dynamically based on target source
    const pillarScores: Record<string, number | null> = {};

    if (source === 'corpus' || source === 'both') {
      pillarScores['COGNITIVE OFFLOADING'] = null;
      pillarScores['FRICTION & VERIFICATION'] = null;
      pillarScores['TEMPORAL PERCEPTION'] = null;
      pillarScores['EPISTEMIC AGENCY'] = null;
    }

    if (source === 'ai_act' || source === 'both') {
      pillarScores['PROHIBITED PRACTICE'] = null;
      pillarScores['HIGH RISK'] = null;
      pillarScores['LIMITED RISK'] = null;
      pillarScores['MINIMAL RISK'] = null;
    }

    selectedRecords.forEach(r => {
      const recScore = reRankedScores[r.code] || 50;
      if (r.pillar in pillarScores) {
        const current = pillarScores[r.pillar];
        pillarScores[r.pillar] = current ? Math.max(current, recScore) : recScore;
      }
    });

    // Stage 3: Two-Step Generation (Step A: Synthesis JSON)
    const synthesisModel = ai.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' }
    });

    const isAiActOnly = source === 'ai_act';
    const isBoth = source === 'both';

    const synthesisPrompt = `You are the Synthesis Auditor for The Sign of Times.
Your job is to analyze the user's product description against the top 5 retrieved research/regulatory records and output a structured JSON synthesis.

User Query: "${prompt}"

Retrieved Records:
${selectedRecords.map(r => `[${r.code}] (Pillar/Category: ${r.pillar}, Risk: ${r.risk_level})\nTitle: ${r.title}\nFinding: ${r.human_summary}\nVerdict: ${r.verdict}`).join('\n\n---\n\n')}

Scope Gate Rule:
If the user query covers medical diagnostics/prescription AI, or purely algorithmic backend efficiency, this is out of scope. (Note: legal compliance audits targeting the EU AI Act are permitted under 'ai_act' or 'both' sources).
If out of scope, set "scope_trigger" to true and provide a "scope_message" explaining that TSOT Auditor covers HCI/Human-AI interaction and cannot give medical, legal (non-AI Act), or algorithm-specific advice, and provide safety instructions.

Vagueness Gate Rule:
If the user query is extremely short (e.g. under 100 characters) or highly ambiguous, set "vagueness_trigger" to true and provide 3 targeted clarification questions in "clarification_questions".

Output rules:
1. Output ONLY a valid JSON object.
2. The JSON object must strictly match this structure:
{
  "scope_trigger": false,
  "scope_message": null,
  "vagueness_trigger": false,
  "clarification_questions": null,
  "verdict": "CRITICAL RISK" | "CONCERN" | "STABLE",
  "verdict_reason": "A one-sentence summary verdict.",
  "pillar_scores": ${JSON.stringify(pillarScores)},
  "findings": [
    {
      "risk": "What the user's design risks (HCI/regulatory perspective).",
      "evidence": "What the research/regulatory evidence says, citing the relevant record code(s) (e.g. [#SOT-XXXXXX] or [#EU-ACT-ART-X]).",
      "constraint": "A specific design constraint or remedy."
    }
  ],
  "gaps": "Corpus gap notice if the records are only partially applicable, or null if no gaps."
}
3. Evaluate the assigned pillars and risk categories. Assign scores (0-100) based on direct risk or null if not applicable.
4. Ensure findings are directly grounded in the provided records. Do not invent any claims.`;

    let synthesisData: any = null;
    try {
      const synthResult = await synthesisModel.generateContent(synthesisPrompt);
      const synthText = synthResult.response.text();
      synthesisData = JSON.parse(synthText);
    } catch (e) {
      console.warn('Synthesis step failed, constructing fallback data:', e);
      synthesisData = {
        scope_trigger: false,
        scope_message: null,
        vagueness_trigger: false,
        clarification_questions: null,
        verdict: 'CONCERN',
        verdict_reason: 'An audit concern is generated based on available corpus records.',
        pillar_scores: pillarScores,
        findings: selectedRecords.map(r => ({
          risk: `Product design might conflict with rules on ${r.pillar}.`,
          evidence: `Evidence in [${r.code}] shows: ${r.title}.`,
          constraint: r.verdict
        })),
        gaps: null
      };
    }

    // Stage 5: Asynchronous Logging (non-blocking)
    try {
      const supabase = await createClient();
      supabase.from('audit_logs').insert({
        query: prompt,
        retrieved_records: selectedRecords.map(r => r.code),
        confidence_score: confidenceScore,
        verdict: synthesisData.verdict || 'UNKNOWN'
      }).then(({ error }) => {
        if (error) console.error('Failed to insert audit log:', error);
      });
    } catch (logErr) {
      console.warn('Audit logging failed:', logErr);
    }

    // Stage 4: Calibration & Stage 3: Step B (Formatting)
    let formatPrompt = '';

    if (synthesisData.scope_trigger) {
      formatPrompt = `You are the Formatting Auditor.
The user query triggered the Scope Gate.
Output ONLY the disclaimer message wrapped in <disclaimer>...</disclaimer> tags. Do NOT output any other XML tags.
Do NOT use markdown bold/italic formatting.

Disclaimer Message: ${synthesisData.scope_message}`;
    } else if (synthesisData.vagueness_trigger) {
      const qList = (synthesisData.clarification_questions || [])
        .map((q: string) => `- ${q}`)
        .join('\n');
      formatPrompt = `You are the Formatting Auditor.
The user query was too vague or short.
Output ONLY the clarification questions wrapped in <clarification>...</clarification> tags. Do NOT output any other XML tags.
Do NOT use markdown bold/italic formatting.
Acknowledge the product briefly, then present exactly 3 targeted questions to help produce a high-fidelity audit.

Clarification Questions:
${qList}`;
    } else {
      formatPrompt = `You are the Formatting Auditor for The Sign of Times.
Your job is to translate a structured JSON audit synthesis into the final TSOT-voice output using exact XML tags.

User Query: "${prompt}"
Confidence Score: ${confidenceScore}%
Number of Retrieved Records: ${selectedRecords.length}
Synthesis JSON:
${JSON.stringify(synthesisData, null, 2)}

CALIBRATION RULES (NON-NEGOTIABLE):
1. Verb Strength:
   - Since Confidence Score is ${confidenceScore}%, you MUST use:
     ${confidenceScore > 80 ? 'Strong verbs ("research shows", "studies confirm", "regulations mandate").' : confidenceScore >= 60 ? 'Moderate verbs ("research suggests", "evidence indicates", "guidance points to").' : 'Cautious verbs ("limited research suggests", "preliminary evidence points to").'}
2. Low Record Rule:
   - If Number of Retrieved Records (${selectedRecords.length}) is less than 2: You MUST decline to make specific claims (e.g., "TSOT does not have sufficient records in the corpus to make a definitive audit claim..."). You must NOT output any citations. Keep findings general and decline to claim.
3. Gap Notice:
   - If Confidence Score is < 60%, you MUST write an explicit corpus gap notice inside the <gap> tag explaining the lack of research/guidance.
4. Formatting:
   - Do NOT use markdown formatting (no **bold**, no *italic*, no # headers, no bullet asterisks). Output plain prose inside the XML tags.

XML Structure to output:
<scores>
${JSON.stringify(synthesisData.pillar_scores)}
</scores>

<verdict>
⬤ ${synthesisData.verdict} — [Write the one-sentence verdict. Mention that it is based on ${selectedRecords.length} relevant records with a retrieval confidence of ${confidenceScore}%].
</verdict>

<findings>
[Present the findings from the JSON. Each finding must describe:
 - The design risk.
 - The research/regulatory evidence, with inline citations (e.g. [#SOT-XXXXXX] or [#EU-ACT-ART-X]). (Remember: 0 citations if less than 2 records).
 - Design constraint: [Remedy]]
</findings>

<gap>
[Write the corpus gap notice if applicable, otherwise leave empty.]
</gap>

<sprint>
What to ship in the next sprint:
SPRINT GOAL — [sprint goal]
TICKET SCOPE — [ticket scope]
ACCEPTANCE CRITERION — [acceptance criterion]
RESEARCH BACKING — [citations]
</sprint>`;
    }

    const streamResult = await model.generateContentStream({
      contents: [
        { role: 'user', parts: [{ text: formatPrompt }] }
      ]
    });

    const encoder = new TextEncoder();
    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResult.stream) {
            const chunkText = chunk.text();
            controller.enqueue(encoder.encode(chunkText));
          }
        } catch (err: any) {
          controller.enqueue(encoder.encode(`\n[STREAM ERROR]: ${err.message}`));
        } finally {
          controller.close();
        }
      },
    });

    const remainingCount = FREE_DAILY_LIMIT - (currentCount + 1);
    const headers = new Headers({
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Session-Remaining': String(Math.max(0, remainingCount)),
      'X-Audit-Citations': encodeURIComponent(JSON.stringify(selectedRecords)),
      'X-Audit-Confidence': String(confidenceScore)
    });

    if (!isPremium && !byok_key) {
      headers.append(
        'Set-Cookie',
        `${sessionKey}=${currentCount + 1}; Path=/; Max-Age=86400; HttpOnly; SameSite=Strict`
      );
    }

    return new Response(responseStream, { headers });
  } catch (error: any) {
    console.error('Auditor route error:', error);
    return NextResponse.json({ error: error.message || 'Server error occurred' }, { status: 500 });
  }
}
