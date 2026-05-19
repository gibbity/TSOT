import { createClient } from '@supabase/supabase-js';

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing credentials.');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase.from('registry').select('pillar');
  
  if (error) {
    console.error('❌ Error reading database:', error);
  } else {
    const counts: Record<string, number> = {};
    data?.forEach((row) => {
      counts[row.pillar] = (counts[row.pillar] || 0) + 1;
    });
    console.log('📊 Pillar counts in the database:', counts);
  }
}

run();
