import { createClient } from '@supabase/supabase-js';

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing credentials.');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Get total count
  const { count, error: countErr } = await supabase
    .from('registry')
    .select('*', { count: 'exact', head: true });
    
  console.log(`📊 DB Exact Count: ${count}`);

  // Fetch first 20 by ID
  const { data: firstById, error: err1 } = await supabase
    .from('registry')
    .select('id, code, title, created_at')
    .order('id', { ascending: true })
    .limit(20);

  // Fetch last 20 by ID
  const { data: lastById, error: err2 } = await supabase
    .from('registry')
    .select('id, code, title, created_at')
    .order('id', { ascending: false })
    .limit(20);

  if (err1 || err2) {
    console.error('❌ Error fetching extremes:', err1 || err2);
    return;
  }

  console.log('\n⬇️ FIRST 20 PAPERS BY ID:');
  firstById?.forEach(r => console.log(`ID: ${r.id} | Code: ${r.code} | Created: ${r.created_at} | Title: "${r.title.substring(0, 60)}..."`));

  console.log('\n⬆️ LAST 20 PAPERS BY ID:');
  lastById?.reverse().forEach(r => console.log(`ID: ${r.id} | Code: ${r.code} | Created: ${r.created_at} | Title: "${r.title.substring(0, 60)}..."`));
}

run();
