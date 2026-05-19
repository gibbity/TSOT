import { createClient } from '@supabase/supabase-js';

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing credentials.');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  console.log('🔄 Updating all registry papers to is_premium = false...');
  const { data, error } = await supabase
    .from('registry')
    .update({ is_premium: false })
    .neq('code', ''); // Updates all rows
    
  if (error) {
    console.error('❌ Error updating database:', error);
  } else {
    console.log('✅ All papers successfully updated to is_premium = false (free)!');
  }
}

run();
