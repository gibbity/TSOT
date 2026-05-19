import { createClient } from '@supabase/supabase-js';
import { fetchPapersFromOpenAlex } from '../lib/openalex/fetch';
import { ingestPapersBatch } from '../lib/gemini/ingest';

const BATCH_SIZE = 5;

function generateRandomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SOT-${result}`;
}

async function run() {
  console.log('🚀 Starting targeted Attention & Ethics Ingestion Pipeline...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  const QUERIES = [
    '"response latency" streaming "attention"',
    '"temporal dynamics" AI "HCI"',
    '"epistemic agency" "source transparency"',
    '"provenance design" "information literacy"',
    '"cognitive anchoring" "belief formation" AI'
  ];

  let totalInserted = 0;
  
  try {
    for (const query of QUERIES) {
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
        console.error('❌ Failed to query database:', fetchErr);
        return;
      }

      const existingTitles = new Set(existingRecords?.map(r => r.title) ?? []);
      const newPapers = rawPapers.filter(p => !existingTitles.has(p.title) && p.abstract);

      console.log(`Filtering duplicates: ${newPapers.length} new papers eligible for ingestion.`);
      if (newPapers.length === 0) continue;

      // Process a small batch (up to 3 new papers per query to build a solid corpus)
      const batch = newPapers.slice(0, 3);
      console.log(`🤖 Sending batch of ${batch.length} papers to Gemini for analysis and synthesis...`);
      
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
          totalInserted++;
        }
      }
    }
    
    console.log(`\n🎉 Ingestion complete! Total new papers inserted: ${totalInserted}`);
  } catch (error) {
    console.error('❌ Ingestion run encountered an error:', error);
  }
}

run();
