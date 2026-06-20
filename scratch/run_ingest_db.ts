import { createClient } from '@supabase/supabase-js';
import { fetchPapersFromOpenAlex } from '../lib/openalex/fetch';
import { ingestPapersBatch } from '../lib/gemini/ingest';
import { GoogleGenerativeAI } from '@google/generative-ai';

const BATCH_SIZE = 5;

async function generatePaperQualityScore(code: string, pillar: string, title: string, summary: string, verdict: string): Promise<number> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    console.error('❌ Missing GEMINI_API_KEY for quality score evaluation.');
    return 80;
  }
  
  try {
    const ai = new GoogleGenerativeAI(geminiApiKey);
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const model = ai.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `You are a strict data quality auditor for a research and compliance ledger.
Your job is to evaluate the quality of a record and assign a single quality score from 0 to 100.

Evaluate the record on these four dimensions:
1. Metric Specificity (Is there a concrete, quantitative metric? Or is it generic/vague?)
2. Verdict Actionability (Is the verdict a concrete design constraint or specific remedy? Or is it vague general advice?)
3. Pillar Confidence (How strongly does the summary and verdict relate to the assigned pillar/category?)
4. Clarity (Is the summary clear and well-structured?)

Record Details:
Code: ${code}
Title: ${title}
Pillar/Category: ${pillar}
Summary: ${summary}
Verdict: ${verdict}

Output rules:
1. Return ONLY a JSON object.
2. The JSON object must contain a single key "score" with an integer value from 0 to 100.
3. Be highly critical. If the metric is not specified or vague (like "metric not specified"), assign a low score (<60).
4. Output format must be EXACTLY:
{
  "score": 85
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);
    if (typeof parsed.score === 'number') {
      return Math.min(Math.max(Math.round(parsed.score), 0), 100);
    }
  } catch (err) {
    console.error('❌ Failed to generate quality score for paper:', err);
  }
  return 80;
}

function generateRandomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SOT-${result}`;
}

async function run() {
  console.log('🚀 Starting Full Ingestion Pipeline (OpenAlex ➡️ Gemini ➡️ Supabase)...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from environment.');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  const QUERIES = [
    '"cognitive offloading" "AI assistance"',
    '"automation bias" "human-AI"',
    '"prospective memory" "conversational agent"',
    '"productive friction" "trust calibration"',
    '"epistemic interruption" "user control"',
    '"response latency" streaming "attention"',
    '"temporal dynamics" AI "HCI"',
    '"epistemic agency" "source transparency"',
    '"provenance design" "information literacy"',
    '"cognitive anchoring" "belief formation" AI'
  ];

  let insertedCount = 0;
  
  try {
    for (const query of QUERIES) {
      if (insertedCount >= 5) {
        console.log('\n✅ Successfully ingested at least 5 papers! Stopping.');
        break;
      }
      
      console.log(`\n🔍 Searching OpenAlex for query: "${query}"...`);
      const rawPapers = await fetchPapersFromOpenAlex(query, 10);
      console.log(`Found ${rawPapers.length} papers.`);
      
      if (rawPapers.length === 0) continue;

      // Filter titles to prevent duplicates
      const titles = rawPapers.map(p => p.title).filter(Boolean);
      const { data: existingRecords, error: fetchErr } = await supabase
        .from('registry')
        .select('title')
        .in('title', titles);
        
      if (fetchErr) {
        console.error('❌ Failed to query database. Does the "registry" table exist? Please run schema.sql in Supabase SQL Editor first! Error details:', fetchErr);
        return;
      }

      const existingTitles = new Set(existingRecords?.map(r => r.title) ?? []);
      const newPapers = rawPapers.filter(p => !existingTitles.has(p.title) && p.abstract);

      console.log(`Filtering duplicates: ${newPapers.length} new papers eligible for ingestion.`);
      if (newPapers.length === 0) continue;

      // Batch ingest via Gemini
      const batch = newPapers.slice(0, Math.min(BATCH_SIZE, 5 - insertedCount));
      console.log(`🤖 Sending batch of ${batch.length} papers to Gemini (${process.env.GEMINI_MODEL}) for analysis and synthesis...`);
      
      const results = await ingestPapersBatch(batch);
      console.log(`Gemini completed batch. Processing ${results.length} results...`);

      for (const item of results) {
        if (!item.isRelevant) {
          console.log(`⏩ Skipping paper: "${item.title}" - Not marked relevant to TSOT pillars.`);
          continue;
        }

        // Generate dynamic unique code
        let code = generateRandomCode();
        let isUnique = false;
        let retries = 0;
        
        while (!isUnique && retries < 5) {
          const { data } = await supabase
            .from('registry')
            .select('code')
            .eq('code', code);
            
          if (!data || data.length === 0) {
            isUnique = true;
          } else {
            code = generateRandomCode();
            retries++;
          }
        }

        console.log(`🤖 Evaluating quality score for ${code}...`);
        const qualityScore = await generatePaperQualityScore(code, item.pillar, item.title, item.human_summary, item.verdict);

        console.log(`✍️ Inserting paper: "${item.title}" [${item.pillar}]`);
        const { error: insertErr } = await supabase.from('registry').insert({
          code,
          pillar: item.pillar,
          title: item.title,
          human_summary: item.human_summary,
          metric: item.metric,
          verdict: item.verdict,
          risk_level: item.risk_level,
          source_url: item.original.sourceUrl,
          source_type: item.source_type || 'peer-reviewed',
          paper_year: item.original.year,
          authors: item.original.authors,
          is_premium: false, // Ingest as public/free records for development visibility
          quality_score: qualityScore
        });

        if (insertErr) {
          console.error('❌ Insert failed:', insertErr);
        } else {
          console.log(`✨ Inserted successfully as ${code}!`);
          insertedCount++;
        }
        
        if (insertedCount >= 5) break;
      }
    }
    
    console.log(`\n🎉 Ingestion complete! Total papers inserted: ${insertedCount}`);
  } catch (error) {
    console.error('❌ Ingestion run encountered an error:', error);
  }
}

run();
