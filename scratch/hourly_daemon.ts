import { createClient } from '@supabase/supabase-js';
import { fetchPapersFromOpenAlex } from '../lib/openalex/fetch';
import { ingestPapersBatch } from '../lib/gemini/ingest';

const BATCH_SIZE = 5;
const TARGET_INSERTED_PER_RUN = 60;
const ONE_HOUR_MS = 60 * 60 * 1000; // 3,600,000 ms

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

// Helper to shuffle the query list so we get a fair and diverse representation of pillars each run
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function runIngestionCycle() {
  console.log(`\n======================================================`);
  console.log(`⏰ [${new Date().toISOString()}] STARTING HOURLY INGESTION CYCLE`);
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
  
  // Shuffle queries to guarantee uniform/diverse pillar exploration
  const shuffledQueries = shuffleArray(QUERIES);
  
  try {
    for (const query of shuffledQueries) {
      if (insertedCount >= TARGET_INSERTED_PER_RUN) {
        break;
      }
      
      console.log(`\n🔍 Searching OpenAlex for query: "${query}"...`);
      const rawPapers = await fetchPapersFromOpenAlex(query, 30);
      console.log(`Found ${rawPapers.length} papers matching query.`);
      
      if (rawPapers.length === 0) continue;

      // De-duplicate: filter out titles that already exist in our registry
      const titles = rawPapers.map(p => p.title).filter(Boolean);
      const { data: existingRecords, error: fetchErr } = await supabase
        .from('registry')
        .select('title')
        .in('title', titles);
        
      if (fetchErr) {
        console.error('❌ Failed to query database for duplicates:', fetchErr);
        continue;
      }

      const existingTitles = new Set(existingRecords?.map(r => r.title) ?? []);
      const newPapers = rawPapers.filter(p => !existingTitles.has(p.title) && p.abstract);

      console.log(`Filtering duplicates: ${newPapers.length} new papers eligible for ingestion.`);
      if (newPapers.length === 0) continue;

      // Slice batch based on current progress towards the hourly limit
      const remainingTarget = TARGET_INSERTED_PER_RUN - insertedCount;
      const batchToProcess = newPapers.slice(0, Math.min(BATCH_SIZE, remainingTarget));
      
      console.log(`🤖 Sending batch of ${batchToProcess.length} papers to Gemini (${process.env.GEMINI_MODEL}) for synthesis...`);
      const results = await ingestPapersBatch(batchToProcess);
      console.log(`Gemini completed batch processing. Evaluating results...`);

      for (const item of results) {
        if (insertedCount >= TARGET_INSERTED_PER_RUN) {
          break;
        }

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
        });

        if (insertErr) {
          console.error('❌ Insert failed:', insertErr);
        } else {
          console.log(`✨ Inserted successfully as ${code}!`);
          insertedCount++;
        }
      }
    }
    
    console.log(`\n======================================================`);
    console.log(`🎉 Ingestion cycle complete!`);
    console.log(`✅ Successfully added ${insertedCount} new papers to the registry.`);
    console.log(`======================================================`);
  } catch (error) {
    console.error('❌ Ingestion run encountered an error:', error);
  }
}

// Continuous Daemon Loop Runner
async function startDaemon() {
  console.log(`======================================================`);
  console.log(`🤖 TSOT AUTOMATED HOURLY INGESTION DAEMON STARTED`);
  console.log(`⏳ Timer: 60 papers every 1 hour (3600s)`);
  console.log(`📡 Models: OpenAlex API + Gemini 3.1 Flash Lite`);
  console.log(`======================================================`);

  // Run immediately on startup
  await runIngestionCycle();

  console.log(`\n⏳ Next ingestion cycle scheduled in 1 hour (${new Date(Date.now() + ONE_HOUR_MS).toLocaleTimeString()})...`);
  
  // Set the hourly interval
  setInterval(async () => {
    try {
      await runIngestionCycle();
    } catch (err) {
      console.error('❌ Background daemon interval task failed:', err);
    }
    console.log(`\n⏳ Next ingestion cycle scheduled in 1 hour (${new Date(Date.now() + ONE_HOUR_MS).toLocaleTimeString()})...`);
  }, ONE_HOUR_MS);
}

startDaemon();
