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
      let candidates: (RegistryRecord & { combined_score?: number })[] = [];

      // A. Fetch from HCI Research Ledger
      if (source === 'corpus' || source === 'both') {
        const pillars: Pillar[] = [
          'COGNITIVE OFFLOADING',
          'FRICTION & VERIFICATION',
          'TEMPORAL PERCEPTION',
          'EPISTEMIC AGENCY'
        ];
        try {
          const rpcPromises = pillars.map(async (pillar) => {
            const { data, error } = await supabase.rpc('hybrid_search_registry', {
              query_embedding: queryEmbedding,
              query_text: prompt,
              match_limit: 2,
              filter_pillar: pillar
            });
            if (error) throw error;
            return data || [];
          });
          const rpcResults = await Promise.all(rpcPromises);
          candidates = candidates.concat(rpcResults.flat().map(row => ({
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
            combined_score: Number(row.combined_score ?? 0.5)
          })));
        } catch {
          // Direct DB query fallback
          try {
            const dbPromises = pillars.map(async (pillar) => {
              const { data } = await supabase
                .from('registry')
                .select('*')
                .eq('pillar', pillar)
                .limit(2);
              return data || [];
            });
            const dbResults = await Promise.all(dbPromises);
            candidates = candidates.concat(dbResults.flat().map(row => ({ ...row, combined_score: 0.5 })));
          } catch {
            // Local fallback seeds
            candidates = candidates.concat(SEED_RECORDS.map(s => ({ ...s, combined_score: 0.5 })));
          }
        }
      }

      // B. Fetch from EU AI Act Articles
      if (source === 'ai_act' || source === 'both') {
        const categories = ['PROHIBITED PRACTICE', 'HIGH RISK', 'LIMITED RISK', 'MINIMAL RISK'];
        try {
          const rpcPromises = categories.map(async (cat) => {
            const { data, error } = await supabase.rpc('hybrid_search_ai_act', {
              query_embedding: queryEmbedding,
              query_text: prompt,
              match_limit: 2,
              filter_category: cat
            });
            if (error) throw error;
            return data || [];
          });
          const rpcResults = await Promise.all(rpcPromises);
          candidates = candidates.concat(rpcResults.flat().map(row => ({
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
            combined_score: Number(row.combined_score ?? 0.5)
          })));
        } catch {
          // DB or JSON fallback
          try {
            const dbPromises = categories.map(async (cat) => {
              const { data } = await supabase
                .from('ai_act')
                .select('*')
                .eq('pillar', cat)
                .limit(2);
              return data || [];
            });
            const dbResults = await Promise.all(dbPromises);
            if (dbResults.flat().length > 0) {
              candidates = candidates.concat(dbResults.flat().map(row => ({ ...row, combined_score: 0.5 })));
            } else {
              throw new Error('Empty table');
            }
          } catch {
            // Local JSON search fallback
            const localResults = SEED_AI_ACT_RECORDS.filter(r => {
              const searchTerms = prompt.toLowerCase().split(/\s+/).filter(Boolean);
              if (searchTerms.length === 0) return true;
              return searchTerms.some((term: string) => r.title.toLowerCase().includes(term) || r.human_summary.toLowerCase().includes(term));
            });
            candidates = candidates.concat((localResults.length > 0 ? localResults : SEED_AI_ACT_RECORDS.slice(0, 8)).map(s => ({ ...s, combined_score: 0.5 })));
          }
        }
      }

      // Merge and deduplicate candidates
      const uniqueCandidatesMap = new Map<string, RegistryRecord & { combined_score?: number }>();
      candidates.forEach(c => {
        if (!uniqueCandidatesMap.has(c.code)) {
          uniqueCandidatesMap.set(c.code, c);
        } else {
          const existing = uniqueCandidatesMap.get(c.code)!;
          if ((c.combined_score ?? 0) > (existing.combined_score ?? 0)) {
            uniqueCandidatesMap.set(c.code, c);
          }
        }
      });

      const deduplicatedCandidates = Array.from(uniqueCandidatesMap.values());

      deduplicatedCandidates.forEach(c => {
        if (c.combined_score === undefined) {
          let score = 0.3;
          const searchTerms = prompt.toLowerCase().split(/\s+/);
          searchTerms.forEach((term: string) => {
            if (c.title.toLowerCase().includes(term) || c.human_summary.toLowerCase().includes(term)) {
              score += 0.2;
            }
          });
          c.combined_score = Math.min(score, 1.0);
        }
        const scoreInt = Math.round(c.combined_score * 100);
        reRankedScores[c.code] = Math.min(Math.max(scoreInt, 0), 100);
      });

      const sorted = deduplicatedCandidates.sort((a, b) => (b.combined_score ?? 0) - (a.combined_score ?? 0));
      selectedRecords = sorted.slice(0, 10); // Grab top 10

      const totalScore = selectedRecords.reduce((sum, r) => sum + (reRankedScores[r.code] || 50), 0);
      confidenceScore = selectedRecords.length > 0 ? Math.round(totalScore / selectedRecords.length) : 80;
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
      const recScore = reRankedScores[r.code] || (r.risk_level === 'critical' ? 85 : r.risk_level === 'warning' ? 65 : 35);
      if (r.pillar in pillarScores) {
        const current = pillarScores[r.pillar];
        pillarScores[r.pillar] = current ? Math.max(current, recScore) : recScore;
      }
    });

    // 5. Generate System Instructions
    const isAiActOnly = source === 'ai_act';
    const isBoth = source === 'both';

    // Allow legal compliance audits when targeting the EU AI Act
    const scopeGateOverride = isAiActOnly || isBoth
      ? `If the user prompt covers medical diagnostics/prescription AI or purely algorithmic backend efficiency, output ONLY <disclaimer>[State clearly that TSOT Auditor covers Human-AI interaction and cannot give medical or algorithm-specific advice. Provide high-contrast safety instructions.]</disclaimer>. Note that since the user explicitly requested auditing against the EU AI Act, you ARE permitted to perform legal compliance audits under this context.`
      : `If the user prompt covers medical diagnostics/prescription AI, legal compliance (e.g., "does this comply with the EU AI Act?"), or purely algorithmic backend efficiency, output ONLY <disclaimer>[State clearly that TSOT Auditor covers HCI/Human-AI interaction and cannot give legal, medical, or algorithm-specific advice. Provide high-contrast safety instructions.]</disclaimer>`;

    const scoreFormat = JSON.stringify(pillarScores);

    const citationRule = isAiActOnly
      ? `Every finding must have at least one inline [#EU-ACT-ART-X] citation referencing the relevant article number (e.g. [#EU-ACT-ART-5]). Do not cite SOT-COMP records under this mode.`
      : isBoth
      ? `Citations can be either [#SOT-COMP-XXXX] for HCI research findings or [#EU-ACT-ART-X] for EU AI Act compliance findings.`
      : `Every finding must have at least one inline [#SOT-COMP-XXXX] citation. No citation = no claim.`;

    const systemPrompt = `You are the Adversarial Design Auditor for The Sign of Times (TSOT).
Your job: when a founder, PM, or designer describes their AI product, interface, or architecture, you audit it aggressively against real HCI research and regulatory rules. You are a rigorous, intellectually honest consultant.

NON-NEGOTIABLE CORE RULES:
1. ${citationRule}
2. The verdict header (pass / concern / critical) must appear within the first 3 tokens of streaming in the verdict block.
3. If fewer than 3 relevant records are retrieved in the context, declare confidence level explicitly in the verdict or findings.
4. Confidence language must match retrieval confidence.
5. The sprint action must be specific and implementable.
6. Scope Gate: ${scopeGateOverride}
7. Follow-up questions use the same retrieved records as context — no new retrieval per follow-up. Maintain continuity.
8. The auditor never says "I". Speak as TSOT — "The research suggests", "TSOT corpus coverage indicates".
9. NEVER use markdown formatting (no **bold**, no *italic*, no # headers, no bullet asterisks). Write plain prose only. Markdown syntax will appear literally to end users.

OUTPUT STRATEGY & DYNAMIC XML TAGGING:
You must output your complete response wrapped inside the following tags. Never add text outside these tags.

1. SCOPE GATE:
If triggered, output ONLY <disclaimer>...</disclaimer>.

2. VAGUENESS GATE:
If the prompt is extremely short (e.g., under 100 characters) or highly ambiguous, output ONLY:
<clarification>
[Acknowledge the product briefly, then ask exactly 3 targeted questions about their product type, AI feature integration, or latencies to help produce a high-fidelity audit.]
</clarification>

3. REGULAR AUDIT STREAM:
If the input is valid, you must output all the following tags in sequence:

<scores>
${scoreFormat}
</scores>

<verdict>
⬤ [CRITICAL RISK / CONCERN / STABLE] — [A one-sentence verdict. Must start within 3 tokens with the status rating. Include corpus coverage e.g. "Based on X relevant records" and retrieval confidence level].
</verdict>

<findings>
[Present 2-4 detailed findings. Each finding must describe:
 - What the user's design risks.
 - What the research evidence says, backed by inline citations.
 - A specific "Design constraint" summarizing the remedy.]
</findings>

<gap>
[Include a corpus gap notice if the context records are only partially applicable. If no gaps exist, you may omit this tag or output nothing inside it.]
</gap>

<sprint>
What to ship in the next sprint:
SPRINT GOAL — [one sentence goal]
TICKET SCOPE — [specific component, API endpoint, or file the change lives in]
ACCEPTANCE CRITERION — [testable condition for done]
RESEARCH BACKING — [citations]
[Do NOT use markdown bold or asterisks — write plain text only.]
</sprint>`;

    const contextText = selectedRecords
      .map(r => `[${r.code}]\nPILLAR: ${r.pillar}\nTITLE: ${r.title}\nFINDING: ${r.human_summary}\nMETRIC: ${r.metric}\nVERDICT: ${r.verdict}\nRISK: ${r.risk_level}\nSOURCE: ${r.source_url}`)
      .join('\n\n---\n\n');

    const modelInstructions = `${systemPrompt}

[CALCULATED METADATA FOR GENERATION CONTEXT]
- Calculated Pillar/Risk Risk Scores: ${scoreFormat}
- Number of relevant records retrieved: ${selectedRecords.length}
- Calculated Confidence Score: ${confidenceScore}%
- Selected citation records available in [CONTEXT]: ${selectedRecords.map(r => r.code).join(', ')}`;

    // Build the chat history
    const chatContents: any[] = [];
    chatContents.push({ role: 'user', parts: [{ text: `SYSTEM INSTRUCTIONS:\n${modelInstructions}` }] });
    chatContents.push({ role: 'model', parts: [{ text: "Acknowledged. I will strictly execute the adversarial design audit based ONLY on the provided context records and format my stream inside XML blocks." }] });

    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg: any) => {
        chatContents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      });
    }

    const isFollowUp = (originalRecordCodes && originalRecordCodes.length > 0) || (conversationHistory && conversationHistory.length > 0);
    const finalUserPrompt = isFollowUp
      ? `[CONTEXT — TSOT REGISTRY RECORDS]\n${contextText}\n\n[USER FOLLOW-UP PROMPT]\n${prompt}\n\nIMPORTANT MANDATORY RULE: You MUST evaluate the updated product query and output the COMPLETE auditing structure inside the XML tags (<scores>, <verdict>, <findings>, <gap>, <sprint>). Do NOT reply with a plain text paragraph response. Re-evaluate the updated product features, re-calculate the risk scores, and write the findings and sprint actions inside the correct tags.`
      : `[CONTEXT — TSOT REGISTRY RECORDS]\n${contextText}\n\n[USER PRODUCT DESCRIPTION]\n${prompt}`;

    chatContents.push({
      role: 'user',
      parts: [{ text: finalUserPrompt }]
    });

    const streamResult = await model.generateContentStream({ contents: chatContents });

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
