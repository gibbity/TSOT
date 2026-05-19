import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchPapersFromOpenAlex } from '@/lib/openalex/fetch';
import { ingestPapersBatch } from '@/lib/gemini/ingest';

const BATCH_SIZE = 10; // Process in smaller chunks to prevent timeout

function generateRandomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SOT-${result}`;
}

export async function GET(req: NextRequest) {
  // Protect cron endpoint (check auth token)
  const authHeader = req.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  
  const QUERIES = [
    'human AI interaction cognitive load',
    'automation bias human computer interaction',
    'AI trust calibration user behavior',
    'large language model attention user study',
  ];

  let processed = 0;
  let inserted = 0;

  try {
    for (const query of QUERIES) {
      const rawPapers = await fetchPapersFromOpenAlex(query, 15);
      
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

      // Process in smaller batches
      for (let i = 0; i < newPapers.length; i += BATCH_SIZE) {
        const batch = newPapers.slice(i, i + BATCH_SIZE);
        const results = await ingestPapersBatch(batch);

        for (const item of results) {
          if (!item.isRelevant) continue;

          // Generate a unique non-colliding code
          let code = generateRandomCode();
          let isUnique = false;
          let retries = 0;
          
          while (!isUnique && retries < 5) {
            const { data } = await supabase
              .from('registry')
              .select('code')
              .eq('code', code)
              .single();
              
            if (!data) {
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
            source_type: item.source_type,
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
        processed += batch.length;
      }
    }

    return NextResponse.json({ success: true, processed, inserted });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
