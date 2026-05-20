import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

const PROGRESS_FILE = path.join(__dirname, 'backfill_progress.json');

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase environment variables.');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, serviceRoleKey);

// Initialize Gemini (using gemini-1.5-flash as default, fallback to 1.5-pro)
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error('❌ Missing GEMINI_API_KEY.');
  process.exit(1);
}
const ai = new GoogleGenerativeAI(geminiApiKey);

const modelName = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const model = ai.getGenerativeModel({
  model: modelName,
  generationConfig: {
    responseMimeType: 'application/json',
    temperature: 0.2,
  }
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

async function main() {
  console.log('📚 Fetching all papers from TSOT registry...');
  const { data: papers, error } = await supabase
    .from('registry')
    .select('id, code, title, human_summary, metric, verdict, pillar')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Failed to fetch registry:', error);
    process.exit(1);
  }

  console.log(`Total papers in database: ${papers.length}`);
  const progress = loadProgress();
  console.log(`Already processed: ${progress.size} papers`);

  let count = 0;

  for (const paper of papers) {
    if (progress.has(paper.code)) {
      continue;
    }

    console.log(`\n──────────────────────────────────────────────────`);
    console.log(`Processing [${count + 1}/${papers.length - progress.size}]: "${paper.title}" (${paper.code})`);

    const prompt = `
You are the elite editor for The Sign of Times (TSOT) ledger.
Your task is to refine and normalize an existing paper entry.

We need to:
1. Extract or generate a 1-2 sentence "methodology" explaining how the research was conducted (e.g. "Randomized controlled trial with 120 participants over 6 weeks" or "Meta-analysis of 34 studies"). If the current summary already contains a "**RESEARCH METHODOLOGY**" section, extract/refine it.
2. Extract or generate a 1-2 sentence "threat_vector" explaining the cognitive/behavioral mechanism at risk (e.g. "Automation bias eroding human oversight"). If the current summary already contains a "**COGNITIVE THREAT VECTOR**" section, extract/refine it.
3. Clean the existing human summary to strip out any existing '**RESEARCH METHODOLOGY**' or '**COGNITIVE THREAT VECTOR**' headings and text below them. The cleaned summary should be a cohesive plain text narrative (120-160 words).
4. Rewrite the "verdict" to be domain-specific. The verdict must match the paper's domain — if the paper is about radiologists, the verdict is for radiologists/clinicians; if it is about students/learning, the verdict is for educators/students; if it is about driving/piloting, it is for operators/drivers. Only use design terms like "builders should", "designers should", or "system architecture" if the paper is explicitly about human-computer UI/UX interaction design. Never default to design language if the paper is not about design. Keep it concrete, actionable, with specific numbers, thresholds, and conditions.

Input details:
Pillar: ${paper.pillar}
Title: ${paper.title}
Current Summary: ${paper.human_summary}
Metric: ${paper.metric}
Current Verdict: ${paper.verdict}

Return valid JSON matching this exact schema:
{
  "methodology": string,
  "threat_vector": string,
  "cleaned_summary": string,
  "verdict": string
}
`;

    let attempts = 0;
    const maxAttempts = 5;
    let success = false;

    while (attempts < maxAttempts && !success) {
      try {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        const responseText = result.response.text().trim();
        let cleanText = responseText;
        
        // Robust markdown wrapper cleaner
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.substring(7);
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.substring(3);
        }
        if (cleanText.endsWith('```')) {
          cleanText = cleanText.substring(0, cleanText.length - 3);
        }
        cleanText = cleanText.trim();

        let parsed;
        try {
          parsed = JSON.parse(cleanText);
        } catch (parseErr) {
          // Resilient recovery block
          const lastClose = cleanText.lastIndexOf('}');
          if (lastClose !== -1) {
            const truncated = cleanText.substring(0, lastClose + 1);
            parsed = JSON.parse(truncated);
          } else {
            throw parseErr;
          }
        }

        if (!parsed.methodology || !parsed.threat_vector || !parsed.cleaned_summary || !parsed.verdict) {
          throw new Error('Gemini returned an incomplete JSON response.');
        }

        // Re-format human summary with clean headings
        const newSummary = `${parsed.cleaned_summary.trim()}\n\n**RESEARCH METHODOLOGY**\n${parsed.methodology.trim()}\n\n**COGNITIVE THREAT VECTOR**\n${parsed.threat_vector.trim()}`;

        // Update database
        const { error: updateError } = await supabase
          .from('registry')
          .update({
            human_summary: newSummary,
            verdict: parsed.verdict.trim()
          })
          .eq('code', paper.code);

        if (updateError) {
          console.error(`❌ Database update failed for ${paper.code}:`, updateError);
          break; // break retry loop, move to next paper
        }

        console.log(`✅ Successfully backfilled paper "${paper.title}"!`);
        console.log(`   Methodology: ${parsed.methodology}`);
        console.log(`   Threat Vector: ${parsed.threat_vector}`);
        console.log(`   Verdict: ${parsed.verdict}`);

        progress.add(paper.code);
        saveProgress(progress);
        count++;
        success = true;

        // Wait 5.0 seconds between requests to maintain a safe 12 RPM (safely under 15 RPM cap)
        await delay(5000);

      } catch (err: any) {
        attempts++;
        const errMessage = err?.message || String(err);
        console.warn(`⚠️ Attempt ${attempts} failed for ${paper.code}: ${errMessage.substring(0, 300)}`);
        
        if (errMessage.includes('429') || errMessage.includes('quota') || errMessage.includes('Quota exceeded') || errMessage.includes('ResourceExhausted')) {
          console.warn(`🚀 Hit rate limit/quota. Waiting 45s for sliding rate limit window cooldown before retry...`);
          await delay(45000);
        } else {
          // Non-quota error, just wait a bit and retry
          await delay(5000);
        }
      }
    }

    if (!success) {
      console.error(`❌ Failed to process ${paper.code} after ${maxAttempts} attempts.`);
    }
  }

  console.log(`\n🎉 Backfill complete! Refined ${count} papers during this run.`);
}

main();
