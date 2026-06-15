import { createClient } from '@supabase/supabase-js';

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error('❌ Missing credentials.');
    return;
  }

  // Query using ANON key (subject to RLS)
  const supabaseAnon = createClient(supabaseUrl, anonKey);
  const { count: countAnon, error: errAnon } = await supabaseAnon
    .from('registry')
    .select('*', { count: 'exact', head: true });
    
  if (errAnon) {
    console.error('❌ Error getting anon count:', errAnon);
  } else {
    console.log(`📊 Anon key (RLS active) count: ${countAnon}`);
  }

  // Check the breakdown of premium vs free records using Service Role Key
  const supabaseService = createClient(supabaseUrl, serviceRoleKey);
  
  const { count: totalCount, error: errTotal } = await supabaseService
    .from('registry')
    .select('*', { count: 'exact', head: true });
    
  const { count: premiumCount, error: errPremium } = await supabaseService
    .from('registry')
    .select('*', { count: 'exact', head: true })
    .eq('is_premium', true);
    
  const { count: freeCount, error: errFree } = await supabaseService
    .from('registry')
    .select('*', { count: 'exact', head: true })
    .eq('is_premium', false);

  console.log(`📊 Service role key (bypass RLS) count: ${totalCount}`);
  console.log(`   - Premium records: ${premiumCount}`);
  console.log(`   - Free records: ${freeCount}`);
}

run();
