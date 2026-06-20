import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

const PROGRESS_FILE = path.join(__dirname, 'quality_backfill_progress.json');

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase environment variables.');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, serviceRoleKey);

// Initialize Gemini API
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error('❌ Missing GEMINI_API_KEY.');
  process.exit(1);
}
const ai = new GoogleGenerativeAI(geminiApiKey);
const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const model = ai.getGenerativeModel({
  model: modelName,
  generationConfig: { responseMimeType: 'application/json' }
});

// Helper: load progress
function loadProgress(): Set<string> {
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
      return new Set(data);
    } catch {
      return new Set();
    }
  }
  return new Set();
}

// Helper: save progress
function saveProgress(progress: Set<string>) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(Array.from(progress), null, 2), 'utf8');
}

// Delay helper
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function fetchAllPapers() {
  let allPapers: any[] = [];
  let from = 0;
  const step = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('registry')
      .select('id, code, title, human_summary, verdict, pillar')
      .order('created_at', { ascending: true })
      .range(from, from + step - 1);

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      allPapers = allPapers.concat(data);
      from += step;
      if (data.length < step) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }
  return allPapers;
}

async function fetchAllAiActRecords() {
  const { data, error } = await supabase
    .from('ai_act')
    .select('id, code, title, human_summary, verdict, pillar');
  if (error) throw error;
  return data || [];
}

async function runWithConcurrencyLimit<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  const promises: Promise<void>[] = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const currentIndex = index++;
      const currentItem = items[currentIndex];
      if (currentItem) {
        try {
          await fn(currentItem);
        } catch (err) {
          console.error('Worker error:', err);
        }
      }
    }
  }

  for (let i = 0; i < Math.min(limit, items.length); i++) {
    promises.push(worker());
  }

  await Promise.all(promises);
}

async function evaluateQualityScore(record: any): Promise<number | null> {
  const prompt = `You are a strict data quality auditor for a research and compliance ledger.
Your job is to evaluate the quality of a record and assign a single quality score from 0 to 100.

Evaluate the record on these four dimensions:
1. Metric Specificity (Is there a concrete, quantitative metric? Or is it generic/vague?)
2. Verdict Actionability (Is the verdict a concrete design constraint or specific remedy? Or is it vague general advice?)
3. Pillar Confidence (How strongly does the summary and verdict relate to the assigned pillar/category?)
4. Clarity (Is the summary clear and well-structured?)

Record Details:
Code: ${record.code}
Title: ${record.title}
Pillar/Category: ${record.pillar}
Summary: ${record.human_summary}
Verdict: ${record.verdict}

Output rules:
1. Return ONLY a JSON object.
2. The JSON object must contain a single key "score" with an integer value from 0 to 100.
3. Be highly critical. If the metric is not specified or vague (like "metric not specified"), assign a low score (<60).
4. Output format must be EXACTLY:
{
  "score": 85
}`;

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);
      if (typeof parsed.score === 'number') {
        return Math.min(Math.max(Math.round(parsed.score), 0), 100);
      }
    } catch (err: any) {
      attempts++;
      console.warn(`⚠️ Warning: Failed to score ${record.code} on attempt ${attempts}: ${err.message || err}`);
      if (err.message?.includes('429') || err.message?.includes('quota')) {
        await delay(15000);
      } else {
        await delay(2000);
      }
    }
  }
  return null;
}

async function main() {
  console.log('📚 Fetching all papers from TSOT registry and AI Act...');
  
  let papers: any[] = [];
  let aiActs: any[] = [];
  try {
    papers = await fetchAllPapers();
    aiActs = await fetchAllAiActRecords();
  } catch (error) {
    console.error('❌ Failed to fetch records:', error);
    process.exit(1);
  }

  const allRecords = [...papers.map(p => ({ ...p, type: 'registry' })), ...aiActs.map(a => ({ ...a, type: 'ai_act' }))];
  console.log(`Total registry papers: ${papers.length}`);
  console.log(`Total AI Act records: ${aiActs.length}`);
  console.log(`Total records to audit: ${allRecords.length}`);

  const progress = loadProgress();
  console.log(`Already evaluated: ${progress.size} records`);

  const recordsToProcess = allRecords.filter(r => !progress.has(r.code));
  console.log(`Remaining records to evaluate: ${recordsToProcess.length}`);

  if (recordsToProcess.length === 0) {
    console.log('🎉 All records have been audited for quality scores!');
    return;
  }

  const startTime = Date.now();
  let count = 0;

  for (let index = 0; index < recordsToProcess.length; index++) {
    const record = recordsToProcess[index];
    console.log(`\n──────────────────────────────────────────────────`);
    console.log(`Auditing record [${index + 1}/${recordsToProcess.length}] (${record.code})`);

    const score = await evaluateQualityScore(record);
    if (score === null) {
      console.error(`❌ Failed to calculate quality score for ${record.code}`);
      // Wait a bit on error before next record
      await delay(10000);
      continue;
    }

    const table = record.type === 'registry' ? 'registry' : 'ai_act';
    const { error: updateError } = await supabase
      .from(table)
      .update({ quality_score: score })
      .eq('code', record.code);

    if (updateError) {
      console.error(`❌ Database update failed for ${record.code}:`, updateError);
    } else {
      console.log(`✅ ${record.code} scored: ${score}/100`);
      progress.add(record.code);
      count++;
    }

    // Save progress periodically
    if (count % 5 === 0) {
      saveProgress(progress);
    }

    const elapsedMin = ((Date.now() - startTime) / 60000).toFixed(2);
    const estRemainingMin = count > 0 ? (((Date.now() - startTime) / count) * (recordsToProcess.length - count) / 60000).toFixed(2) : 'N/A';
    console.log(`⏱️ Elapsed: ${elapsedMin}m | Est. Remaining: ${estRemainingMin}m`);

    // Safety delay to stay under the 15 requests per minute limit
    if (index < recordsToProcess.length - 1) {
      console.log(`💤 Delaying 4.5s for rate limits...`);
      await delay(4500);
    }
  }

  saveProgress(progress);
  console.log(`\n🎉 Corpus quality evaluation complete! Processed ${count} records.`);
}

main();
