import { createClient } from '@supabase/supabase-js';
import { fetchPapersFromOpenAlex } from '../lib/openalex/fetch';
import { ingestPapersBatch } from '../lib/gemini/ingest';

// We process a max of 4 papers per API call to prevent Gemini's JSON output from truncating!
const BATCH_SIZE = 4;
const TARGET_INSERTED_PER_RUN = 8;
const ONE_MINUTE_MS = 60 * 1000; // 60,000 ms

const globalPaperQueue: any[] = [];

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

function generateRandomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SOT-${result}`;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Gemini rate limiter: enforce min 4.5s between calls (≈13 RPM, safely under 15 RPM cap)
let lastGeminiCallTime = 0;
async function throttledIngest(papers: any[]) {
  const now = Date.now();
  const elapsed = now - lastGeminiCallTime;
  const MIN_GAP_MS = 4500;
  if (elapsed < MIN_GAP_MS) {
    const wait = MIN_GAP_MS - elapsed;
    console.log(`⏱️  Rate-limiting: waiting ${wait}ms before next Gemini call...`);
    await new Promise(resolve => setTimeout(resolve, wait));
  }
  lastGeminiCallTime = Date.now();
  return ingestPapersBatch(papers);
}

async function runIngestionCycle() {
  console.log(`\n======================================================`);
  console.log(`⏰ [${new Date().toLocaleTimeString()}] STARTING MINUTELY INGESTION CYCLE`);
  console.log(`🎯 Target: Ingest exactly ${TARGET_INSERTED_PER_RUN} new papers...`);
  console.log(`======================================================`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from environment.');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  let insertedCount = 0;

  console.log(`\n📚 Fetching global database state to build strong deduplication verifier...`);
  const { data: globalRecords, error: globalErr } = await supabase.from('registry').select('title, source_url');
  if (globalErr) {
    console.error('❌ Failed to fetch global registry memory:', globalErr);
    return;
  }
  
  const existingUrls = new Set<string>();
  const existingNormalizedTitles = new Set<string>();
  
  for (const r of globalRecords || []) {
    if (r.source_url && r.source_url.trim() !== '') {
      existingUrls.add(r.source_url);
    }
    if (r.title) {
      existingNormalizedTitles.add(r.title.toLowerCase().trim().replace(/[^a-z0-9]/g, ''));
    }
  }
  
  console.log(`🛡️ Verifier armed with ${existingUrls.size} unique URLs and ${existingNormalizedTitles.size} normalized titles.`);

  // Clean existing queue against the fresh global memory blocklist
  const initialQueueSize = globalPaperQueue.length;
  const cleanQueue = [];
  for (const p of globalPaperQueue) {
    let isDup = false;
    if (p.sourceUrl && existingUrls.has(p.sourceUrl)) isDup = true;
    if (p.title) {
      const normTitle = p.title.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      if (existingNormalizedTitles.has(normTitle)) isDup = true;
    }
    if (!isDup) cleanQueue.push(p);
  }
  globalPaperQueue.length = 0;
  globalPaperQueue.push(...cleanQueue);
  if (initialQueueSize > cleanQueue.length) {
    console.log(`🧹 Cleaned ${initialQueueSize - cleanQueue.length} stale duplicates from the memory queue.`);
  }

  const shuffledQueries = shuffleArray(QUERIES);

  try {
    // Phase 1: Process from Queue if available
    let remainingTarget = TARGET_INSERTED_PER_RUN - insertedCount;
    if (globalPaperQueue.length > 0 && remainingTarget > 0) {
      const batchToProcess = globalPaperQueue.splice(0, Math.min(BATCH_SIZE, remainingTarget));
      console.log(`\n📦 Pulled ${batchToProcess.length} papers from the memory queue (Remaining in queue: ${globalPaperQueue.length})...`);
      
      const results = await throttledIngest(batchToProcess);
      console.log(`Gemini completed queue batch processing. Evaluating results...`);

      for (const item of results) {
        if (insertedCount >= TARGET_INSERTED_PER_RUN) break;
        if (!item.isRelevant) {
          console.log(`⏩ Skipping paper: "${item.title}" - Not marked relevant to TSOT pillars.`);
          continue;
        }
        if (!item.verdict) {
          console.log(`⏩ Skipping paper: "${item.title}" - Gemini returned no verdict.`);
          continue;
        }

        let code = generateRandomCode();
        let isUnique = false;
        let retries = 0;
        while (!isUnique && retries < 5) {
          const { data: codeCheck } = await supabase.from('registry').select('code').eq('code', code).single();
          if (!codeCheck) {
            isUnique = true;
          } else {
            code = generateRandomCode();
            retries++;
          }
        }

        const { error: insertErr } = await supabase.from('registry').insert({
          code,
          pillar: item.pillar,
          title: item.title,
          human_summary: item.human_summary + (item.methodology ? `\n\n**RESEARCH METHODOLOGY**\n${item.methodology}` : '') + (item.threat_vector ? `\n\n**COGNITIVE THREAT VECTOR**\n${item.threat_vector}` : ''),
          metric: item.metric,
          verdict: item.verdict,
          risk_level: item.risk_level,
          source_url: item.original.sourceUrl,
          source_type: 'peer-reviewed',
          paper_year: item.original.year,
          authors: item.original.authors,
        });

        if (insertErr) {
          console.error(`❌ Failed to insert ${code}:`, insertErr);
        } else {
          console.log(`✍️ Inserting paper: "${item.title}" [${item.pillar}]`);
          console.log(`✨ Inserted successfully as ${code}!`);
          insertedCount++;
        }
      }
    }

    // Phase 2: If we still need papers, hit OpenAlex and fill the queue
    remainingTarget = TARGET_INSERTED_PER_RUN - insertedCount;
    if (remainingTarget > 0) {
      for (const query of shuffledQueries) {
        if (insertedCount >= TARGET_INSERTED_PER_RUN) {
          break;
        }

        console.log(`\n🔍 Searching OpenAlex for query: "${query}"...`);
        const rawPapers = await fetchPapersFromOpenAlex(query, 30);
        console.log(`Found ${rawPapers.length} papers matching query.`);

        if (rawPapers.length === 0) continue;

        const newPapers = rawPapers.filter(p => {
          if (!p.abstract) return false;
          if (p.sourceUrl && existingUrls.has(p.sourceUrl)) return false;
          if (p.title) {
            const normTitle = p.title.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
            if (existingNormalizedTitles.has(normTitle)) return false;
          }
          return true;
        });

        console.log(`Filtering duplicates: ${newPapers.length} new papers eligible for ingestion.`);
        if (newPapers.length === 0) continue;

        // Add all eligible new papers to the queue so we never throw them away
        globalPaperQueue.push(...newPapers);
        
        // Take what we need for this cycle
        const batchToProcess = globalPaperQueue.splice(0, Math.min(BATCH_SIZE, TARGET_INSERTED_PER_RUN - insertedCount));

        console.log(`🤖 Sending batch of ${batchToProcess.length} papers to Gemini (${process.env.GEMINI_MODEL}) for synthesis (Remaining in queue: ${globalPaperQueue.length})...`);
        const results = await throttledIngest(batchToProcess);
        console.log(`Gemini completed batch processing. Evaluating results...`);

        for (const item of results) {
          if (insertedCount >= TARGET_INSERTED_PER_RUN) break;
          if (!item.isRelevant) {
            console.log(`⏩ Skipping paper: "${item.title}" - Not marked relevant to TSOT pillars.`);
            continue;
          }
          if (!item.verdict) {
            console.log(`⏩ Skipping paper: "${item.title}" - Gemini returned no verdict.`);
            continue;
          }

          let code = generateRandomCode();
          let isUnique = false;
          let retries = 0;
          while (!isUnique && retries < 5) {
            const { data: codeCheck } = await supabase.from('registry').select('code').eq('code', code).single();
            if (!codeCheck) {
              isUnique = true;
            } else {
              code = generateRandomCode();
              retries++;
            }
          }

          const { error: insertErr } = await supabase.from('registry').insert({
            code,
            pillar: item.pillar,
            title: item.title,
            human_summary: item.human_summary + (item.methodology ? `\n\n**RESEARCH METHODOLOGY**\n${item.methodology}` : '') + (item.threat_vector ? `\n\n**COGNITIVE THREAT VECTOR**\n${item.threat_vector}` : ''),
            metric: item.metric,
            verdict: item.verdict,
            risk_level: item.risk_level,
            source_url: item.original.sourceUrl,
            source_type: 'peer-reviewed',
            paper_year: item.original.year,
            authors: item.original.authors,
          });

          if (insertErr) {
            console.error(`❌ Failed to insert ${code}:`, insertErr);
          } else {
            console.log(`✍️ Inserting paper: "${item.title}" [${item.pillar}]`);
            console.log(`✨ Inserted successfully as ${code}!`);
            insertedCount++;
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Ingestion run encountered an error:', error);
  }
}

function startDaemon() {
  console.log('Initiating TSOT minutely daemon loop...');

  // Run immediately on startup
  runIngestionCycle().then(() => {
    console.log(`\n⏳ Next ingestion cycle scheduled in 1 minute (${new Date(Date.now() + ONE_MINUTE_MS).toLocaleTimeString()})...`);
  });

  // Set the 1 minute interval
  setInterval(async () => {
    try {
      await runIngestionCycle();
    } catch (err) {
      console.error('❌ Background daemon interval task failed:', err);
    }
    console.log(`\n⏳ Next ingestion cycle scheduled in 1 minute (${new Date(Date.now() + ONE_MINUTE_MS).toLocaleTimeString()})...`);
  }, ONE_MINUTE_MS);
}

startDaemon();
