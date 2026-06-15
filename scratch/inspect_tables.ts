import { createClient } from '@supabase/supabase-js';

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing credentials.');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Since we cannot run raw SQL directly through supabase-js unless we have an RPC, 
  // let's try querying standard tables that might exist.
  const commonTables = ['registry', 'papers', 'raw_papers', 'documents', 'ingested_papers', 'threats', 'threat_sign_of_times'];
  
  for (const table of commonTables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.log(`Table '${table}' not accessible/not found: ${error.message}`);
    } else {
      console.log(`📊 Table '${table}' count: ${count}`);
    }
  }

  // Let's also check if we can query pg_catalog using an RPC or if there are custom functions
  const { data: functions, error: fnErr } = await supabase.rpc('get_tables');
  if (fnErr) {
    console.log(`Could not call custom rpc 'get_tables': ${fnErr.message}`);
  } else {
    console.log(`Found tables list via RPC:`, functions);
  }
}

run();
