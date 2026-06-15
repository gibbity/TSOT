import { createClient } from '@supabase/supabase-js';

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing credentials.');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  // 1. Get exact count using head: true
  const { count, error: countErr } = await supabase
    .from('registry')
    .select('*', { count: 'exact', head: true });
    
  if (countErr) {
    console.error('❌ Error getting count:', countErr);
  } else {
    console.log(`📊 Exact count via head: ${count}`);
  }

  // 2. Fetch everything with range queries to bypass any PostgREST 1000 limit
  let allRows: any[] = [];
  let from = 0;
  const step = 1000;
  let hasMore = true;
  
  while (hasMore) {
    const to = from + step - 1;
    const { data, error } = await supabase
      .from('registry')
      .select('id, title, code')
      .range(from, to);
      
    if (error) {
      console.error(`❌ Error fetching range ${from}-${to}:`, error);
      break;
    }
    
    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allRows = allRows.concat(data);
      console.log(`Fetched range ${from}-${to}: got ${data.length} rows`);
      if (data.length < step) {
        hasMore = false;
      } else {
        from += step;
      }
    }
  }
  
  console.log(`Total retrieved rows via pagination: ${allRows.length}`);
}

run();
