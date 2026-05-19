import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchPapersFromOpenAlex } from '@/lib/openalex/fetch';
import { ingestPapersBatch } from '@/lib/gemini/ingest';

const BATCH_SIZE = 5;
const MAX_INSERTED_PER_INVOCATION = 5; // Stay safely within Vercel's 10-second serverless execution timeout

function generateRandomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SOT-${result}`;
}

// Fisher-Yates shuffle helper
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function GET(req: NextRequest) {
  // Protect cron endpoint (check auth secret passed by Vercel Cron automatically)
  const authHeader = req.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  
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

  // Shuffle queries so that each hourly serverless trigger explores a different random set of topics
  const shuffledQueries = shuffleArray(QUERIES);
  
  let processed = 0;
  let inserted = 0;

  try {
    for (const query of shuffledQueries) {
      if (inserted >= MAX_INSERTED_PER_INVOCATION) {
        break;
      }

      // Fetch a modest batch from OpenAlex to save execution time
      const rawPapers = await fetchPapersFromOpenAlex(query, 10);
      
      if (rawPapers.length === 0) continue;

      // 1. De-duplicate against database titles to prevent redundant ingestion
      const paperTitles = rawPapers.map(p => p.title).filter(Boolean);
      
      const { data: existingRecords } = await supabase
        .from('registry')
        .select('title')
        .in('title', paperTitles);
        
      const existingTitles = new Set(existingRecords?.map(r => r.title) ?? []);
      const newPapers = rawPapers.filter(p => !existingTitles.has(p.title) && p.abstract);

      if (newPapers.length === 0) continue;

      // Restrict batch size based on remaining target for this serverless run
      const remainingTarget = MAX_INSERTED_PER_INVOCATION - inserted;
      const batch = newPapers.slice(0, Math.min(BATCH_SIZE, remainingTarget));
      
      const results = await ingestPapersBatch(batch);
      processed += batch.length;

      for (const item of results) {
        if (inserted >= MAX_INSERTED_PER_INVOCATION) {
          break;
        }

        if (!item.isRelevant) continue;

        // Generate a unique non-colliding code
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

        const { error } = await supabase.from('registry').insert({
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
          is_premium: false,
        });

        if (!error) {
          inserted++;
        } else {
          console.error('Failed to insert record into Supabase:', error);
        }
      }
    }

    return NextResponse.json({ success: true, processed, inserted });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
