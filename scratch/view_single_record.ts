import { createClient } from '@supabase/supabase-js';

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await supabase
    .from('registry')
    .select('*')
    .eq('code', 'SOT-YSGUGR')
    .single();

  console.log('Record SOT-YSGUGR:', data);
}

run();
