import { createClient } from '@supabase/supabase-js';

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing credentials.');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase
    .from('registry')
    .select('id')
    .order('id', { ascending: true });
    
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log('No records found.');
    return;
  }
  
  const minId = data[0].id;
  const maxId = data[data.length - 1].id;
  const totalRows = data.length;
  
  console.log(`📊 DB Record Stats:`);
  console.log(`- Minimum ID: ${minId}`);
  console.log(`- Maximum ID: ${maxId}`);
  console.log(`- Total active rows: ${totalRows}`);
  console.log(`- Total missing/deleted IDs: ${Number(maxId) - Number(minId) + 1 - totalRows}`);
}

run();
