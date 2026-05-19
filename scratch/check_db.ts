import { createClient } from '@supabase/supabase-js';

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing credentials.');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase.from('registry').select('*');
  
  if (error) {
    console.error('❌ Error reading database:', error);
  } else {
    console.log(`📊 Found ${data?.length || 0} papers in the registry table:`);
    console.log(JSON.stringify(data, null, 2));
  }
}

run();
