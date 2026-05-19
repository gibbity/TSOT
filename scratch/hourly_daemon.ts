import { createClient } from '@supabase/supabase-js';
import { fetchPapersFromOpenAlex } from '../lib/openalex/fetch';
import { ingestPapersBatch } from '../lib/gemini/ingest';

const BATCH_SIZE = 8;
const TARGET_INSERTED_PER_RUN = 8;
const ONE_MINUTE_MS = 60 * 1000; // 60,000 ms

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
  
  // Shuffle queries to guarantee uniform/diverse pillar exploration
  const shuffledQueries = shuffleArray(QUERIES);
  
  try {
    // Load all existing titles and URLs once at startup of the cycle
    const { data: allExisting, error: fetchErr } = await supabase
      .from('registry')
      .select('title, source_url');
      
    if (fetchErr) {
      console.error('❌ Failed to load existing registry for duplicate checking:', fetchErr);
      return;
    }

    const existingNormalizedTitles = new Set(
      allExisting?.map(r => r.title.toLowerCase().trim().replace(/\s+/g, ' ')) ?? []
    );

    const existingUrls = new Set(
      allExisting?.map(r => r.source_url ? r.source_url.toLowerCase().trim() : '').filter(Boolean) ?? []
    );

    for (const query of shuffledQueries) {
      if (insertedCount >= TARGET_INSERTED_PER_RUN) {
        break;
      }
      
      console.log(`\n🔍 Searching OpenAlex for query: "${query}"...`);
      const rawPapers = await fetchPapersFromOpenAlex(query, 30);
      console.log(`Found ${rawPapers.length} papers matching query.`);
      
      if (rawPapers.length === 0) continue;

      // De-duplicate in memory using both 100% unique Source URL and normalized Title matching
      const newPapers = rawPapers.filter(p => {
        if (!p.title || !p.abstract) return false;
        
        // 1. Check by Source URL (DOI or landing page link)
        if (p.sourceUrl) {
          const normUrl = p.sourceUrl.toLowerCase().trim();
          if (existingUrls.has(normUrl)) return false;
        }

        // 2. Check by Title case-insensitively
        const normalized = p.title.toLowerCase().trim().replace(/\s+/g, ' ');
        return !existingNormalizedTitles.has(normalized);
      });

      console.log(`Filtering duplicates: ${newPapers.length} new papers eligible for ingestion.`);
      if (newPapers.length === 0) continue;

      // Slice batch based on current progress towards the minutely limit
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

        // Option A: pre-format methodology and threat_vector as structured markdown sections inside human_summary
        let formattedSummary = item.human_summary;
        if (item.methodology && item.methodology.trim() !== '') {
          formattedSummary += `\n\n**RESEARCH METHODOLOGY**\n${item.methodology.trim()}`;
        }
        if (item.threat_vector && item.threat_vector.trim() !== '') {
          formattedSummary += `\n\n**COGNITIVE THREAT VECTOR**\n${item.threat_vector.trim()}`;
        }

        console.log(`✍️ Inserting paper: "${item.title}" [${item.pillar}]`);
        const { error: insertErr } = await supabase.from('registry').insert({
          code,
          pillar: item.pillar,
          title: item.title,
          human_summary: formattedSummary,
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
          
          // Cache this title case-insensitively so we don't insert it again in subsequent query loops
          const normalized = item.title.toLowerCase().trim().replace(/\s+/g, ' ');
          existingNormalizedTitles.add(normalized);

          if (item.original.sourceUrl) {
            existingUrls.add(item.original.sourceUrl.toLowerCase().trim());
          }
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
  console.log(`🤖 TSOT AUTOMATED MINUTELY INGESTION DAEMON STARTED`);
  console.log(`⏳ Timer: 8 papers every 1 minute (60s)`);
  console.log(`📡 Models: OpenAlex API + Gemini 3.1 Flash Lite`);
  console.log(`======================================================`);

  // Run immediately on startup
  await runIngestionCycle();

  console.log(`\n⏳ Next ingestion cycle scheduled in 1 minute (${new Date(Date.now() + ONE_MINUTE_MS).toLocaleTimeString()})...`);
  
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
