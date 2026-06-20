import { createClient } from '@supabase/supabase-js';

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing credentials');
    return;
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  // Query information_schema via RPC or check if we get an error on standard query
  console.log('Querying registry table...');
  const r1 = await supabase.from('registry').select('id', { count: 'exact', head: true });
  console.log('registry:', r1);

  console.log('Querying ai_act table...');
  const r2 = await supabase.from('ai_act').select('id', { count: 'exact', head: true });
  console.log('ai_act:', r2);
}

run();
