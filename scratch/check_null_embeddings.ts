import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Total count
  const { count: totalCount, error: totalErr } = await supabase
    .from('registry')
    .select('*', { count: 'exact', head: true });

  // Null count
  const { count: nullCount, error: nullErr } = await supabase
    .from('registry')
    .select('*', { count: 'exact', head: true })
    .is('embedding', null);

  if (totalErr || nullErr) {
    console.error('Error fetching counts:', totalErr || nullErr);
    return;
  }

  console.log(`Total records: ${totalCount}`);
  console.log(`Records with null embedding: ${nullCount}`);

  if (nullCount && nullCount > 0) {
    console.log('\n--- Latest 10 records missing embeddings ---');
    const { data: latestNulls, error: latestErr } = await supabase
      .from('registry')
      .select('code, title, created_at')
      .is('embedding', null)
      .order('created_at', { ascending: false })
      .limit(10);

    if (latestErr) {
      console.error('Error fetching latest nulls:', latestErr);
    } else {
      latestNulls?.forEach((r, idx) => {
        console.log(`[${idx + 1}] Code: ${r.code} | Created: ${r.created_at} | Title: ${r.title}`);
      });
    }

    console.log('\n--- Oldest 10 records missing embeddings ---');
    const { data: oldestNulls, error: oldestErr } = await supabase
      .from('registry')
      .select('code, title, created_at')
      .is('embedding', null)
      .order('created_at', { ascending: true })
      .limit(10);

    if (oldestErr) {
      console.error('Error fetching oldest nulls:', oldestErr);
    } else {
      oldestNulls?.forEach((r, idx) => {
        console.log(`[${idx + 1}] Code: ${r.code} | Created: ${r.created_at} | Title: ${r.title}`);
      });
    }
  }
}

run();
